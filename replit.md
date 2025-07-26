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
- **PaymentPlanService**: Calculates eligibility and payment schedules
- **Minimum Requirements**: $300 minimum booking, 45+ days before travel
- **Payment Structure**: 20% deposit, remaining amount split into installments
- **Schedule Generation**: Automatic payment date calculation based on travel date

## Data Flow

### Flight Search Flow
1. User enters search criteria (origin, destination, dates, passengers)
2. Frontend validates input using Zod schema
3. Backend calls Amadeus API service for flight data
4. Payment plan eligibility calculated for each flight
5. Enhanced flight data returned with payment plan information

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