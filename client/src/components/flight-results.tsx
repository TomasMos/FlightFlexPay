import { useState } from "react";
import {
  FlightWithPaymentPlan,
  RoundTripFlightWithPaymentPlan,
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

interface FlightResultsProps {
  flights: (EnhancedFlightWithPaymentPlan | RoundTripFlightWithPaymentPlan)[];
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

  // Helper functions defined first
  const isRoundTripFlight = (
    flight: EnhancedFlightWithPaymentPlan | RoundTripFlightWithPaymentPlan,
  ): flight is RoundTripFlightWithPaymentPlan => {
    return "outboundFlight" in flight && "returnFlight" in flight;
  };

  const parseDurationToMinutes = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return hours * 60 + minutes;
  };

  const getFlightPrice = (
    flight: EnhancedFlightWithPaymentPlan | RoundTripFlightWithPaymentPlan,
  ): number => {
    if (isRoundTripFlight(flight)) {
      return flight.totalPrice;
    }
    return parseFloat(flight.price.total);
  };

  const getFlightDuration = (
    flight: EnhancedFlightWithPaymentPlan | RoundTripFlightWithPaymentPlan,
  ): number => {
    if (isRoundTripFlight(flight)) {
      return (
        parseDurationToMinutes(flight.outboundFlight.duration) +
        parseDurationToMinutes(flight.returnFlight.duration)
      );
    }
    return parseDurationToMinutes(flight.duration);
  };

  const calculateBestRanking = (): (
    | FlightWithPaymentPlan
    | RoundTripFlightWithPaymentPlan
  )[] => {
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

  const handleSelectFlight = (flight: FlightWithPaymentPlan) => {
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
          {sortedFlights.map((flight) => {
            if (isRoundTripFlight(flight)) {
              return (
                <RoundTripFlightCard
                  key={flight.id}
                  flight={flight}
                  onSelect={handleSelectFlight}
                />
              );
            } else {
              return (
                <OneWayFlightCard
                  key={flight.id}
                  flight={flight}
                  onSelect={handleSelectFlight}
                />
              );
            }
          })}
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

// Component for one-way flights
function OneWayFlightCard({
  flight,
  onSelect,
}: {
  flight: EnhancedFlightWithPaymentPlan;
  onSelect: (flight: EnhancedFlightWithPaymentPlan) => void;
}) {
  const formatTime = (date: Date) => {
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

  const getAirlineCode = (flightNumber: string) => {
    return flightNumber.split(" ")[0] || "XX";
  };

  const getAirlineLogo = (code: string) => {
    const logos: Record<string, string> = {
      AA: "bg-blue-600",
      DL: "bg-red-600",
      UA: "bg-blue-800",
      WN: "bg-orange-600",
      B6: "bg-blue-500",
      AS: "bg-green-600",
      F9: "bg-green-500",
      NK: "bg-yellow-500",
      G4: "bg-purple-600",
      TP: "bg-green-700",
      TS: "bg-blue-700",
    };
    return logos[code] || "bg-flightpay-slate-600";
  };

  const airlineCode = getAirlineCode(flight.flightNumber);
  const totalPrice = parseFloat(flight.price.total);

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-flightpay-slate-200 hover:shadow-md transition-shadow p-6"
      data-testid={`card-flight-${flight.id}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Flight Details */}
        <div className="lg:col-span-2  h-full flex flex-col">
          <div className="flex items-center gap-4 mb-4 ">
            <div
              className={`w-8 h-8 ${getAirlineLogo(airlineCode)} rounded-full flex items-center justify-center`}
            >
              <span
                className="text-white text-sm font-bold"
                data-testid={`text-airline-code-${flight.id}`}
              >
                {airlineCode}
              </span>
            </div>
            <span
              className="font-medium text-flightpay-slate-900"
              data-testid={`text-airline-name-${flight.id}`}
            >
              {flight.airline}
            </span>
            <span
              className="text-sm text-flightpay-slate-500"
              data-testid={`text-flight-number-${flight.id}`}
            >
              {flight.flightNumber}
            </span>
          </div>

          <div className="flex items-center justify-center flex-grow ">
            <div className="text-center ">
              <div
                className="text-lg font-bold text-flightpay-slate-900"
                data-testid={`text-departure-time-${flight.id}`}
              >
                {formatTime(flight.departureTime)}
              </div>
              <div
                className="text-sm text-flightpay-slate-500"
                data-testid={`text-origin-${flight.id}`}
              >
                {flight.itineraries[0]?.segments[0]?.departure.airportName || flight.origin}
              </div>
            </div>
            <div className="flex-1 mx-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                <div
                  className="text-xs text-flightpay-slate-500"
                  data-testid={`text-duration-${flight.id}`}
                >
                  {formatDuration(flight.duration)}
                </div>
                <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
              </div>
              <div
                className="text-center text-xs text-flightpay-slate-500 mt-1"
                data-testid={`text-stops-${flight.id}`}
              >
                {(flight.itineraries[0]?.segments.length - 1) === 0
                  ? "Nonstop"
                  : `${flight.itineraries[0]?.segments.length - 1} stop${(flight.itineraries[0]?.segments.length - 1) > 1 ? "s" : ""}`}
              </div>
            </div>
            <div className="text-center">
              <div
                className="text-lg font-bold text-flightpay-slate-900"
                data-testid={`text-arrival-time-${flight.id}`}
              >
                {formatTime(flight.arrivalTime)}
              </div>
              <div
                className="text-sm text-flightpay-slate-500"
                data-testid={`text-destination-${flight.id}`}
              >
                {flight.itineraries[0]?.segments[flight.itineraries[0].segments.length - 1]?.arrival.airportName || flight.destination}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center lg:items-end gap-4">
          {/* Pricing */}
          <div className="text-center lg:text-left items-center flex flex-row justify-between gap-6">
            <div>
              <div
                className="text-2xl font-bold text-flightpay-slate-900 mb-1"
                data-testid={`text-price-${flight.id}`}
              >
                ${totalPrice.toFixed(0)}
              </div>
              <div className="text-sm text-flightpay-slate-500">per person</div>
            </div>

            {flight.paymentPlanEligible && flight.paymentPlan ? (
              <div
                className="bg-flightpay-secondary/10 rounded-lg p-3 border border-flightpay-secondary/20"
                data-testid={`payment-plan-preview-${flight.id}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-flightpay-secondary" />
                  <span className="text-sm font-medium text-flightpay-secondary">
                    Payment Plan Available
                  </span>
                </div>
                <div className="text-sm text-flightpay-slate-600">
                  Pay ${flight.paymentPlan.depositAmount.toFixed(0)} today, from
                  ${flight.paymentPlan.installmentAmount.toFixed(0)} per week
                </div>
              </div>
            ) : (
              <div className="text-sm text-flightpay-slate-500">
                No payment plans available <br />
                (start date is within 14 days)
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="w-1/2 flex flex-col gap-2">
            <Button
              onClick={() => onSelect(flight)}
              className="w-full bg-flightpay-primary hover:bg-flightpay-primary/90 text-white"
              data-testid={`button-select-${flight.id}`}
            >
              {flight.paymentPlanEligible
                ? "View Payment Options"
                : "Select Flight"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for round-trip flights
function RoundTripFlightCard({
  flight,
  onSelect,
}: {
  flight: RoundTripFlightWithPaymentPlan;
  onSelect: (flight: FlightWithPaymentPlan) => void;
}) {
  const formatTime = (date: Date) => {
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

  const getAirlineCode = (flightNumber: string) => {
    return flightNumber.split(" ")[0] || "XX";
  };

  const getAirlineLogo = (code: string) => {
    const logos: Record<string, string> = {
      AA: "bg-blue-600",
      DL: "bg-red-600",
      UA: "bg-blue-800",
      WN: "bg-orange-600",
      B6: "bg-blue-500",
      AS: "bg-green-600",
      F9: "bg-green-500",
      NK: "bg-yellow-500",
      G4: "bg-purple-600",
      TP: "bg-green-700",
      TS: "bg-blue-700",
    };
    return logos[code] || "bg-flightpay-slate-600";
  };

  const outboundCode = getAirlineCode(flight.outboundFlight.flightNumber);
  const returnCode = getAirlineCode(flight.returnFlight.flightNumber);

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-flightpay-slate-200 hover:shadow-md transition-shadow p-6"
      data-testid={`card-roundtrip-flight-${flight.id}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <div className="lg:col-span-2  h-full flex flex-col  gap-6">
          {/* Outbound Flight */}
          <div className="">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-8 h-8 ${getAirlineLogo(outboundCode)} rounded-full flex items-center justify-center`}
                >
                  <span className="text-white text-sm font-bold">
                    {outboundCode}
                  </span>
                </div>
                <span className="font-medium text-flightpay-slate-900">
                  {flight.outboundFlight.airline}
                </span>
                <span className="text-sm text-flightpay-slate-500">
                  {flight.outboundFlight.flightNumber}
                </span>
                <Badge variant="outline" className="text-xs">
                  Outbound
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-lg font-bold text-flightpay-slate-900">
                    {formatTime(flight.outboundFlight.departureTime)}
                  </div>
                  <div className="text-sm text-flightpay-slate-500">
                    {flight.outboundFlight.origin}
                  </div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                    <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                    <div className="text-xs text-flightpay-slate-500">
                      {formatDuration(flight.outboundFlight.duration)}
                    </div>
                    <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                    <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                  </div>
                  <div className="text-center text-xs text-flightpay-slate-500 mt-1">
                    {flight.outboundFlight.stops === 0
                      ? "Nonstop"
                      : `${flight.outboundFlight.stops} stop${flight.outboundFlight.stops > 1 ? "s" : ""}`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-flightpay-slate-900">
                    {formatTime(flight.outboundFlight.arrivalTime)}
                  </div>
                  <div className="text-sm text-flightpay-slate-500">
                    {flight.outboundFlight.destination}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Return Flight */}
          <div className="">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-8 h-8 ${getAirlineLogo(returnCode)} rounded-full flex items-center justify-center`}
                >
                  <span className="text-white text-sm font-bold">
                    {returnCode}
                  </span>
                </div>
                <span className="font-medium text-flightpay-slate-900">
                  {flight.returnFlight.airline}
                </span>
                <span className="text-sm text-flightpay-slate-500">
                  {flight.returnFlight.flightNumber}
                </span>
                <Badge variant="outline" className="text-xs">
                  Return
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-lg font-bold text-flightpay-slate-900">
                    {formatTime(flight.returnFlight.departureTime)}
                  </div>
                  <div className="text-sm text-flightpay-slate-500">
                    {flight.returnFlight.origin}
                  </div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                    <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                    <div className="text-xs text-flightpay-slate-500">
                      {formatDuration(flight.returnFlight.duration)}
                    </div>
                    <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                    <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                  </div>
                  <div className="text-center text-xs text-flightpay-slate-500 mt-1">
                    {flight.returnFlight.stops === 0
                      ? "Nonstop"
                      : `${flight.returnFlight.stops} stop${flight.returnFlight.stops > 1 ? "s" : ""}`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-flightpay-slate-900">
                    {formatTime(flight.returnFlight.arrivalTime)}
                  </div>
                  <div className="text-sm text-flightpay-slate-500">
                    {flight.returnFlight.destination}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="flex flex-col gap-4 justify-between">
          <div className="flex flex-col items-center lg:items-end">
            <div
              className="text-2xl font-bold text-flightpay-slate-900 mb-1"
              data-testid={`text-price-${flight.id}`}
            >
              ${flight.totalPrice.toFixed(0)}
            </div>
            <div className="text-sm text-flightpay-slate-500 mb-3">
              per person total
            </div>

            {flight.paymentPlanEligible && flight.paymentPlan ? (
              <div
                className="w-fit bg-flightpay-secondary/10 rounded-lg p-3 border border-flightpay-secondary/20"
                data-testid={`payment-plan-preview-${flight.id}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-flightpay-secondary" />
                  <span className="text-sm font-medium text-flightpay-secondary">
                    Payment Plan Available
                  </span>
                </div>
                <div className="text-sm text-flightpay-slate-600">
                  Pay ${flight.paymentPlan.depositAmount.toFixed(0)} today, from
                  ${flight.paymentPlan.installmentAmount.toFixed(0)} per week
                </div>
              </div>
            ) : (
              <div className="text-sm text-flightpay-slate-500">
                No payment plans available <br />
                (start date is within 14 days)
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 items-center lg:items-end">
            <Button
              onClick={() => onSelect(flight.outboundFlight)}
              className="w-1/2 bg-flightpay-primary hover:bg-flightpay-primary/90 text-white"
              data-testid={`button-select-${flight.id}`}
            >
              {flight.paymentPlanEligible
                ? "View Payment Options"
                : "Select Round Trip"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
