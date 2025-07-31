import { useState } from "react";
import {
  EnhancedFlightWithPaymentPlan,
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, CreditCard, Filter } from "lucide-react";
import { PaymentPlanModal } from "./payment-plan-modal.tsx";
import { FlightCard } from "@/components/flight-card.tsx"

interface FlightResultsProps {
  flights: EnhancedFlightWithPaymentPlan[];
  isLoading: boolean;
  error?: string;
}

export function FlightResults({
  flights,
  isLoading,
  error,
}: FlightResultsProps) {
  const [selectedFlight, setSelectedFlight] =
    useState<EnhancedFlightWithPaymentPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("best");

  // Helper functions
  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return duration;

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  // Helper functions for enhanced flights
  const parseDurationToMinutes = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return hours * 60 + minutes;
  };

  const getFlightPrice = (flight: EnhancedFlightWithPaymentPlan): number => {
    return parseFloat(flight.price.total);
  };

  const getFlightDuration = (flight: EnhancedFlightWithPaymentPlan): number => {
    return parseDurationToMinutes(flight.duration);
  };

  const calculateBestRanking = (): EnhancedFlightWithPaymentPlan[] => {
    if (flights.length === 0) return [];

    // Sort by price (cheapest first) and assign ranks
    const priceRanks = new Map<string, number>();
    const sortedByPrice = [...flights].sort(
      (a, b) => getFlightPrice(a) - getFlightPrice(b),
    );
    sortedByPrice.forEach((flight, index) => {
      priceRanks.set(flight.id, index + 1);
    });

    // Sort by duration (shortest first) and assign ranks
    const durationRanks = new Map<string, number>();
    const sortedByDuration = [...flights].sort(
      (a, b) => getFlightDuration(a) - getFlightDuration(b),
    );
    sortedByDuration.forEach((flight, index) => {
      durationRanks.set(flight.id, index + 1);
    });

    // Calculate average rank for each flight
    const flightsWithAvgRank = flights.map((flight) => {
      const priceRank = priceRanks.get(flight.id) || 1;
      const durationRank = durationRanks.get(flight.id) || 1;
      const avgRank = (priceRank + durationRank) / 2;

      return { ...flight, avgRank };
    });

    // Sort by average rank (lowest/best first)
    return flightsWithAvgRank.sort((a, b) => a.avgRank - b.avgRank);
  };

  // Sort flights based on selected criteria
  const sortedFlights = (() => {
    switch (sortBy) {
      case "price":
        return [...flights].sort(
          (a, b) => getFlightPrice(a) - getFlightPrice(b),
        );
      case "duration":
        return [...flights].sort(
          (a, b) => getFlightDuration(a) - getFlightDuration(b),
        );
      case "best":
      default:
        return calculateBestRanking();
    }
  })();

  const handleSelectFlight = (flight: EnhancedFlightWithPaymentPlan) => {
    setSelectedFlight(flight);
    if (flight.paymentPlanEligible) {
      setIsModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-flightpay-slate-200 p-6 animate-pulse"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-4 bg-flightpay-slate-200 rounded w-3/4"></div>
                  <div className="h-6 bg-flightpay-slate-200 rounded w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-flightpay-slate-200 rounded w-20"></div>
                  <div className="h-4 bg-flightpay-slate-200 rounded w-16"></div>
                </div>
                <div className="h-10 bg-flightpay-slate-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12" data-testid="error-state">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-flightpay-slate-900 mb-2">
            Search Error
          </h3>
          <p className="text-flightpay-slate-600 mb-4">{error}</p>
          <p className="text-sm text-flightpay-slate-500">
            Please try again with different search criteria.
          </p>
        </div>
      </section>
    );
  }

  if (!flights.length) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12" data-testid="empty-state">
          <div className="text-flightpay-slate-400 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.329.94-5.829 2.172M15 19.128A9.059 9.059 0 0112 21c-2.161 0-4.071-.594-5.53-1.611A11.954 11.954 0 013 12a9 9 0 0118 0 11.954 11.954 0 01-3.47 7.389z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-flightpay-slate-900 mb-2">
            No Flights Found
          </h3>
          <p className="text-flightpay-slate-600">
            Try adjusting your search criteria or dates.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        data-testid="section-flight-results"
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-bold text-flightpay-slate-900"
            data-testid="title-flight-options"
          >
            Flight Options
          </h2>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best">Best</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" data-testid="button-filters">
              <Filter className="w-4 h-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {sortedFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onSelect={handleSelectFlight}
            />
          ))}
        </div>

        {selectedFlight && (
          <PaymentPlanModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            flight={selectedFlight}
          />
        )}
      </section>
    </>
  );
}
