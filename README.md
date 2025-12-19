# FlightFlexPay

A modern flight booking application that allows users to search for flights and book them with flexible payment plans. Customers can pay just 20% upfront and spread the remaining amount over installments.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **PostgreSQL database** (Neon, Supabase, or any PostgreSQL provider)
- **Stripe account** (for payment processing)
- **Amadeus API credentials** (for flight search)
- **Firebase project** (for authentication - optional but recommended)
- **MailerSend account** (for emails - optional)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database

# Stripe (Required)
# For development, use test keys from Stripe Dashboard
STRIPE_SECRET_KEY_TEST=sk_test_...
# For production
STRIPE_SECRET_KEY=sk_live_...

# Amadeus API (Required for flight search)
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
# Or use production credentials
AMADEUS_PROD_CLIENT_ID=your_prod_client_id
AMADEUS_PROD_CLIENT_SECRET=your_prod_client_secret

# Firebase (Required for authentication and admin panel)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# Note: The private key should include \n characters for newlines

# Email Service (Optional - for sending booking confirmations)
MAILERSEND_API_KEY=your_mailersend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Application Settings (Optional)
PORT=5000
BASE_URL=http://localhost:5000
NODE_ENV=development

# Google Analytics (Optional - for frontend)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Set Up Database

Push the database schema to your PostgreSQL database:

```bash
npm run db:push
```

This will create all necessary tables using Drizzle ORM.

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000` (or the port specified in your `PORT` environment variable).

## Available Scripts

- `npm run dev` - Start the development server (both frontend and backend)
- `npm run build` - Build the application for production
- `npm run start` - Start the production server (requires build first)
- `npm run check` - Type-check the TypeScript code
- `npm run db:push` - Push database schema changes to your database

## Project Structure

```
FlightFlexPay/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React contexts
│   │   └── lib/        # Utility libraries
├── server/             # Express backend
│   ├── routes.ts       # API routes
│   ├── services/       # Business logic services
│   └── db.ts          # Database connection
├── shared/             # Shared TypeScript types and schemas
└── dist/               # Build output (generated)
```

## Environment Variables Explained

### Required Variables

- **DATABASE_URL**: PostgreSQL connection string. Format: `postgresql://user:password@host:port/database`
- **STRIPE_SECRET_KEY_TEST**: Stripe test mode secret key (get from Stripe Dashboard → Developers → API keys)
- **AMADEUS_CLIENT_ID** / **AMADEUS_CLIENT_SECRET**: Amadeus API credentials for flight search

### Optional but Recommended

- **FIREBASE_PRIVATE_KEY**: Required for Firebase authentication and admin panel features
- **MAILERSEND_API_KEY**: Required for sending booking confirmation emails
- **FROM_EMAIL**: Email address to send emails from (defaults to `no-reply@splickets.app`)

### Optional

- **PORT**: Server port (defaults to 5000)
- **BASE_URL**: Base URL for the application (defaults to `http://localhost:5000`)
- **VITE_GA_MEASUREMENT_ID**: Google Analytics measurement ID

## Getting API Keys

### Stripe
1. Sign up at [stripe.com](https://stripe.com)
2. Go to Dashboard → Developers → API keys
3. Copy your **Test** secret key (starts with `sk_test_`) for development
4. Copy your **Live** secret key (starts with `sk_live_`) for production

### Amadeus
1. Sign up at [developers.amadeus.com](https://developers.amadeus.com)
2. Create a new app
3. Copy your Client ID and Client Secret

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project or select existing one
3. Go to Project Settings → Service Accounts
4. Generate a new private key
5. Copy the private key value (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines)
6. Replace newlines with `\n` in your `.env` file

### MailerSend (Optional)
1. Sign up at [mailersend.com](https://www.mailersend.com)
2. Go to Settings → API Tokens
3. Create a new token and copy it

## Database Setup

The application uses **Drizzle ORM** with PostgreSQL. The database schema is defined in `shared/schema.ts`.

To set up your database:

1. Create a PostgreSQL database (you can use Neon, Supabase, or any PostgreSQL provider)
2. Set the `DATABASE_URL` environment variable
3. Run `npm run db:push` to create all tables

## Development Notes

- The frontend uses **Vite** for fast hot module replacement
- The backend uses **Express.js** with TypeScript
- Both frontend and backend run on the same port in development
- The app uses **session-based authentication** with PostgreSQL session storage
- Firebase is used for user authentication (email/password and Google OAuth)

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure your database is accessible from your network
- Check that SSL is properly configured if required

### Stripe Errors
- Make sure you're using test keys in development (`STRIPE_SECRET_KEY_TEST`)
- Verify your Stripe account is active
- Check that the Stripe publishable keys in `StripePaymentForm.tsx` match your account

### Firebase Authentication Issues
- Ensure `FIREBASE_PRIVATE_KEY` includes `\n` characters for newlines
- Verify your Firebase project settings match the config in `client/src/lib/firebase.ts`
- Check that Firebase Authentication is enabled in your Firebase Console

### Port Already in Use
- Change the `PORT` environment variable to a different port
- Or stop the process using port 5000

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Build the application: `npm run build`
3. Start the server: `npm run start`
4. Ensure all production environment variables are set
5. Use production Stripe keys (`STRIPE_SECRET_KEY`)
6. Use production Amadeus credentials if available

## License

MIT

