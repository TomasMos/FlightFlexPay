import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  json,
  date,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for database constraints
export const tripTypeEnum = pgEnum("trip_type", [
  "one_way",
  "return",
  "multicity",
]);
export const leadStatusEnum = pgEnum("lead_status", [
  "in_progress",
  "abandoned",
  "converted",
]);
export const paymentPlanTypeEnum = pgEnum("payment_plan_type", [
  "full",
  "installments",
]);
export const installmentFrequencyEnum = pgEnum("installment_frequency", [
  "weekly",
  "bi_weekly",
  "monthly",
]);
export const paymentPlanStatusEnum = pgEnum("payment_plan_status", [
  "in_process",
  "completed",
  "defaulted",
]);
export const installmentStatusEnum = pgEnum("installment_status", [
  "unpaid",
  "paid",
  "overdue",
  "cancelled",
]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "payment_pending",
  "paid",
  "cancelled",
]);

// Flight searches table - tracks all search queries
export const flightSearches = pgTable("flight_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // nullable for anonymous
  sessionId: varchar("session_id", { length: 255 }), // for anonymous tracking
  originIata: varchar("origin_iata", { length: 3 }).notNull(),
  destinationIata: varchar("destination_iata", { length: 3 }).notNull(),
  departureDate: date("departure_date").notNull(),
  returnDate: date("return_date"), // nullable for one-way trips
  tripType: tripTypeEnum("trip_type").notNull(),
  passengerCount: integer("passenger_count").notNull(),
  cabin: varchar("cabin", { length: 50 }).default("Economy"),
  searchTimestamp: timestamp("search_timestamp").defaultNow(),
});

// Leads table - tracks potential customers
export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    diallingCode: varchar("dialling_code", { length: 10 }),
    phoneNumber: varchar("phone_number", { length: 20 }),
    title: varchar("title", { length: 10 }),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    dob: date("dob"), // nullable
    passportCountry: varchar("passport_country", { length: 3 }),
    status: leadStatusEnum("status").default("in_progress"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => {
    return {
      // Add the unique index here
      emailIdx: uniqueIndex("email_idx").on(table.email),
    };
  },
);

// Lead attempts table - tracks booking attempts
export const leadAttempts = pgTable("lead_attempts", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id")
    .references(() => leads.id)
    .notNull(),
  searchId: integer("search_id")
    .references(() => flightSearches.id)
    .notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow(),
  passengerData: json("passenger_data").notNull(), // JSON containing passenger details
});

// Users table for authenticated users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  diallingCode: varchar("dialling_code", { length: 10 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  title: varchar("title", { length: 10 }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  dob: date("dob"), // optional
  passportNumber: varchar("passport_number", { length: 50 }),
  passportCountry: varchar("passport_country", { length: 3 }),
  preferredCurrency: varchar("currency", { length: 3 }).notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Flights table for flight information
export const flights = pgTable("flights", {
  id: serial("id").primaryKey(),
  flightOffer: json("flight_offer").notNull(), // JSON - selectedFlight
  originIata: varchar("origin_iata", { length: 3 }).notNull(),
  destinationIata: varchar("destination_iata", { length: 3 }).notNull(),
  departureDate: date("departure_date").notNull(),
  returnDate: date("return_date"), // nullable for one-way trips
  tripType: tripTypeEnum("trip_type").notNull(),
  passengerCount: integer("passenger_count").notNull(),
  cabin: varchar("cabin", { length: 50 }).default("Economy"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment plans table
export const paymentPlans = pgTable("payment_plans", {
  id: serial("id").primaryKey(),
  type: paymentPlanTypeEnum("type").notNull(),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }), // nullable if type='full'
  installmentCount: integer("installment_count"), // nullable if type='full'
  installmentFrequency: installmentFrequencyEnum("installment_frequency"), // nullable if type='full'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: paymentPlanStatusEnum("status").default("in_process"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Installments table
export const installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  paymentPlanId: integer("payment_plan_id")
    .references(() => paymentPlans.id)
    .notNull(),
  dueDate: date("due_date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: installmentStatusEnum("status").default("unpaid"),
  paidAt: timestamp("paid_at"), // nullable
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  flightId: integer("flight_id")
    .references(() => flights.id)
    .notNull(),
  paymentPlanId: integer("payment_plan_id")
    .references(() => paymentPlans.id)
    .notNull(),
  passengers: json("passengers"), // JSON containing passenger details (nullable for existing bookings)
  status: bookingStatusEnum("status").default("payment_pending"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Flight search schema for API requests
export const flightSearchSchema = z.object({
  origin: z.string().min(3, "Origin is required"),
  destination: z.string().min(3, "Destination is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().optional(),
  passengers: z.number().min(1).max(9),
  tripType: z.enum(["return", "one_way", "multicity"]).default("return"),
  currency: z.string().length(3, "Currency must be a 3-letter code").default("USD"),
});

// Enhanced Amadeus-compatible flight structures
export interface FlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
    airportName: string;
    cityName: string;
    timeZoneOffset?: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
    airportName: string;
    cityName: string;
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
  cabin: string;
  includedCheckedBags?: {
    quantity?: number;
    weight?: number;
    weightUnit?: string;
  };
  includedCabinBags?: {
    quantity?: number;
    weight?: number;
    weightUnit?: string;
  };
  id: string;
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface EnhancedFlight {
  id: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  numberOfPassengers?: number;
  itineraries: FlightItinerary[];
  airlines: string[];
  pricingOptions?: {
    includedCheckedBagsOnly: boolean;
    refundableFare?: boolean;
    noPenaltyFare?: boolean;
  };
  price: {
    currency: string;
    total: string;
    base: string;
  };
}

export type EnhancedFlightWithPaymentPlan = EnhancedFlight & {
  paymentPlanEligible: boolean;
  paymentPlan?: {
    depositAmount: number;
    installmentAmount: number;
    installmentCount: number;
  };
};

// Zod schemas for validation
export const insertFlightSearchSchema = createInsertSchema(flightSearches);
export const selectFlightSearchSchema = createSelectSchema(flightSearches);
export const insertLeadSchema = createInsertSchema(leads);
export const selectLeadSchema = createSelectSchema(leads);
export const insertLeadAttemptSchema = createInsertSchema(leadAttempts);
export const selectLeadAttemptSchema = createSelectSchema(leadAttempts);
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertFlightSchema = createInsertSchema(flights);
export const selectFlightSchema = createSelectSchema(flights);
export const insertPaymentPlanSchema = createInsertSchema(paymentPlans);
export const selectPaymentPlanSchema = createSelectSchema(paymentPlans);
export const insertInstallmentSchema = createInsertSchema(installments);
export const selectInstallmentSchema = createSelectSchema(installments);
export const insertBookingSchema = createInsertSchema(bookings);
export const selectBookingSchema = createSelectSchema(bookings);

export type InsertFlightSearch = z.infer<typeof insertFlightSearchSchema>;
export type FlightSearch = z.infer<typeof selectFlightSearchSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = z.infer<typeof selectLeadSchema>;
export type InsertLeadAttempt = z.infer<typeof insertLeadAttemptSchema>;
export type LeadAttempt = z.infer<typeof selectLeadAttemptSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;
export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type Flight = z.infer<typeof selectFlightSchema>;
export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type PaymentPlan = z.infer<typeof selectPaymentPlanSchema>;
export type InsertInstallment = z.infer<typeof insertInstallmentSchema>;
export type Installment = z.infer<typeof selectInstallmentSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = z.infer<typeof selectBookingSchema>;
export type FlightSearchRequest = z.infer<typeof flightSearchSchema>;
