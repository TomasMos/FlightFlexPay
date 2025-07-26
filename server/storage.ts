import { type User, type InsertUser, type Flight, type InsertFlight, type Booking, type InsertBooking, type PaymentPlan, type InsertPaymentPlan } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Flight methods
  getFlight(id: string): Promise<Flight | undefined>;
  createFlight(flight: InsertFlight): Promise<Flight>;
  searchFlights(origin: string, destination: string, departureDate: string): Promise<Flight[]>;

  // Booking methods
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  updateBookingStatus(id: string, status: string): Promise<void>;

  // Payment plan methods
  getPaymentPlan(id: string): Promise<PaymentPlan | undefined>;
  getPaymentPlanByBooking(bookingId: string): Promise<PaymentPlan | undefined>;
  createPaymentPlan(paymentPlan: InsertPaymentPlan): Promise<PaymentPlan>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private flights: Map<string, Flight>;
  private bookings: Map<string, Booking>;
  private paymentPlans: Map<string, PaymentPlan>;

  constructor() {
    this.users = new Map();
    this.flights = new Map();
    this.bookings = new Map();
    this.paymentPlans = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Flight methods
  async getFlight(id: string): Promise<Flight | undefined> {
    return this.flights.get(id);
  }

  async createFlight(flight: InsertFlight): Promise<Flight> {
    const newFlight: Flight = { 
      ...flight,
      id: flight.id || randomUUID(),
      stops: flight.stops || 0,
      currency: flight.currency || 'USD',
      cabin: flight.cabin || 'ECONOMY',
      amenities: flight.amenities || null,
    };
    this.flights.set(newFlight.id, newFlight);
    return newFlight;
  }

  async searchFlights(origin: string, destination: string, departureDate: string): Promise<Flight[]> {
    return Array.from(this.flights.values()).filter(
      (flight) => 
        flight.origin === origin && 
        flight.destination === destination &&
        flight.departureTime.toISOString().split('T')[0] === departureDate
    );
  }

  // Booking methods
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const newBooking: Booking = { 
      ...booking, 
      id,
      createdAt: new Date(),
      status: booking.status || 'PENDING',
      paymentPlanEnabled: booking.paymentPlanEnabled || false,
      userId: booking.userId || null,
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async updateBookingStatus(id: string, status: string): Promise<void> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
    }
  }

  // Payment plan methods
  async getPaymentPlan(id: string): Promise<PaymentPlan | undefined> {
    return this.paymentPlans.get(id);
  }

  async getPaymentPlanByBooking(bookingId: string): Promise<PaymentPlan | undefined> {
    return Array.from(this.paymentPlans.values()).find(
      (plan) => plan.bookingId === bookingId
    );
  }

  async createPaymentPlan(paymentPlan: InsertPaymentPlan): Promise<PaymentPlan> {
    const id = randomUUID();
    const newPaymentPlan: PaymentPlan = { 
      ...paymentPlan, 
      id,
      createdAt: new Date(),
    };
    this.paymentPlans.set(id, newPaymentPlan);
    return newPaymentPlan;
  }
}

export const storage = new MemStorage();
