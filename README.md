# Legacy Bank Systems

A secure, full-stack banking application built with Node.js, Express, and PostgreSQL. This project provides a complete banking experience with user authentication, PIN verification, and comprehensive transaction management.

## 🏦 Features

- **User Authentication**: Secure login/signup with password hashing
- **PIN Security**: 4-digit PIN verification for all financial transactions
- **Account Management**: View account balance and information
- **Transaction Operations**:
  - Deposit funds
  - Withdraw funds
  - Transfer money between accounts
- **Transaction History**: Complete audit trail of all transactions
- **Responsive Design**: Modern, vintage-themed UI with mobile support
- **Session Management**: Secure user sessions with proper logout

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database management system
- **bcrypt** - Password and PIN hashing
- **express-session** - Session management
- **helmet** - Security middleware
- **morgan** - HTTP request logger
- **dotenv** - Environment variable management

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Styling with flexbox and grid layouts
- **Vanilla JavaScript** - Client-side functionality
- **Responsive Design** - Mobile-first approach

### Database
- **PostgreSQL** - Primary database
- **Connection Pooling** - Efficient database connections
- **SSL Support** - Secure database connections

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_number VARCHAR(12) UNIQUE NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    from_account VARCHAR(12),
    to_account VARCHAR(12) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Bank
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/bank
SESSION_SECRET=your-super-secret-session-key
PORT=5000
```

### 4. Database Setup
The application will automatically create the required tables on first run. Ensure your PostgreSQL database is running and accessible.

### 5. Start the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:5000`

## 🔧 API Endpoints

### Authentication
- `POST /api/signup` - Create new user account
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### User Management
- `GET /api/user` - Get current user information

### Transactions
- `POST /api/deposit` - Deposit funds (requires PIN)
- `POST /api/withdraw` - Withdraw funds (requires PIN)
- `POST /api/transfer` - Transfer funds (requires PIN)
- `GET /api/transactions` - Get transaction history

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
- **PIN Verification**: 4-digit PIN required for all financial transactions
- **Session Security**: Secure session management with HTTP-only cookies
- **SQL Injection Protection**: Parameterized queries prevent SQL injection
- **HTTPS Ready**: SSL/TLS support for production deployments
- **Input Validation**: Server-side validation for all user inputs
- **CORS Protection**: Configured CORS policies

## 🎨 UI/UX Features

- **Vintage Banking Theme**: Classic, professional design
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Intuitive Navigation**: Consistent navigation across all pages
- **Real-time Feedback**: Immediate success/error messages
- **Accessibility**: ARIA labels and semantic HTML
- **Loading States**: User-friendly loading indicators

## 📱 Pages & Routes

- `/` - Home page with bank information
- `/login` - User login form
- `/signup` - User registration form
- `/dashboard` - User dashboard with account overview
- `/balance` - Account balance and information
- `/deposit` - Deposit funds form
- `/withdraw` - Withdraw funds form
- `/transfer` - Transfer funds form

## 🗄️ Database Relationships

```
USERS (1) ──── (N) TRANSACTIONS
  │
  └── account_number (FK)
      ├── from_account
      └── to_account
```

- One user can have multiple transactions
- Transactions reference user account numbers
- Self-referencing transactions for deposits/withdrawals

## 🔄 Transaction Types

1. **Deposit**: `from_account = to_account` (same account)
2. **Withdrawal**: `from_account = to_account` (same account)
3. **Transfer**: `from_account ≠ to_account` (different accounts)

## 🚀 Deployment

### Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on git push

### Manual Deployment
1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set secure session secret
4. Run `npm start`

## 🧪 Testing

Test the application by:
1. Creating a new account
2. Logging in with credentials
3. Testing deposit/withdraw/transfer operations
4. Verifying PIN security

## 📝 Development

### Project Structure
```
Bank/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── icons/
├── views/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── balance.html
│   ├── deposit.html
│   ├── withdraw.html
│   └── transfer.html
├── db.js
├── server.js
├── package.json
└── .env
```

### Key Files
- `server.js` - Main server file with all API routes
- `db.js` - Database connection and initialization
- `public/css/style.css` - Application styling
- `views/` - HTML templates for all pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Legacy Bank Systems** - Secure Banking Since 1965 🏦
