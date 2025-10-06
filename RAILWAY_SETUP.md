# Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- This repository pushed to GitHub

## Step 1: Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

## Step 2: Add PostgreSQL Database

1. In your Railway project dashboard, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically provision a PostgreSQL database
4. Note: The `DATABASE_URL` environment variable will be automatically added to your project

## Step 3: Configure Environment Variables

Railway will automatically set `DATABASE_URL`. You may also want to add:

- `SESSION_SECRET` - A random secret key for session encryption (e.g., generate with `openssl rand -base64 32`)
- `PORT` - Will be automatically set by Railway, but defaults to 5000 in the code

## Step 4: Deploy

1. Railway will automatically deploy your application
2. Your app will be available at the generated Railway URL
3. The database tables will be automatically created on first run

## Step 5: Access Your Application

1. Click on your deployment in Railway
2. Copy the generated URL
3. Visit the URL to access your banking application

## Database Schema

The application automatically creates the following tables:

### users
- `id` (SERIAL PRIMARY KEY)
- `full_name` (VARCHAR 255)
- `email` (VARCHAR 255, UNIQUE)
- `password_hash` (VARCHAR 255)
- `account_number` (VARCHAR 12, UNIQUE) - Auto-generated 12-digit number
- `balance` (DECIMAL 15,2)
- `created_at` (TIMESTAMP)

### transactions
- `id` (SERIAL PRIMARY KEY)
- `from_account` (VARCHAR 12)
- `to_account` (VARCHAR 12)
- `amount` (DECIMAL 15,2)
- `transaction_type` (VARCHAR 20)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

## Features

✅ User registration with auto-generated 12-digit account numbers  
✅ Secure login/logout with password hashing  
✅ View account balance  
✅ Deposit funds  
✅ Withdraw funds  
✅ Transfer money to other accounts using account numbers  
✅ Transaction history  

## Security Notes

- Passwords are hashed using bcrypt
- Session management with express-session
- Security headers with Helmet.js
- HTTPS recommended for production (Railway provides this automatically)

## Local Development

To run locally with a PostgreSQL database:

```bash
# Install dependencies
npm install

# Set up environment variables
export DATABASE_URL="postgresql://username:password@localhost:5432/bank"
export SESSION_SECRET="your-secret-key"

# Run the application
npm start
```

## Troubleshooting

- If database connection fails, check that `DATABASE_URL` is correctly set in Railway
- For login issues, ensure cookies are enabled in your browser
- Check Railway logs for detailed error messages
