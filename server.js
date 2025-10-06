require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "img-src": ["'self'", 'data:'],
      "style-src": ["'self'", "'unsafe-inline'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "font-src": ["'self'", 'data:']
    }
  }
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const SESSION_SECRET = process.env.SESSION_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

if (!SESSION_SECRET) {
  if (isProduction) {
    console.error('FATAL: SESSION_SECRET environment variable is required in production');
    process.exit(1);
  }
  console.warn('WARNING: SESSION_SECRET not set. Using default for development only.');
}

app.use(session({
  secret: SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

function generateAccountNumber() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

function sendView(res, file) {
  res.sendFile(path.join(__dirname, 'views', file));
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

app.get('/', (req, res) => sendView(res, 'index.html'));
app.get('/login', (req, res) => sendView(res, 'login.html'));
app.get('/signup', (req, res) => sendView(res, 'signup.html'));

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  sendView(res, 'dashboard.html');
});

app.get('/balance', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  sendView(res, 'balance.html');
});

app.get('/deposit', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  sendView(res, 'deposit.html');
});

app.get('/withdraw', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  sendView(res, 'withdraw.html');
});

app.get('/transfer', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  sendView(res, 'transfer.html');
});

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, pin } = req.body;
    
    if (!name || !email || !password || !pin) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(pin, 10);
    let accountNumber;
    let unique = false;

    while (!unique) {
      accountNumber = generateAccountNumber();
      const check = await pool.query('SELECT * FROM users WHERE account_number = $1', [accountNumber]);
      if (check.rows.length === 0) unique = true;
    }

    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, account_number, pin_hash, balance) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, account_number, balance',
      [name, email, passwordHash, accountNumber, pinHash, 0]
    );

    const user = result.rows[0];
    req.session.userId = user.id;
    req.session.accountNumber = user.account_number;

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        accountNumber: user.account_number,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.userId = user.id;
    req.session.accountNumber = user.account_number;

    res.json({ 
      success: true,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        accountNumber: user.account_number,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, account_number, balance FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      name: user.full_name,
      email: user.email,
      accountNumber: user.account_number,
      balance: parseFloat(user.balance)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/deposit', requireAuth, async (req, res) => {
  try {
    const { amount, pin } = req.body;
    const amountNum = parseFloat(amount);

    if (!amount || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ error: 'Invalid PIN' });
    }

    // Verify PIN
    const userResult = await pool.query('SELECT pin_hash FROM users WHERE id = $1', [req.session.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pinHash = userResult.rows[0].pin_hash;
    if (!pinHash) {
      return res.status(400).json({ error: 'PIN not set. Please contact support.' });
    }

    const validPin = await bcrypt.compare(pin, pinHash);
    if (!validPin) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING account_number, balance',
        [amountNum, req.session.userId]
      );

      await client.query(
        'INSERT INTO transactions (from_account, to_account, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
        [userResult.rows[0].account_number, userResult.rows[0].account_number, amountNum, 'deposit', 'Deposit to account']
      );

      await client.query('COMMIT');

      res.json({ 
        success: true, 
        balance: parseFloat(userResult.rows[0].balance) 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Server error during deposit' });
  }
});

app.post('/api/withdraw', requireAuth, async (req, res) => {
  try {
    const { amount, pin } = req.body;
    const amountNum = parseFloat(amount);

    if (!amount || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ error: 'Invalid PIN' });
    }

    // Verify PIN
    const userResult = await pool.query('SELECT pin_hash FROM users WHERE id = $1', [req.session.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pinHash = userResult.rows[0].pin_hash;
    if (!pinHash) {
      return res.status(400).json({ error: 'PIN not set. Please contact support.' });
    }

    const validPin = await bcrypt.compare(pin, pinHash);
    if (!validPin) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        'SELECT account_number, balance FROM users WHERE id = $1 FOR UPDATE',
        [req.session.userId]
      );

      if (parseFloat(userResult.rows[0].balance) < amountNum) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      const updateResult = await client.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING balance',
        [amountNum, req.session.userId]
      );

      await client.query(
        'INSERT INTO transactions (from_account, to_account, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
        [userResult.rows[0].account_number, userResult.rows[0].account_number, amountNum, 'withdraw', 'Withdrawal from account']
      );

      await client.query('COMMIT');

      res.json({ 
        success: true, 
        balance: parseFloat(updateResult.rows[0].balance) 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ error: 'Server error during withdrawal' });
  }
});

app.post('/api/transfer', requireAuth, async (req, res) => {
  try {
    const { toAccount, amount, pin } = req.body;
    const amountNum = parseFloat(amount);

    if (!toAccount || !amount || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid transfer details' });
    }

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return res.status(400).json({ error: 'Invalid PIN' });
    }

    // Verify PIN
    const userResult = await pool.query('SELECT pin_hash FROM users WHERE id = $1', [req.session.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pinHash = userResult.rows[0].pin_hash;
    if (!pinHash) {
      return res.status(400).json({ error: 'PIN not set. Please contact support.' });
    }

    const validPin = await bcrypt.compare(pin, pinHash);
    if (!validPin) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const fromUserResult = await client.query(
        'SELECT account_number, balance FROM users WHERE id = $1 FOR UPDATE',
        [req.session.userId]
      );

      if (fromUserResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'User not found' });
      }

      const fromUser = fromUserResult.rows[0];

      if (fromUser.account_number === toAccount) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cannot transfer to your own account' });
      }

      if (parseFloat(fromUser.balance) < amountNum) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      const toUserResult = await client.query(
        'SELECT id FROM users WHERE account_number = $1 FOR UPDATE',
        [toAccount]
      );

      if (toUserResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Recipient account not found' });
      }

      await client.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [amountNum, req.session.userId]
      );

      await client.query(
        'UPDATE users SET balance = balance + $1 WHERE account_number = $2',
        [amountNum, toAccount]
      );

      await client.query(
        'INSERT INTO transactions (from_account, to_account, amount, transaction_type, description) VALUES ($1, $2, $3, $4, $5)',
        [fromUser.account_number, toAccount, amountNum, 'transfer', `Transfer from ${fromUser.account_number} to ${toAccount}`]
      );

      const updatedBalance = await client.query(
        'SELECT balance FROM users WHERE id = $1',
        [req.session.userId]
      );

      await client.query('COMMIT');

      res.json({ 
        success: true, 
        balance: parseFloat(updatedBalance.rows[0].balance) 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Server error during transfer' });
  }
});

app.get('/api/transactions', requireAuth, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT account_number FROM users WHERE id = $1',
      [req.session.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const accountNumber = userResult.rows[0].account_number;

    const result = await pool.query(
      'SELECT * FROM transactions WHERE from_account = $1 OR to_account = $1 ORDER BY created_at DESC LIMIT 50',
      [accountNumber]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use((req, res) => {
  res.status(404).send('<h1>404 - Page Not Found</h1>');
});

async function startServer() {
  try {
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Legacy Bank Systems running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
