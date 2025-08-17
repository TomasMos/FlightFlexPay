import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { 
  flightSearches, 
  leads, 
  leadAttempts, 
  users, 
  flights, 
  paymentPlans, 
  installments, 
  bookings,
  flightSearchSchema,
  EnhancedFlightWithPaymentPlan,
  insertFlightSearchSchema,
  insertLeadSchema,
  insertLeadAttemptSchema,
  insertUserSchema,
  insertFlightSchema,
  insertPaymentPlanSchema,
  insertInstallmentSchema,
  insertBookingSchema
} from "@shared/schema";
import { amadeusService } from "./services/amadeus";
import { PaymentPlanService } from "./services/paymentPlan";
import { StripeService } from "./services/stripe";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

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
        tripType: req.query.tripType,
      });

      let searchId = 0;

      try {
        // Save flight search to database and return the newly created record
        const [newSearch] = await db
          .insert(flightSearches)
          .values({
            userId: null,
            sessionId: `anon_${Date.now()}`,
            originIata: searchParams.origin,
            originAirportName: searchParams.origin,
            destinationIata: searchParams.destination,
            destinationAirportName: searchParams.destination,
            departureDate: searchParams.departureDate,
            returnDate: searchParams.returnDate || null,
            tripType: searchParams.tripType,
            passengerCount: searchParams.passengers,
            cabin: "Economy"
          })
          .returning({ id: flightSearches.id }); // Add .returning() to get the ID

        searchId = newSearch.id;
      } catch (error) {
        console.log("Error saving flight search:", error);
        // searchId will remain null if the database save fails
      }

      const flights = await amadeusService.searchFlights(searchParams);

      const flightsWithPaymentPlans = flights.map((flight) => {
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
            total: perPersonFlightPrice.flightPrice.toString(),
          },
          paymentPlanEligible: paymentPlan.eligible,
          paymentPlan: paymentPlan.eligible
            ? {
              depositAmount: paymentPlan.depositAmount,
              installmentAmount: paymentPlan.installmentAmount,
              installmentCount: paymentPlan.installmentCount,
            }
            : undefined,
        };
      });

      // Add the searchId to the response payload
      res.json({
        searchId,
        flights: flightsWithPaymentPlans,
      });
    } catch (error) {
      console.error("Flight search error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Failed to search flights",
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

  // Get booking details
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      
      const booking = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
      if (!booking.length) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const flight = await db.select().from(flights).where(eq(flights.id, booking[0].flightId)).limit(1);
      const paymentPlan = await db.select().from(paymentPlans).where(eq(paymentPlans.id, booking[0].paymentPlanId)).limit(1);
      const installmentList = await db.select().from(installments).where(eq(installments.paymentPlanId, booking[0].paymentPlanId));

      res.json({
        ...booking[0],
        flight: flight[0] || null,
        paymentPlan: paymentPlan[0] || null,
        installments: installmentList
      });
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ message: "Failed to get booking" });
    }
  });

  // Save passenger details as leads
  app.post("/api/leads", async (req, res) => {
    try {
      const { contactDetails, passengers, searchId } = req.body;

      // Create lead from contact details
      const leadData = {
        email: contactDetails.email,
        diallingCode: contactDetails.diallingCode || null,
        phoneNumber: contactDetails.phoneNumber || null,
        title: passengers[0]?.title || null,
        firstName: passengers[0]?.firstName || null,
        lastName: passengers[0]?.lastName || null,
        dob: passengers[0]?.dateOfBirth ? new Date(passengers[0].dateOfBirth).toISOString().split('T')[0] : null,
        passportCountry: passengers[0]?.passportCountry || null
      };

      const [lead] = await db.insert(leads).values(leadData).returning();

      console.log(`lead`, lead)

      // Create lead attempt
      await db.insert(leadAttempts).values({
        leadId: lead.id,
        searchId: searchId || null,
        passengerData: { contactDetails, passengers }
      });

      res.json({ leadId: lead.id, success: true });
    } catch (error) {
      console.error("Error saving lead:", error);
      res.status(400).json({ error: "Failed to save passenger details" });
    }
  });

  // Complete booking flow
  app.post("/api/bookings/complete", async (req, res) => {
    try {
      const { 
        flightData, 
        passengerData, 
        paymentPlan, 
        paymentIntentId,
        leadId 
      } = req.body;

      let userId: number;

      // Check if user exists or create new user from lead data
      const lead = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
      if (!lead.length) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const existingUser = await db.select().from(users).where(eq(users.email, lead[0].email)).limit(1);
      
      if (existingUser.length > 0) {
        // Use existing user
        userId = existingUser[0].id;
      } else {
        // Create new user from lead data and first passenger
        const firstPassenger = passengerData.passengers[0];
        const [newUser] = await db.insert(users).values({
          email: lead[0].email,
          diallingCode: lead[0].diallingCode,
          phoneNumber: lead[0].phoneNumber,
          title: firstPassenger.title,
          firstName: firstPassenger.firstName,
          lastName: firstPassenger.lastName,
          dob: firstPassenger.dateOfBirth ? new Date(firstPassenger.dateOfBirth).toISOString().split('T')[0] : null,
          passportCountry: firstPassenger.passportCountry
        }).returning();
        
        userId = newUser.id;

        // Update lead status to converted
        await db.update(leads).set({ status: "converted" }).where(eq(leads.id, leadId));
      }

      // Create flight record
      const tripTypeMap: Record<string, "one_way" | "return" | "multicity"> = {
        "oneway": "one_way",
        "roundtrip": "return",
        "multicity": "multicity"
      };

      const [flight] = await db.insert(flights).values({
        flightOffer: flightData,
        originIata: flightData.itineraries[0].segments[0].departure.iataCode,
        originAirportName: flightData.itineraries[0].segments[0].departure.iataCode, // Should be resolved from airport name
        destinationIata: flightData.itineraries[0].segments[flightData.itineraries[0].segments.length - 1].arrival.iataCode,
        destinationAirportName: flightData.itineraries[0].segments[flightData.itineraries[0].segments.length - 1].arrival.iataCode, // Should be resolved from airport name
        departureDate: new Date(flightData.itineraries[0].segments[0].departure.at).toISOString().split('T')[0],
        returnDate: flightData.itineraries[1] ? new Date(flightData.itineraries[1].segments[0].departure.at).toISOString().split('T')[0] : null,
        tripType: flightData.oneWay ? "one_way" : "return",
        passengerCount: passengerData.passengers.length,
        cabin: "Economy"
      }).returning();

      // Create payment plan
      const [paymentPlanRecord] = await db.insert(paymentPlans).values({
        type: paymentPlan.depositPercentage === 100 ? "full" : "installments",
        depositAmount: paymentPlan.depositPercentage === 100 ? null : paymentPlan.depositAmount.toString(),
        installmentCount: paymentPlan.depositPercentage === 100 ? null : paymentPlan.installmentCount,
        installmentFrequency: paymentPlan.depositPercentage === 100 ? null : (paymentPlan.installmentType === "weekly" ? "weekly" : "bi_weekly"),
        totalAmount: paymentPlan.totalAmount.toString(),
        currency: "USD"
      }).returning();

      // Create installments if payment plan is installments
      if (paymentPlan.depositPercentage < 100) {
        const installmentRecords = paymentPlan.installmentDates.map((dateStr: string, index: number) => ({
          paymentPlanId: paymentPlanRecord.id,
          dueDate: new Date(dateStr).toISOString().split('T')[0],
          amount: paymentPlan.installmentAmount.toString(),
          currency: "USD"
        }));

        await db.insert(installments).values(installmentRecords);
      }

      // Create booking
      const [booking] = await db.insert(bookings).values({
        userId,
        flightId: flight.id,
        paymentPlanId: paymentPlanRecord.id,
        status: "paid",
        totalPrice: paymentPlan.totalAmount.toString()
      }).returning();

      res.json({ 
        bookingId: booking.id, 
        flightId: flight.id,
        paymentPlanId: paymentPlanRecord.id,
        success: true 
      });
    } catch (error) {
      console.error("Error completing booking:", error);
      res.status(400).json({ error: "Failed to complete booking" });
    }
  });

  // Payment routes
  const paymentIntentSchema = z.object({
    amount: z.number().min(50), // Minimum $0.50
    currency: z.string().default("usd"),
    customer_email: z.string().email().optional(),
    setup_future_usage: z.enum(["off_session", "on_session"]).optional(),
    metadata: z.record(z.string()).optional(),
  });

  const createSubscriptionSchema = z.object({
    customer_email: z.string().email(),
    customer_name: z.string().optional(),
    installment_amount: z.number().min(1), // Minimum $1.00 per installment (in dollars)
    currency: z.string().default("usd"),
    interval: z.enum(["week", "month"]),
    interval_count: z.number().min(1).max(12),
    payment_method_id: z.string().optional(), // Payment method from successful payment
    metadata: z.record(z.string()).optional(),
  });

  // Create payment intent for one-time payments (deposits or full payments)
  app.post("/api/payments/create-intent", async (req, res) => {
    try {
      const paymentData = paymentIntentSchema.parse(req.body);

      const paymentIntent =
        await StripeService.createPaymentIntent(paymentData);

      res.json({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        customerId: paymentIntent.customer,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(400).json({
        error: error.message || "Failed to create payment intent",
      });
    }
  });

  // Create subscription schedule for installment payments
  app.post("/api/payments/create-subscription", async (req, res) => {
    try {
      const subscriptionData = createSubscriptionSchema.parse(req.body);

      // 1. Get or create Stripe customer
      const customer = await StripeService.getOrCreateCustomer(
        subscriptionData.customer_email,
        subscriptionData.customer_name,
      );

      // 2. Create price dynamically for this customer's installments
      const price = await StripeService.createInstallmentPrice(
        subscriptionData.installment_amount, // amount in dollars
        subscriptionData.currency,
        subscriptionData.interval,
      );

      // 3. Create subscription schedule starting in 1 week
      const schedule = await StripeService.createInstallmentSchedule(
        customer.id,
        price.id,
        subscriptionData.interval,
        subscriptionData.interval_count,
        subscriptionData.payment_method_id, // This is the key addition!
        {
          ...subscriptionData.metadata,
          customer_email: subscriptionData.customer_email,
          original_installment_amount:
            subscriptionData.installment_amount.toString(),
        },
      );

      // 4. Verify payment method was attached (for debugging)
      let paymentMethodInfo = null;
      if (subscriptionData.payment_method_id) {
        try {
          const paymentMethods = await StripeService.getCustomerPaymentMethods(
            customer.id,
          );
          paymentMethodInfo = {
            paymentMethodsCount: paymentMethods.length,
            hasDefaultPaymentMethod:
              !!customer.invoice_settings?.default_payment_method,
          };
        } catch (error) {
          console.log(
            "Could not retrieve payment methods for verification:",
            error,
          );
        }
      }

      // 5. Send result back to frontend
      res.json({
        success: true,
        subscriptionScheduleId: schedule.id,
        priceId: price.id,
        customerId: customer.id,
        startDate: new Date(schedule.phases[0].start_date * 1000).toISOString(),
        installmentAmount: subscriptionData.installment_amount,
        totalInstallments: subscriptionData.interval_count,
        paymentMethodAttached: !!subscriptionData.payment_method_id,
        paymentMethodInfo, // For debugging
      });
    } catch (error: any) {
      console.error("Error creating subscription schedule:", error);

      // Return more specific error messages
      let errorMessage = "Failed to create subscription schedule";

      if (error.type === "StripeCardError") {
        errorMessage = "Card error: " + error.message;
      } else if (error.type === "StripeInvalidRequestError") {
        errorMessage = "Invalid request: " + error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      res.status(400).json({
        error: errorMessage,
        type: error.type || "unknown",
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
        payment_method: paymentIntent.payment_method,
        customer: paymentIntent.customer,
      });
    } catch (error: any) {
      console.error("Error retrieving payment intent:", error);
      res.status(400).json({
        error: error.message || "Failed to retrieve payment intent",
      });
    }
  });

  // Get subscription schedule status (useful for debugging)
  app.get("/api/payments/schedule/:id", async (req, res) => {
    try {
      const schedule = await StripeService.getSubscriptionSchedule(
        req.params.id,
      );
      res.json({
        id: schedule.id,
        status: schedule.status,
        customer: schedule.customer,
        phases: schedule.phases,
        current_phase: schedule.current_phase,
      });
    } catch (error: any) {
      console.error("Error retrieving subscription schedule:", error);
      res.status(400).json({
        error: error.message || "Failed to retrieve subscription schedule",
      });
    }
  });

  // Get customer payment methods (useful for debugging)
  app.get(
    "/api/payments/customer/:customerId/payment-methods",
    async (req, res) => {
      try {
        const paymentMethods = await StripeService.getCustomerPaymentMethods(
          req.params.customerId,
        );
        const customer = await StripeService.getCustomer(req.params.customerId);

        res.json({
          paymentMethods: paymentMethods.map((pm) => ({
            id: pm.id,
            type: pm.type,
            card: pm.card
              ? {
                  brand: pm.card.brand,
                  last4: pm.card.last4,
                  exp_month: pm.card.exp_month,
                  exp_year: pm.card.exp_year,
                }
              : null,
          })),
          defaultPaymentMethod:
            customer.invoice_settings?.default_payment_method,
          customerEmail: customer.email,
        });
      } catch (error: any) {
        console.error("Error retrieving customer payment methods:", error);
        res.status(400).json({
          error: error.message || "Failed to retrieve payment methods",
        });
      }
    },
  );

  const httpServer = createServer(app);
  return httpServer;
}
