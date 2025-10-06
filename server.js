const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers with a relaxed CSP for serving local assets
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
app.use(express.static(path.join(__dirname, 'public')));

// Simple helpers to send static HTML pages from views
function sendView(res, file) {
  res.sendFile(path.join(__dirname, 'views', file));
}

app.get('/', (req, res) => sendView(res, 'index.html'));
app.get('/dashboard', (req, res) => sendView(res, 'dashboard.html'));
app.get('/login', (req, res) => sendView(res, 'login.html'));
app.get('/signup', (req, res) => sendView(res, 'signup.html'));
app.get('/balance', (req, res) => sendView(res, 'balance.html'));
app.get('/deposit', (req, res) => sendView(res, 'deposit.html'));
app.get('/withdraw', (req, res) => sendView(res, 'withdraw.html'));
app.get('/transfer', (req, res) => sendView(res, 'transfer.html'));

// Fallback 404
app.use((req, res) => {
  res.status(404).send('<h1>404 - Page Not Found</h1>');
});

app.listen(PORT, () => {
  console.log(`Legacy Bank Systems UI running on http://localhost:${PORT}`);
});


