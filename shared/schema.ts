import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const flights = pgTable("flights", {
  id: varchar("id").primaryKey(),
  airline: text("airline").notNull(),
  flightNumber: text("flight_number").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  duration: text("duration").notNull(),
  stops: integer("stops").notNull().default(0),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default('USD'),
  cabin: text("cabin").notNull().default('ECONOMY'),
  availableSeats: integer("available_seats").notNull(),
  amenities: jsonb("amenities"),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  flightId: varchar("flight_id").references(() => flights.id).notNull(),
  passengerCount: integer("passenger_count").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentPlanEnabled: boolean("payment_plan_enabled").notNull().default(false),
  status: text("status").notNull().default('PENDING'), // PENDING, CONFIRMED, CANCELLED
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  travelDate: timestamp("travel_date").notNull(),
});

export const paymentPlans = pgTable("payment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).notNull(),
  installmentAmount: decimal("installment_amount", { precision: 10, scale: 2 }).notNull(),
  installmentCount: integer("installment_count").notNull(),
  schedule: jsonb("schedule").notNull(), // Array of payment dates and amounts
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFlightSchema = createInsertSchema(flights);

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({
  id: true,
  createdAt: true,
});

// Flight search schema
export const flightSearchSchema = z.object({
  origin: z.string().min(3, "Origin is required"),
  destination: z.string().min(3, "Destination is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().optional(),
  passengers: z.number().min(1).max(9),
  tripType: z.enum(["roundtrip", "oneway", "multicity"]).default("roundtrip"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type Flight = typeof flights.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type PaymentPlan = typeof paymentPlans.$inferSelect;

export type FlightSearch = z.infer<typeof flightSearchSchema>;



// Enhanced Amadeus-compatible flight structures
export interface FlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
    airportName?: string;
    cityName?: string;
    timeZoneOffset?: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
    airportName?: string;
    cityName?: string;
    timeZoneOffset?: string;
  };
  carrierCode: string;
  airline: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating?: {
    carrierCode: string;
  };
  duration: string;
  id: string;
  numberOfStops: number;
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface EnhancedFlight {
  id: string;
  source: string;
  lastTicketingDate?: string;
  numberOfBookableSeats: number;
  itineraries: FlightItinerary[];
  price: {
    currency: string;
    total: string;
    base: string;
  };
  
  // Additional data for modal
  pricingOptions?: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
    refundableFare?: boolean;
    noPenaltyFare?: boolean;
  };
  fareDetailsBySegment?: Array<{
    segmentId: string;
    cabin: string;
    fareBasis: string;
    class: string;
    includedCheckedBags: {
      quantity: number;
    };
    includedCabinBags?: {
      quantity: number;
    };
  }>;
  
  // Computed fields for display
  airlines: string[];
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  departureTimeZoneOffset?: string;
  arrivalTimeZoneOffset?: string;
  duration: string;
  stops: number;
  cabin: string;
  availableSeats: number;
  numberOfPassengers?: number;
}

export type EnhancedFlightWithPaymentPlan = EnhancedFlight & {
  paymentPlanEligible: boolean;
  paymentPlan?: {
    depositAmount: number;
    installmentAmount: number;
    installmentCount: number;
  };
};
