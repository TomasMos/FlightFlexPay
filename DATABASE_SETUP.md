# Database Setup Guide for Splickets

This guide will walk you through setting up a PostgreSQL database for your Splickets application.

## Option 1: Neon (Cloud Database) - Recommended for Beginners

Neon is a free PostgreSQL database in the cloud. It's the easiest option and works perfectly with your code.

### Step 1: Create a Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account (you can use GitHub to sign in)
3. Create a new project
4. Choose a name for your project (e.g., "splickets-dev")
5. Select a region close to you

### Step 2: Get Your Database Connection String

1. After creating your project, Neon will show you a connection string
2. It will look something like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
3. **Copy this connection string** - you'll need it in the next step

### Step 3: Set Up Your .env File

1. In your project root, create a `.env` file (if it doesn't exist)
2. Add your database URL:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
   ```
   (Replace with your actual connection string from Neon)

### Step 4: Set Up the Database Schema

Run this command to create all the tables:

```bash
npm run db:push
```

This will create all the tables your app needs (users, bookings, flights, etc.)

### Step 5: Connect Beekeeper Studio to Neon

1. Open Beekeeper Studio
2. Click "New Connection" or the "+" button
3. Select "PostgreSQL" as the database type
4. Fill in the connection details:
   - **Host**: Extract from your connection string (e.g., `ep-xxx-xxx.us-east-2.aws.neon.tech`)
   - **Port**: `5432` (default PostgreSQL port)
   - **Database**: The database name from your connection string
   - **Username**: Your Neon username
   - **Password**: Your Neon password
   - **SSL Mode**: Select "Require" or "Prefer"
5. Click "Connect"

You should now see all your tables in Beekeeper Studio!

---

## Option 2: Local PostgreSQL Database

If you prefer to run PostgreSQL on your Mac, follow these steps:

### Step 1: Install PostgreSQL

Using Homebrew (recommended):

```bash
brew install postgresql@15
```

Or download from [postgresql.org](https://www.postgresql.org/download/macosx/)

### Step 2: Start PostgreSQL

```bash
brew services start postgresql@15
```

### Step 3: Create a Database

```bash
# Connect to PostgreSQL
psql postgres

# Create a database
CREATE DATABASE splickets;

# Create a user (optional, but recommended)
CREATE USER splickets_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE splickets TO splickets_user;

# Exit psql
\q
```

### Step 4: Set Up Your .env File

Create or update your `.env` file:

```env
DATABASE_URL=postgresql://splickets_user:your_secure_password@localhost:5432/splickets
```

(Replace `your_secure_password` with the password you set)

### Step 5: Set Up the Database Schema

```bash
npm run db:push
```

### Step 6: Connect Beekeeper Studio to Local Database

1. Open Beekeeper Studio
2. Click "New Connection"
3. Select "PostgreSQL"
4. Fill in:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `splickets`
   - **Username**: `splickets_user`
   - **Password**: Your password
   - **SSL Mode**: Disable
5. Click "Connect"

---

## Verifying Your Setup

After setting up either option, verify everything works:

1. **Check your .env file exists** and has `DATABASE_URL` set
2. **Run the migration**: `npm run db:push`
3. **Start your app**: `npm run dev`
4. **Check Beekeeper Studio** - you should see tables like:
   - `users`
   - `bookings`
   - `flights`
   - `payment_plans`
   - `installments`
   - `leads`
   - `flight_searches`
   - And more!

## Troubleshooting

### "DATABASE_URL environment variable is required"
- Make sure your `.env` file is in the project root
- Check that `DATABASE_URL` is spelled correctly
- Restart your terminal/IDE after creating `.env`

### Connection refused errors
- **Neon**: Check that your connection string is correct and includes `?sslmode=require`
- **Local**: Make sure PostgreSQL is running (`brew services list` to check)

### SSL errors with Neon
- Make sure your connection string includes `?sslmode=require` at the end

### Can't connect Beekeeper Studio
- Double-check your connection details
- For Neon: Make sure SSL is enabled
- For local: Make sure PostgreSQL is running

## Next Steps

Once your database is set up:
1. Your app will automatically create tables when you run `npm run db:push`
2. You can view and manage data in Beekeeper Studio
3. Your app will connect to the database automatically when you run `npm run dev`

## Need Help?

- Neon Documentation: https://neon.tech/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Beekeeper Studio Docs: https://docs.beekeeperstudio.io/

