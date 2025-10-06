# Legacy Bank Systems

## Overview

Legacy Bank Systems is a web-based banking application that provides secure account management, transaction processing, and fund transfers. Built with a vintage aesthetic theme ("Banking Since 1965"), the application offers users the ability to create accounts, manage balances, deposit/withdraw funds, and transfer money between accounts. The system emphasizes security with session-based authentication and password hashing.

## Recent Changes (October 2025)

- ✅ Implemented complete backend with PostgreSQL database
- ✅ Added 12-digit account number generation for all new users
- ✅ Built authentication system with bcrypt password hashing
- ✅ Implemented money transfer between users via account numbers
- ✅ Added transaction logging for all banking operations (deposit, withdraw, transfer)
- ✅ Implemented concurrency control with SELECT FOR UPDATE to prevent race conditions
- ✅ Configured for Railway deployment with proper environment variable handling
- ✅ Set up automatic database schema initialization
- ✅ Configured deployment with fail-fast security checks for production

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Static HTML with Vanilla JavaScript**
- Multi-page application using traditional server-rendered HTML pages
- No frontend framework dependencies (React, Vue, etc.)
- Client-side interactions handled with vanilla JavaScript (`public/js/app.js`)
- Vintage/retro design theme with custom CSS styling
- Pages include: home, login, signup, dashboard, balance view, deposit, withdraw, and transfer

**Design Pattern**: Server-side rendering with progressive enhancement through client-side scripts for dynamic interactions (form submissions, balance updates).

### Backend Architecture

**Node.js/Express Server**
- RESTful API endpoints for authentication and banking operations
- Session-based authentication using `express-session`
- Password security with `bcrypt` for hashing
- Security middleware: `helmet` for HTTP headers, `cookie-parser` for cookie handling
- Logging with `morgan` in development mode

**Key Endpoints Structure**:
- Authentication: `/signup`, `/login`, `/logout`
- Banking Operations: `/deposit`, `/withdraw`, `/transfer`, `/balance`
- Static pages served directly from `views/` directory

**Security Measures**:
- Content Security Policy (CSP) configured via Helmet
- HTTP-only session cookies
- Password hashing with bcrypt (10 salt rounds)
- Session secrets required in production (fail-fast if missing)
- SSL enforcement for external database connections
- Row-level locking (SELECT FOR UPDATE) prevents concurrent transaction conflicts
- Database transactions (BEGIN/COMMIT/ROLLBACK) ensure atomic operations
- Environment variables strictly enforced in production (NODE_ENV=production)

### Data Storage

**PostgreSQL Database**
- Primary database using `pg` (node-postgres) driver
- Connection pooling for efficient database connections
- Automatic table initialization on startup
- SSL support for production deployments (Railway/external hosts)

**Database Schema**:

*users table*:
- `id` (SERIAL PRIMARY KEY)
- `full_name` (VARCHAR 255)
- `email` (VARCHAR 255, UNIQUE) - used for login
- `password_hash` (VARCHAR 255) - bcrypt hashed passwords
- `account_number` (VARCHAR 12, UNIQUE) - auto-generated 12-digit identifier
- `balance` (DECIMAL 15,2) - account balance with precision
- `created_at` (TIMESTAMP)

*transactions table*:
- `id` (SERIAL PRIMARY KEY)
- `from_account` (VARCHAR 12, NOT NULL) - source account (same as to_account for deposits/withdrawals)
- `to_account` (VARCHAR 12, NOT NULL) - recipient account (same as from_account for deposits/withdrawals)
- `amount` (DECIMAL 15,2)
- `transaction_type` (VARCHAR 20) - deposit/withdraw/transfer
- `description` (TEXT)
- `created_at` (TIMESTAMP)

**Design Rationale**: PostgreSQL chosen for ACID compliance, robust transaction support, and decimal precision for financial calculations. Relational model ensures data integrity for banking operations.

### Authentication & Authorization

**Session-Based Authentication**:
- Server-side sessions stored in memory (express-session)
- Session cookie with 24-hour expiration
- No token-based (JWT) authentication - sessions provide simpler state management
- Logout clears server-side session

**Authorization Pattern**: Middleware checks for active session before allowing access to protected routes (dashboard, transactions).

### External Dependencies

**Third-Party NPM Packages**:
- `express` (v5.1.0) - Web framework
- `pg` (v8.16.3) - PostgreSQL client
- `bcrypt` (v6.0.0) - Password hashing
- `express-session` (v1.18.2) - Session management
- `helmet` (v8.1.0) - Security headers
- `morgan` (v1.10.1) - HTTP request logging
- `cookie-parser` (v1.4.7) - Cookie parsing
- `dotenv` (v17.2.3) - Environment variable management
- `nodemon` (v3.1.10) - Development auto-reload (dev dependency)

**External Services & Infrastructure**:
- Railway.app - Recommended deployment platform with PostgreSQL provisioning
- PostgreSQL Database - Can be hosted on Railway or any PostgreSQL provider
- Environment variables required:
  - `DATABASE_URL` - PostgreSQL connection string (required in production)
  - `SESSION_SECRET` - Session encryption key (required in production)
  - `NODE_ENV` - Environment indicator (production/development)
  - `PORT` - Server port (defaults to 5000)

**Deployment Considerations**: Application designed for Railway deployment with automatic PostgreSQL provisioning. Database tables auto-initialize on first run. SSL connections enforced for non-localhost database URLs.