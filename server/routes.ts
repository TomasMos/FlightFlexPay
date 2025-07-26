import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { amadeusService } from "./services/amadeus";
import { PaymentPlanService } from "./services/paymentPlan";
import { flightSearchSchema, FlightWithPaymentPlan, RoundTripFlightWithPaymentPlan } from "@shared/schema";
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
      
      if (searchParams.tripType === "roundtrip" && searchParams.returnDate) {
        // For round trip, get return flights and create combinations
        const returnSearchParams = {
          ...searchParams,
          origin: searchParams.destination,
          destination: searchParams.origin,
          departureDate: searchParams.returnDate,
          returnDate: undefined,
          tripType: "oneway" as const,
        };
        
        const returnFlights = await amadeusService.searchFlights(returnSearchParams);
        
        // Create round trip combinations
        const roundTripCombinations: RoundTripFlightWithPaymentPlan[] = [];
        
        flights.forEach((outbound) => {
          returnFlights.forEach((returnFlight) => {
            const outboundPrice = parseFloat(outbound.price.toString());
            const returnPrice = parseFloat(returnFlight.price.toString());
            const totalPrice = (outboundPrice + returnPrice) * searchParams.passengers;
            const travelDate = new Date(outbound.departureTime);
            
            const paymentPlan = PaymentPlanService.calculatePaymentPlan(totalPrice, travelDate);
            
            // Enhance individual flights with payment plan info
            const outboundWithPaymentPlan: FlightWithPaymentPlan = {
              ...outbound,
              paymentPlanEligible: paymentPlan.eligible,
              paymentPlan: paymentPlan.eligible ? {
                depositAmount: paymentPlan.depositAmount! / 2, // Split between outbound and return
                installmentAmount: paymentPlan.installmentAmount!,
                installmentCount: paymentPlan.installmentCount!,
              } : undefined,
            };
            
            const returnWithPaymentPlan: FlightWithPaymentPlan = {
              ...returnFlight,
              paymentPlanEligible: paymentPlan.eligible,
              paymentPlan: paymentPlan.eligible ? {
                depositAmount: paymentPlan.depositAmount! / 2, // Split between outbound and return
                installmentAmount: paymentPlan.installmentAmount!,
                installmentCount: paymentPlan.installmentCount!,
              } : undefined,
            };
            
            roundTripCombinations.push({
              id: `${outbound.id}-${returnFlight.id}`,
              outboundFlight: outboundWithPaymentPlan,
              returnFlight: returnWithPaymentPlan,
              totalPrice,
              paymentPlanEligible: paymentPlan.eligible,
              paymentPlan: paymentPlan.eligible ? {
                depositAmount: paymentPlan.depositAmount!,
                installmentAmount: paymentPlan.installmentAmount!,
                installmentCount: paymentPlan.installmentCount!,
              } : undefined,
            });
          });
        });
        
        res.json({ flights: roundTripCombinations });
      } else {
        // For one-way flights, enhance with payment plan information
        const flightsWithPaymentPlans: FlightWithPaymentPlan[] = flights.map((flight) => {
          const travelDate = new Date(flight.departureTime);
          const totalAmount = parseFloat(flight.price.toString()) * searchParams.passengers;
          
          const paymentPlan = PaymentPlanService.calculatePaymentPlan(totalAmount, travelDate);
          
          return {
            ...flight,
            paymentPlanEligible: paymentPlan.eligible,
            paymentPlan: paymentPlan.eligible ? {
              depositAmount: paymentPlan.depositAmount!,
              installmentAmount: paymentPlan.installmentAmount!,
              installmentCount: paymentPlan.installmentCount!,
            } : undefined,
          };
        });

        res.json({ flights: flightsWithPaymentPlans });
      }
    } catch (error) {
      console.error("Flight search error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to search flights",
        flights: []
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
        airports: []
      });
    }
  });

  // Get detailed payment plan for a flight
  app.post("/api/payment-plan/calculate", async (req, res) => {
    try {
      const { flightId, passengers, travelDate } = req.body;
      
      const flight = await storage.getFlight(flightId);
      if (!flight) {
        return res.status(404).json({ message: "Flight not found" });
      }

      const totalAmount = parseFloat(flight.price.toString()) * passengers;
      const paymentPlan = PaymentPlanService.calculatePaymentPlan(
        totalAmount, 
        new Date(travelDate)
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
          new Date(bookingData.travelDate)
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

  const httpServer = createServer(app);
  return httpServer;
}
