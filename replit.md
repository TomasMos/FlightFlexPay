# Splickets - Flight Booking with Payment Plans

## Overview
Splickets is a modern flight booking application that allows users to search for flights and book them with flexible payment plans. The application enables customers to pay just 20% upfront and spread the remaining amount over installments, making travel more accessible.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
This is a full-stack web application built with a React frontend and Express.js backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

### Architecture Decisions:
- **Monorepo Structure**: Client, server, and shared code are organized in a single repository for easier development and deployment
- **TypeScript First**: Full TypeScript support across the entire stack for better type safety and developer experience
- **Modern React Stack**: Uses React 18 with hooks, React Query for state management, and Wouter for routing
- **Express.js Backend**: Lightweight and flexible Node.js backend framework
- **PostgreSQL + Drizzle**: Robust database with modern TypeScript ORM for type-safe database operations

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **TailwindCSS** for styling with shadcn/ui components
- **React Query** (@tanstack/react-query) for server state management
- **Wouter** for client-side routing
- **React Hook Form** with Zod validation for form handling
- **Airport Autocomplete** component with Amadeus API integration for city/airport search
- **Detailed Flight Modal** (itinerary-modal.tsx) with comprehensive flight information display

### Backend Architecture
- **Express.js** server with TypeScript
- **Drizzle ORM** for database operations
- **Neon Database** (@neondatabase/serverless) as PostgreSQL provider
- **Zod** for runtime type validation and schema validation
- **Session-based architecture** with PostgreSQL session storage

### Database Schema
The application uses eight main tables following the specification requirements:
- **flight_searches**: Tracks all flight search queries with session tracking for anonymous users
- **leads**: Captures potential customer information from passenger details form
- **lead_attempts**: Links booking attempts to leads and search sessions
- **users**: Registered users created from successful lead conversions
- **flights**: Complete flight data stored as JSON with metadata
- **payment_plans**: Payment plan configurations (full payment or installments)
- **installments**: Individual payment installment records with due dates
- **bookings**: Complete booking records linking users, flights, and payment plans

### Payment Plan System
- **Customizable Deposits**: Four deposit options (20%, 30%, 40%, 50%) with 30% default
- **Flexible Installments**: Weekly or bi-weekly payment schedules with dynamic calculations
- **Smart Scheduling**: Automatic payment date calculation ending 2 weeks before departure
- **Interactive Billing Plan**: Expandable accordion showing detailed installment schedule with dates and amounts
- **Real-time Calculations**: Dynamic updates based on flight total, selected deposit, and departure date

### Flight Modal System
- **Detailed Itinerary Display**: Comprehensive flight information modal following airline ticket design
- **Multi-Itinerary Support**: Separate sections for outbound and return flights
- **Collapsible Details**: Expandable flight segments with departure/arrival information
- **Flight Inclusions**: Baggage, flexibility, and refund policy information
- **Multiple Airline Handling**: Displays "Multiple Airlines" when flight uses different carriers
- **Select Button Integration**: "Select" button navigates to passenger details page with flight data

### Passenger Details System
- **Multi-Passenger Forms**: Dynamic passenger information collection for up to 6 passengers based on search criteria
- **Country Selection**: Comprehensive dropdown with 195+ countries for passport selection
- **Contact Details**: Email confirmation (no paste allowed), phone number with IP-based country detection
- **Price Breakdown**: Collapsible pricing section showing flight fare and taxes breakdown
- **Form Validation**: Comprehensive Zod-based validation for all passenger and contact fields
- **Data Persistence**: All passenger and contact details saved to localStorage when continuing
- **Routing Integration**: Seamless navigation from flight selection to passenger details (/flight-search/passenger-details/:flightId)

### Local Storage Integration
- **Search Persistence**: Flight search parameters automatically saved and restored on homepage
- **Passenger Data**: Complete passenger and contact information stored for booking process
- **Flight Selection**: Selected flight data persisted across page navigation

### Payment Plan Booking System
- **FlightBooking Component**: New comprehensive booking page at `/flight-search/book`
- **Deposit Selection**: Visual buttons for 20%, 30%, 40%, 50% deposit amounts
- **Installment Options**: Side-by-side comparison of weekly vs bi-weekly payment plans
- **Billing Plan Accordion**: Collapsible detailed view of all installment dates and amounts
- **Flight Summary Integration**: Persistent flight details and passenger information display
- **Navigation Flow**: Passenger Details → Payment Plan Selection → Booking Confirmation

### Email Communication System
- **MailerSend Integration**: Professional transactional email service for reliable email delivery
- **Booking Confirmations**: Automatic emails sent upon successful payment with detailed flight and payment plan information including account signup button
- **Welcome Emails**: Sent to new users when they complete their first booking
- **Payment Reminders**: Automated reminders for upcoming installment payments
- **Email Testing**: Development-only endpoint for testing all email types
- **Error Handling**: Graceful fallback when MailerSend is not configured

### Firebase Authentication System
- **Restricted Access**: Users can only sign in after completing a booking (booking-first requirement)
- **Email/Password Authentication**: Traditional signup with email and password validation
- **Google OAuth Integration**: Single sign-on with Google accounts
- **Account Linking**: Automatic linking of same email between different auth providers
- **Database Verification**: All auth attempts verified against users table before allowing access
- **Password Reset**: Secure password reset functionality with database verification
- **Mobile-Friendly**: Responsive sign-in page with professional Splickets branding
- **Session Management**: Firebase Auth sessions with PostgreSQL session storage
- **Profile Management**: User profile page with auth provider information and sign-out functionality
- **Navbar Integration**: Profile dropdown with authentication state management across all pages

## Data Flow

### Complete Customer Journey (According to Specification)
1. **Flight Search**: Every search is saved to `flight_searches` table with session tracking
2. **Passenger Details**: Contact and passenger information saved as `leads` with `lead_attempts`
3. **Payment Processing**: Successful payment converts lead to registered `users`
4. **Booking Creation**: Complete booking with flight data, payment plan, and installments created
5. **Lead Conversion**: Anonymous leads become registered users upon successful payment

### Flight Search Flow
1. User types in origin/destination with real-time autocomplete from Amadeus Airport API
2. System provides airport and city suggestions with IATA codes
3. Frontend validates input using Zod schema and sends IATA codes for search
4. **Database Tracking**: Flight search saved to database with session ID for anonymous tracking
5. Backend calls Amadeus Flight Offers API for flight data
6. Payment plan eligibility calculated for each flight
7. Enhanced flight data returned with payment plan information

### Lead Generation & Booking Flow
1. User selects flight and enters passenger details
2. **Lead Creation**: Contact and passenger data saved as lead with lead attempt record
3. User selects payment plan and processes payment
4. **Conversion**: Successful payment creates user account from lead data
5. **Complete Booking**: Flight, payment plan, installments, and booking records created
6. **Lead Status Update**: Lead marked as "converted" upon successful booking

### External Service Integration
- **Amadeus API**: Flight search and booking data
- **Neon Database**: Serverless PostgreSQL hosting
- **Stripe Payment Processing**: Complete payment intent and subscription handling
- **MailerSend Email Service**: Transactional emails for booking confirmations, welcome messages, and payment reminders

## External Dependencies

### Major Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **zod**: Runtime type validation
- **express**: Web framework for Node.js

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type system for JavaScript
- **PostCSS**: CSS processing tool
- **ESBuild**: JavaScript bundler for production builds

## Deployment Strategy

### Build Process
- **Development**: `npm run dev` starts both Vite dev server and Express backend
- **Production Build**: 
  - Frontend: Vite builds static assets to `dist/public`
  - Backend: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations managed via `npm run db:push`

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment setting (development/production)
- **Amadeus API**: Client ID and secret for flight data

### Hosting Considerations
- **Static Assets**: Frontend builds to standard web-servable directory
- **API Server**: Single Node.js process serving both API and static files
- **Database**: Compatible with any PostgreSQL provider
- **Session Storage**: Uses connect-pg-simple for PostgreSQL session storage

The application is designed for deployment on platforms like Replit, Vercel, or traditional hosting providers with Node.js and PostgreSQL support.