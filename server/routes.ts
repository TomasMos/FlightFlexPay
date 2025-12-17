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
  promoCodes,
  flightSearchSchema,
} from "@shared/schema";
import { amadeusService } from "./services/amadeus";
import { emailService } from "./services/email";
import { PaymentPlanService } from "./services/paymentPlan";
import { StripeService } from "./services/stripe";
import { safeAdminAuth } from "./services/firebaseAdmin";
import { createReferralCodeForUser, getUserReferralCode } from "./services/referralCode";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";

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
        currency: req.query.currency || "USD",
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
            destinationIata: searchParams.destination,
            departureDate: searchParams.departureDate,
            returnDate: searchParams.returnDate || null,
            tripType: searchParams.tripType,
            passengerCount: searchParams.passengers,
            cabin: "Economy",
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

  // Save passenger details as leads
  app.post("/api/leads", async (req, res) => {
    try {
      const { contactDetails, passengers, searchId } = req.body;

      // Data for the lead entry, including details for the first passenger
      const leadData = {
        email: contactDetails.email,
        diallingCode: contactDetails.diallingCode || null,
        phoneNumber: contactDetails.phoneNumber || null,
        title: passengers[0]?.title || null,
        firstName: passengers[0]?.firstName || null,
        lastName: passengers[0]?.lastName || null,
        dob: passengers[0]?.dateOfBirth
          ? new Date(passengers[0].dateOfBirth).toISOString().split("T")[0]
          : null,
        passportCountry: passengers[0]?.passportCountry || null,
      };

      // Use onConflictDoUpdate to either create a new lead or update an existing one.
      const [lead] = await db
        .insert(leads)
        .values(leadData)
        .onConflictDoUpdate({
          target: leads.email, // The unique column to check for a conflict
          set: {
            diallingCode: leadData.diallingCode,
            phoneNumber: leadData.phoneNumber,
            title: leadData.title,
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            dob: leadData.dob,
            passportCountry: leadData.passportCountry,
          },
        })
        .returning();

      // Create a new lead attempt, linking it to the lead
      await db.insert(leadAttempts).values({
        leadId: lead.id,
        searchId: searchId || null,
        passengerData: { contactDetails, passengers },
      });

      await emailService.addLeadToList(
        leadData.email,
        leadData.firstName,
        leadData.lastName,
      );

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
        leadId,
        searchId,
      } = req.body;

      let userId: number;

      // Check if user exists or create new user from lead data
      const lead = await db
        .select()
        .from(leads)
        .where(eq(leads.id, leadId))
        .limit(1);
      if (!lead.length) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, lead[0].email))
        .limit(1);

      if (existingUser.length > 0) {
        // Use existing user
        userId = existingUser[0].id;
        await db
          .update(users)
          .set({ preferredCurrency: flightData.price.currency })
          .where(eq(users.id, userId));
      } else {
        // Create new user from lead data and first passenger
        const firstPassenger = passengerData.passengers[0];
        const [newUser] = await db
          .insert(users)
          .values({
            email: lead[0].email,
            diallingCode: lead[0].diallingCode,
            phoneNumber: lead[0].phoneNumber,
            title: firstPassenger.title,
            firstName: firstPassenger.firstName,
            lastName: firstPassenger.lastName,
            dob: firstPassenger.dateOfBirth
              ? new Date(firstPassenger.dateOfBirth).toISOString().split("T")[0]
              : null,
            passportCountry: firstPassenger.passportCountry,
            preferredCurrency: flightData.price.currency,
          })
          .returning();

        userId = newUser.id;

        // Create referral code for new user
        try {
          await createReferralCodeForUser(userId, newUser.firstName, newUser.lastName);
        } catch (error) {
          console.error("Failed to create referral code:", error);
        }

        // Update lead status to converted
        await db
          .update(leads)
          .set({ status: "converted" })
          .where(eq(leads.id, leadId));
      }

      await db
        .update(flightSearches)
        .set({ userId: userId })
        .where(eq(flightSearches.id, searchId));

      const [flight] = await db
        .insert(flights)
        .values({
          flightOffer: flightData,
          originIata: flightData.itineraries[0].segments[0].departure.iataCode,
          destinationIata:
            flightData.itineraries[0].segments[
              flightData.itineraries[0].segments.length - 1
            ].arrival.iataCode,
          departureDate: new Date(
            flightData.itineraries[0].segments[0].departure.at,
          )
            .toISOString()
            .split("T")[0],
          returnDate: flightData.itineraries[1]
            ? new Date(flightData.itineraries[1].segments[0].departure.at)
                .toISOString()
                .split("T")[0]
            : null,
          tripType: flightData.oneWay ? "one_way" : "return",
          passengerCount: passengerData.passengers.length,
          cabin: "Economy",
        })
        .returning();

      // Create payment plan
      const [paymentPlanRecord] = await db
        .insert(paymentPlans)
        .values({
          type: paymentPlan.depositPercentage === 100 ? "full" : "installments",
          depositAmount:
            paymentPlan.depositPercentage === 100
              ? null
              : paymentPlan.depositAmount.toString(),
          installmentCount:
            paymentPlan.depositPercentage === 100
              ? null
              : paymentPlan.installmentCount,
          installmentFrequency:
            paymentPlan.depositPercentage === 100
              ? null
              : paymentPlan.installmentType === "weekly"
                ? "weekly"
                : "bi_weekly",
          totalAmount: paymentPlan.totalAmount.toString(),
          currency: flightData.price.currency,
        })
        .returning();

      // Create installments if payment plan is installments
      if (paymentPlan.depositPercentage < 100) {
        const installmentRecords = paymentPlan.installmentDates.map(
          (dateStr: string, index: number) => ({
            paymentPlanId: paymentPlanRecord.id,
            dueDate: new Date(dateStr).toISOString().split("T")[0],
            amount: paymentPlan.installmentAmount.toString(),
            currency: flightData.price.currency,
          }),
        );

        await db.insert(installments).values(installmentRecords);
      }

      // Create booking
      const [booking] = await db
        .insert(bookings)
        .values({
          userId,
          flightId: flight.id,
          paymentPlanId: paymentPlanRecord.id,
          passengers: passengerData.passengers,
          status: "paid",
          totalPrice: paymentPlan.totalAmount.toString(),
          currency: flightData.price.currency,
        })
        .returning();

      // Send booking confirmation email
      try {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user.length > 0) {
          const firstItinerary = flightData.itineraries[0];
          const lastItinerary =
            flightData.itineraries[flightData.itineraries.length - 1];

          await emailService.sendBookingConfirmation(user[0].email, {
            customerName: `${user[0].firstName} ${user[0].lastName}`,
            flightDetails: {
              origin: flightData.origin,
              destination: flightData.destination,
              departureDate: firstItinerary.segments[0].departure.at,
              returnDate: lastItinerary.segments[lastItinerary.segments.length - 1].departure.at,
              flightNumber: firstItinerary.segments[0].number,
              passengers: passengerData.passengers.length,
            },
            paymentPlan: {
              totalAmount: paymentPlan.totalAmount,
              depositAmount: paymentPlan.depositAmount,
              installmentAmount: paymentPlan.installmentAmount,
              installmentCount: paymentPlan.installmentCount,
              frequency: paymentPlan.installmentType,
              currency: flightData.price.currency
            },
            bookingReference: `FP${booking.id.toString().padStart(6, "0")}`,
          });
        }
      } catch (error) {
        console.error("Failed to send booking confirmation email:", error);
      }

      try {
        await emailService.moveLeadToCustomers(
          passengerData.contactDetails.email,
        );
      } catch {
        console.error("Failed to move contact into customer list");
      }

      res.json({
        bookingId: booking.id,
        flightId: flight.id,
        paymentPlanId: paymentPlanRecord.id,
        success: true,
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
    start_date: z.preprocess(
      (val) => (typeof val === "string" || val instanceof Date ? new Date(val) : undefined),
      z.date()
    ),
    installment_count: z.number(),
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
        subscriptionData.interval_count
      );

      // 3. Create subscription schedule starting in 1 week
      const schedule = await StripeService.createInstallmentSchedule(
        customer.id,
        price.id,
        subscriptionData.installment_count,
        subscriptionData.start_date,
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

  // Email endpoints
  app.post("/api/send-payment-reminder", async (req, res) => {
    try {
      const { bookingId } = req.body;

      // Get booking details with user and installment information
      const booking = await db
        .select({
          booking: bookings,
          user: users,
          installment: installments,
          paymentPlan: paymentPlans,
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(paymentPlans, eq(bookings.paymentPlanId, paymentPlans.id))
        .leftJoin(installments, eq(paymentPlans.id, installments.paymentPlanId))
        .where(eq(bookings.id, parseInt(bookingId)))
        .limit(1);

      if (!booking.length) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const { user, installment } = booking[0];
      if (!user || !installment) {
        return res.status(400).json({ error: "Invalid booking data" });
      }

      // Send payment reminder
      const success = await emailService.sendPaymentReminder(user.email, {
        customerName: `${user.firstName} ${user.lastName}`,
        dueAmount: parseFloat(installment.amount),
        dueDate: installment.dueDate,
        bookingReference: `FP${booking[0].booking.id.toString().padStart(6, "0")}`,
        paymentUrl: `${process.env.BASE_URL || "http://localhost:5000"}/payment/${booking[0].booking.id}`,
      });

      res.json({ success, sent: success });
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      res.status(400).json({ error: "Failed to send payment reminder" });
    }
  });

  // Test email endpoint (development only)
  app.post("/api/test-email", async (req, res) => {
    if (process.env.NODE_ENV !== "development") {
      return res
        .status(403)
        .json({ error: "Test endpoint only available in development" });
    }

    try {
      const { type, email } = req.body;
      console.log("Test email request received:", { type, email });

      let success = false;
      switch (type) {
        case "welcome":
          success = await emailService.sendWelcomeEmail(email, "Test User");
          break;
        case "booking":
          success = await emailService.sendBookingConfirmation(email, {
            customerName: "Test User",
            flightDetails: {
              origin: "LAX",
              destination: "JFK",
              departureDate: new Date().toISOString(),
              flightNumber: "AA123",
              passengers: 1,
            },
            paymentPlan: {
              totalAmount: 500,
              depositAmount: 100,
              installmentAmount: 100,
              installmentCount: 4,
              frequency: "weekly",
              currency: "USD",
            },
            bookingReference: "FP000001",
          });
          break;
        case "reminder":
          success = await emailService.sendPaymentReminder(email, {
            customerName: "Test User",
            dueAmount: 100,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            bookingReference: "FP000001",
            paymentUrl: "http://localhost:5000/payment/1",
          });
          break;
        default:
          return res.status(400).json({ error: "Invalid email type" });
      }

      console.log("Test email result:", { success, type, email });
      res.json({ success, type, recipient: email });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(400).json({ error: "Failed to send test email" });
    }
  });

  // Auth verification endpoint
  app.post("/api/auth/verify-user", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user exists in our database
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      res.json({ exists: user.length > 0 });
    } catch (error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ error: "Failed to verify user" });
    }
  });

  // Get user's preferred currency
  app.get("/api/user/currency", async (req, res) => {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await db
        .select({ preferredCurrency: users.preferredCurrency })
        .from(users)
        .where(eq(users.email, email as string))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ preferredCurrency: user[0].preferredCurrency });
    } catch (error) {
      console.error("Error fetching user currency:", error);
      res.status(500).json({ error: "Failed to fetch user currency" });
    }
  });

  // Get user bookings with flight and payment plan data
  app.get("/api/bookings/user", async (req, res) => {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // First get the user ID
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email as string))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get bookings with joined flight and payment plan data
      const userBookings = await db
        .select({
          booking: bookings,
          flight: flights,
          paymentPlan: paymentPlans,
        })
        .from(bookings)
        .leftJoin(flights, eq(bookings.flightId, flights.id))
        .leftJoin(paymentPlans, eq(bookings.paymentPlanId, paymentPlans.id))
        .where(eq(bookings.userId, user[0].id))
        .orderBy(desc(bookings.createdAt));

      // Format the response
      const formattedBookings = userBookings.map(
        ({ booking, flight, paymentPlan }) => ({
          ...booking,
          flight,
          paymentPlan,
        }),
      );

      res.json(formattedBookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ error: "Failed to fetch user bookings" });
    }
  });

  // Get user payment plans with installment details
  app.get("/api/billing/payment-plans", async (req, res) => {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Get user ID
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email as string))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get payment plans for user's bookings
      const userPaymentPlans = await db
        .select({
          paymentPlan: paymentPlans,
          bookingId: bookings.id,
        })
        .from(paymentPlans)
        .innerJoin(bookings, eq(paymentPlans.id, bookings.paymentPlanId))
        .where(eq(bookings.userId, user[0].id))
        .orderBy(desc(paymentPlans.createdAt));

      // Get installments for each payment plan
      const plansWithInstallments = await Promise.all(
        userPaymentPlans.map(async ({ paymentPlan, bookingId }) => {
          const planInstallments = await db
            .select()
            .from(installments)
            .where(eq(installments.paymentPlanId, paymentPlan.id))
            .orderBy(installments.dueDate);

          const paidInstallments = planInstallments.filter(
            (i) => i.status === "paid",
          ).length;
          const hasOverdue = planInstallments.some(
            (i) => i.status === "overdue",
          );

          return {
            ...paymentPlan,
            bookingId,
            installments: planInstallments,
            paidInstallments,
            totalInstallments: planInstallments.length,
            hasOverdue,
            route: "SYD-LON", // TODO: Get actual route from flight data
            isRoundTrip: true, // TODO: Determine from flight data
          };
        }),
      );

      res.json(plansWithInstallments);
    } catch (error) {
      console.error("Error fetching payment plans:", error);
      res.status(500).json({ error: "Failed to fetch payment plans" });
    }
  });

  // Get user details with email
  app.get("/api/user/details", async (req, res) => {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Get user ID
      const userDB = await db
        .select()
        .from(users)
        .where(eq(users.email, email as string))
        .limit(1);
      
      if (userDB.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(userDB);
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  });

  // Get user payment methods (Stripe)
  app.get("/api/billing/payment-methods", async (req, res) => {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // TODO: Implement Stripe payment methods retrieval
      // For now, return empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  // Get user payment history (Stripe)
  app.get("/api/billing/payment-history", async (req, res) => {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // TODO: Implement Stripe payment history retrieval
      // For now, return empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });

  // ============ REFERRAL & PROMO CODE ROUTES ============

  // Get user's referral code and stats
  app.get("/api/user/referral", async (req, res) => {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email as string))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's referral code
      const [referralCode] = await db
        .select()
        .from(promoCodes)
        .where(and(
          eq(promoCodes.userId, user.id),
          eq(promoCodes.type, "referral")
        ))
        .limit(1);

      if (!referralCode) {
        // Create one if it doesn't exist
        const newCode = await createReferralCodeForUser(user.id, user.firstName, user.lastName);
        const [newReferralCode] = await db
          .select()
          .from(promoCodes)
          .where(eq(promoCodes.code, newCode))
          .limit(1);
        
        return res.json({
          code: newReferralCode.code,
          timesUsed: 0,
          discountPercent: newReferralCode.discountPercent,
          discountAmount: newReferralCode.discountAmount,
        });
      }

      // Get bookings that used this referral code
      const referralBookings = await db
        .select({
          id: bookings.id,
          createdAt: bookings.createdAt,
          totalPrice: bookings.totalPrice,
          currency: bookings.currency,
        })
        .from(bookings)
        .where(eq(bookings.promoCodeId, referralCode.id))
        .orderBy(desc(bookings.createdAt));

      res.json({
        code: referralCode.code,
        timesUsed: referralCode.timesUsed || 0,
        discountPercent: referralCode.discountPercent,
        discountAmount: referralCode.discountAmount,
        bookings: referralBookings,
      });
    } catch (error) {
      console.error("Error fetching referral code:", error);
      res.status(500).json({ error: "Failed to fetch referral code" });
    }
  });

  // Validate and calculate promo code discount
  app.post("/api/promo/validate", async (req, res) => {
    try {
      const { code, totalAmount, currency } = req.body;

      if (!code || !totalAmount || !currency) {
        return res.status(400).json({ error: "Code, total amount, and currency are required" });
      }

      // Look up the promo code
      const [promoCode] = await db
        .select()
        .from(promoCodes)
        .where(eq(promoCodes.code, code.toUpperCase()))
        .limit(1);

      if (!promoCode) {
        return res.status(404).json({ error: "Invalid promo code" });
      }

      if (!promoCode.isActive) {
        return res.status(400).json({ error: "This promo code is no longer active" });
      }

      let discount = 0;

      if (promoCode.type === "referral") {
        // Referral code logic: minimum of 10% or $25 USD converted
        const tenPercent = totalAmount * 0.10;
        
        // Convert $25 USD to the booking currency
        // For simplicity, we'll use approximate rates. In production, use a real exchange rate API.
        const usdToRate: Record<string, number> = {
          USD: 1,
          GBP: 0.79,
          EUR: 0.92,
          AUD: 1.53,
          CAD: 1.36,
          JPY: 149.50,
          INR: 83.12,
          SGD: 1.34,
          HKD: 7.82,
          NZD: 1.64,
        };
        
        const rate = usdToRate[currency] || 1;
        const twentyFiveUsdConverted = 25 * rate;
        
        // Take the minimum of 10% or $25 USD converted
        discount = Math.min(tenPercent, twentyFiveUsdConverted);
      } else if (promoCode.type === "system") {
        // System promo codes use fixed amount or percentage as defined
        if (promoCode.discountPercent) {
          discount = totalAmount * (parseFloat(promoCode.discountPercent) / 100);
        } else if (promoCode.discountAmount) {
          discount = parseFloat(promoCode.discountAmount);
        }
      }

      // Ensure discount doesn't exceed total
      discount = Math.min(discount, totalAmount);

      res.json({
        valid: true,
        promoCodeId: promoCode.id,
        code: promoCode.code,
        type: promoCode.type,
        discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
        newTotal: Math.round((totalAmount - discount) * 100) / 100,
      });
    } catch (error) {
      console.error("Error validating promo code:", error);
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });

  // ============ ADMIN ROUTES ============
  
  // Middleware to verify admin role
  const verifyAdmin = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const token = authHeader.split(' ')[1];
      const decodedToken = await safeAdminAuth.verifyIdToken(token);
      const email = decodedToken.email;
      
      if (!email) {
        return res.status(401).json({ error: "Invalid token" });
      }
      
      // Check if user exists and has admin role
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      req.adminUser = user;
      next();
    } catch (error) {
      console.error("Admin verification error:", error);
      return res.status(401).json({ error: "Unauthorized" });
    }
  };

  // Check if current user is admin
  app.get("/api/admin/check", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.json({ isAdmin: false });
      }
      
      const token = authHeader.split(' ')[1];
      const decodedToken = await safeAdminAuth.verifyIdToken(token);
      const email = decodedToken.email;
      
      if (!email) {
        return res.json({ isAdmin: false });
      }
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      res.json({ isAdmin: user?.role === 'admin' });
    } catch (error) {
      res.json({ isAdmin: false });
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", verifyAdmin, async (req, res) => {
    try {
      const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));
      
      res.json({ users: allUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get single user with their bookings (admin only)
  app.get("/api/admin/users/:id", verifyAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get user's bookings
      const userBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, userId))
        .orderBy(desc(bookings.createdAt));
      
      res.json({ user, bookings: userBookings });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Get all leads (admin only)
  app.get("/api/admin/leads", verifyAdmin, async (req, res) => {
    try {
      const allLeads = await db
        .select()
        .from(leads)
        .orderBy(desc(leads.createdAt));
      
      res.json({ leads: allLeads });
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Get single lead with their flight searches and attempts (admin only)
  app.get("/api/admin/leads/:id", verifyAdmin, async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      
      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, leadId))
        .limit(1);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // Get lead attempts with related flight searches
      const attempts = await db
        .select({
          attempt: leadAttempts,
          search: flightSearches,
        })
        .from(leadAttempts)
        .leftJoin(flightSearches, eq(leadAttempts.searchId, flightSearches.id))
        .where(eq(leadAttempts.leadId, leadId))
        .orderBy(desc(leadAttempts.attemptedAt));
      
      res.json({ lead, attempts });
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  // Get all bookings (admin only)
  app.get("/api/admin/bookings", verifyAdmin, async (req, res) => {
    try {
      const allBookings = await db
        .select({
          booking: bookings,
          user: users,
          flight: flights,
          paymentPlan: paymentPlans,
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(flights, eq(bookings.flightId, flights.id))
        .leftJoin(paymentPlans, eq(bookings.paymentPlanId, paymentPlans.id))
        .orderBy(desc(bookings.createdAt));
      
      res.json({ bookings: allBookings });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Get single booking with full details (admin only)
  app.get("/api/admin/bookings/:id", verifyAdmin, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      
      const [bookingData] = await db
        .select({
          booking: bookings,
          user: users,
          flight: flights,
          paymentPlan: paymentPlans,
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(flights, eq(bookings.flightId, flights.id))
        .leftJoin(paymentPlans, eq(bookings.paymentPlanId, paymentPlans.id))
        .where(eq(bookings.id, bookingId))
        .limit(1);
      
      if (!bookingData) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Get installments if payment plan exists
      let bookingInstallments: any[] = [];
      if (bookingData.paymentPlan) {
        bookingInstallments = await db
          .select()
          .from(installments)
          .where(eq(installments.paymentPlanId, bookingData.paymentPlan.id))
          .orderBy(installments.dueDate);
      }
      
      res.json({ ...bookingData, installments: bookingInstallments });
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // Admin: Resend booking confirmation email
  app.post("/api/admin/bookings/:id/resend-confirmation", verifyAdmin, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      
      const [bookingData] = await db
        .select({
          booking: bookings,
          user: users,
          flight: flights,
          paymentPlan: paymentPlans,
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(flights, eq(bookings.flightId, flights.id))
        .leftJoin(paymentPlans, eq(bookings.paymentPlanId, paymentPlans.id))
        .where(eq(bookings.id, bookingId))
        .limit(1);
      
      if (!bookingData || !bookingData.user) {
        return res.status(404).json({ error: "Booking or user not found" });
      }

      // Build flight details from stored data
      const flightOffer = bookingData.flight?.flightOffer as any;
      const itineraries = flightOffer?.itineraries || [];
      
      let flightNumber = "N/A";
      if (itineraries.length > 0 && itineraries[0].segments?.length > 0) {
        const firstSegment = itineraries[0].segments[0];
        flightNumber = `${firstSegment.carrierCode || ''}${firstSegment.number || ''}`;
      }

      // Send the booking confirmation email
      const emailSent = await emailService.sendBookingConfirmation(
        bookingData.user.email,
        {
          customerName: `${bookingData.user.firstName} ${bookingData.user.lastName}`,
          bookingReference: `SPL-${bookingData.booking.id}`,
          flightDetails: {
            origin: bookingData.flight?.originIata || '',
            destination: bookingData.flight?.destinationIata || '',
            departureDate: bookingData.flight?.departureDate || '',
            returnDate: bookingData.flight?.returnDate || undefined,
            flightNumber,
            passengers: bookingData.flight?.passengerCount || 1,
          },
          paymentPlan: {
            totalAmount: parseFloat(bookingData.booking.totalPrice || '0'),
            depositAmount: parseFloat(bookingData.paymentPlan?.depositAmount || '0'),
            installmentAmount: bookingData.paymentPlan?.installmentCount && bookingData.paymentPlan?.depositAmount
              ? (parseFloat(bookingData.paymentPlan.totalAmount) - parseFloat(bookingData.paymentPlan.depositAmount)) / bookingData.paymentPlan.installmentCount
              : undefined,
            installmentCount: bookingData.paymentPlan?.installmentCount || undefined,
            frequency: bookingData.paymentPlan?.installmentFrequency || undefined,
            currency: bookingData.paymentPlan?.currency || bookingData.booking.currency || 'GBP',
          },
        }
      );

      if (emailSent) {
        res.json({ success: true, message: "Booking confirmation email resent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }
    } catch (error) {
      console.error("Error resending booking confirmation:", error);
      res.status(500).json({ error: "Failed to resend booking confirmation" });
    }
  });

  // ============ END ADMIN ROUTES ============

  // Promo code validation endpoint
  app.post("/api/promocodes/validate", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ valid: false, message: "Promo code is required" });
      }
      
      // Validate promo code format: PROMOXXXX where XXXX is a number
      const promoRegex = /^PROMO(\d+)$/;
      const match = code.toUpperCase().match(promoRegex);
      
      if (!match) {
        return res.status(400).json({ valid: false, message: "Invalid promo code format" });
      }
      
      // Check if promo code exists in database and is active
      const [promoCode] = await db
        .select()
        .from(promoCodes)
        .where(and(
          eq(promoCodes.code, code.toUpperCase()),
          eq(promoCodes.isActive, true)
        ))
        .limit(1);
      
      if (!promoCode) {
        return res.status(400).json({ valid: false, message: "Invalid or expired promo code" });
      }
      
      res.json({
        valid: true,
        amount: parseFloat(promoCode.amount),
        code: promoCode.code,
      });
    } catch (error) {
      console.error("Promo code validation error:", error);
      res.status(500).json({ valid: false, message: "Failed to validate promo code" });
    }
  });

  // Seed promo codes on startup (runs once)
  (async () => {
    try {
      // Check if PROMO2050 already exists
      const [existing] = await db
        .select()
        .from(promoCodes)
        .where(eq(promoCodes.code, "PROMO2050"))
        .limit(1);
      
      if (!existing) {
        await db.insert(promoCodes).values({
          code: "PROMO2050",
          amount: "2050",
          isActive: true,
        });
        console.log("Seeded promo code: PROMO2050");
      }
    } catch (error) {
      console.log("Promo code seeding skipped or failed:", error);
    }
  })();

  const httpServer = createServer(app);
  return httpServer;
}
