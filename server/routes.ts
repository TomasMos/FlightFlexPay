import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { amadeusService } from "./services/amadeus";
import { PaymentPlanService } from "./services/paymentPlan";
import { StripeService } from "./services/stripe";
import {
  flightSearchSchema,
  EnhancedFlightWithPaymentPlan,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Flight search endpoint
  app.get("/api/flights/search", async (req, res) => {
    try {
      const searchParams = flightSearchSchema.parse({
        origin: req.query.origin,
        destination: req.query.destination,
        departureDate: req.query.departureDate,
        returnDate: req.query.returnDate,
        passengers: parseInt(req.query.passengers as string) || 1,
        tripType: req.query.tripType || "roundtrip",
      });

      const flights = await amadeusService.searchFlights(searchParams);

      // console.error(
      //   "routes.ts - 31 - Enhanced Flight Data:",
      //   JSON.stringify(flights, null, 2),
      // );

      // Transform enhanced flights to include payment plan information
      const flightsWithPaymentPlans: EnhancedFlightWithPaymentPlan[] =
        flights.map((flight) => {
          const travelDate = new Date(flight.departureTime);
          const totalBaseCost = parseFloat(flight.price.total);

          const paymentPlan = PaymentPlanService.calculatePaymentPlan(
            totalBaseCost,
            travelDate,
          );
          const perPersonFlightPrice = PaymentPlanService.calculateFlightPrice(
            totalBaseCost,
            travelDate,
          );

          return {
            ...flight,
            price: {
              ...flight.price,
              total: perPersonFlightPrice.flightPrice.toString(), // Per-person price with fees
            },
            paymentPlanEligible: paymentPlan.eligible,
            paymentPlan: paymentPlan.eligible
              ? {
                  depositAmount: paymentPlan.depositAmount!,
                  installmentAmount: paymentPlan.installmentAmount!,
                  installmentCount: paymentPlan.installmentCount!,
                }
              : undefined,
          };
        });

      // console.log(`routes.ts - 61 - Flights with Payment Plans:`, JSON.stringify(flightsWithPaymentPlans, null, 2))

      res.json({ flights: flightsWithPaymentPlans });
    } catch (error) {
      console.error("Flight search error:", error);
      res.status(400).json({
        message:
          error instanceof Error ? error.message : "Failed to search flights",
        flights: [],
      });
    }
  });

  // Airport suggestions endpoint
  app.get("/api/airports/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json({ airports: [] });
      }

      const airports = await amadeusService.getAirportSuggestions(query);
      res.json({ airports });
    } catch (error) {
      console.error("Airport search error:", error);
      res.status(500).json({
        message: "Failed to search airports",
        airports: [],
      });
    }
  });

  // Get detailed payment plan for a flight
  app.post("/api/payment-plan/calculate", async (req, res) => {
    try {
      const { flightId, passengers, travelDate } = req.body;

      // For demo purposes, use mock base cost since we're not storing flights
      // In a real implementation, you would fetch the flight from storage
      const mockBaseCost = 500;
      const baseCost = mockBaseCost * passengers;

      const paymentPlan = PaymentPlanService.calculatePaymentPlan(
        baseCost,
        new Date(travelDate),
      );

      res.json(paymentPlan);
    } catch (error) {
      console.error("Payment plan calculation error:", error);
      res.status(400).json({ message: "Failed to calculate payment plan" });
    }
  });

  // Create booking with optional payment plan
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = req.body;

      // Validate flight exists
      const flight = await storage.getFlight(bookingData.flightId);
      if (!flight) {
        return res.status(404).json({ message: "Flight not found" });
      }

      // Create booking
      const booking = await storage.createBooking({
        flightId: bookingData.flightId,
        passengerCount: bookingData.passengerCount,
        totalAmount: bookingData.totalAmount,
        paymentPlanEnabled: bookingData.paymentPlanEnabled,
        travelDate: new Date(bookingData.travelDate),
        userId: bookingData.userId || null,
      });

      // Create payment plan if enabled
      if (bookingData.paymentPlanEnabled) {
        const paymentPlan = PaymentPlanService.calculatePaymentPlan(
          parseFloat(bookingData.totalAmount),
          new Date(bookingData.travelDate),
        );

        if (paymentPlan.eligible) {
          await storage.createPaymentPlan({
            bookingId: booking.id,
            totalAmount: bookingData.totalAmount,
            depositAmount: paymentPlan.depositAmount!.toString(),
            installmentAmount: paymentPlan.installmentAmount!.toString(),
            installmentCount: paymentPlan.installmentCount!,
            schedule: paymentPlan.schedule || [],
          });
        }
      }

      res.json(booking);
    } catch (error) {
      console.error("Booking creation error:", error);
      res.status(400).json({ message: "Failed to create booking" });
    }
  });

  // Get booking details
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const flight = await storage.getFlight(booking.flightId);
      const paymentPlan = booking.paymentPlanEnabled
        ? await storage.getPaymentPlanByBooking(booking.id)
        : null;

      res.json({
        ...booking,
        flight,
        paymentPlan,
      });
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ message: "Failed to get booking" });
    }
  });

  // Payment routes
  const paymentIntentSchema = z.object({
    amount: z.number().min(50), // Minimum $0.50
    currency: z.string().default('usd'),
    customer_email: z.string().email().optional(),
    metadata: z.record(z.string()).optional(),
  });

  const createSubscriptionSchema = z.object({
    customer_email: z.string().email(),
    customer_name: z.string().optional(),
    amount: z.number().min(50), // Minimum $0.50 per installment
    currency: z.string().default('usd'),
    interval: z.enum(['week', 'month']),
    interval_count: z.number().min(1).max(4),
    metadata: z.record(z.string()).optional(),
  });

  // Create payment intent for one-time payments (deposits or full payments)
  app.post("/api/payments/create-intent", async (req, res) => {
    try {
      const paymentData = paymentIntentSchema.parse(req.body);
      
      const paymentIntent = await StripeService.createPaymentIntent(paymentData);
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(400).json({ 
        error: error.message || "Failed to create payment intent" 
      });
    }
  });

  // Create subscription for installment payments
  app.post("/api/payments/create-subscription", async (req, res) => {
    try {
      const subscriptionData = createSubscriptionSchema.parse(req.body);
      
      // Create customer first
      const customer = await StripeService.createCustomer(
        subscriptionData.customer_email,
        subscriptionData.customer_name
      );
      
      // Create subscription
      const subscription = await StripeService.createSubscription(customer.id, subscriptionData);
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        customerId: customer.id,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ 
        error: error.message || "Failed to create subscription" 
      });
    }
  });

  // Get payment intent status
  app.get("/api/payments/intent/:id", async (req, res) => {
    try {
      const paymentIntent = await StripeService.getPaymentIntent(req.params.id);
      res.json({
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      });
    } catch (error: any) {
      console.error("Error retrieving payment intent:", error);
      res.status(400).json({ 
        error: error.message || "Failed to retrieve payment intent" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
