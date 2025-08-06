# FlightPay - Flight Booking with Payment Plans

## Overview
FlightPay is a modern flight booking application that allows users to search for flights and book them with flexible payment plans. The application enables customers to pay just 20% upfront and spread the remaining amount over installments, making travel more accessible.

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
The application uses four main tables:
- **users**: User authentication and profile data
- **flights**: Flight information including pricing, schedules, and availability
- **bookings**: User flight bookings with payment plan flags
- **paymentPlans**: Payment plan details with installment schedules

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

## Data Flow

### Flight Search Flow
1. User types in origin/destination with real-time autocomplete from Amadeus Airport API
2. System provides airport and city suggestions with IATA codes
3. Frontend validates input using Zod schema and sends IATA codes for search
4. Backend calls Amadeus Flight Offers API for flight data
5. Payment plan eligibility calculated for each flight
6. Enhanced flight data returned with payment plan information

### Booking Flow
1. User selects flight and payment option
2. Payment plan details calculated and displayed
3. Booking created in database with payment plan flag
4. Payment plan record created if installments selected

### External Service Integration
- **Amadeus API**: Flight search and booking data
- **Neon Database**: Serverless PostgreSQL hosting
- **Payment Processing**: Structured for future payment gateway integration

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