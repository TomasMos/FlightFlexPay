import { useState, useMemo } from "react";
import { EnhancedFlightWithPaymentPlan } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Filter, X, ArrowUpDown } from "lucide-react";
import { ItineraryModal } from "./itinerary-modal";
import { PaymentPlanModal } from "./payment-plan-modal";
import { FlightCard } from "@/components/flight-card.tsx";
import { parseDurationToMinutes } from "@/utils/formatters";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface FlightResultsProps {
  flights: EnhancedFlightWithPaymentPlan[];
  searchId: number;
  isLoading: boolean;
  error?: string;
}

type StopFilter = "direct" | "1stop" | "2plus";
type TimeOfDay = "early_morning" | "morning" | "afternoon" | "evening";

interface Filters {
  stops: StopFilter[];
  airlines: string[];
  departureTime: TimeOfDay[];
  returnTime: TimeOfDay[];
}

const TIME_RANGES: Record<TimeOfDay, { label: string; start: number; end: number }> = {
  early_morning: { label: "Early Morning (00:00 - 04:59)", start: 0, end: 4 },
  morning: { label: "Morning (05:00 - 11:59)", start: 5, end: 11 },
  afternoon: { label: "Afternoon (12:00 - 17:59)", start: 12, end: 17 },
  evening: { label: "Evening (18:00 - 23:59)", start: 18, end: 23 },
};

function getTimeOfDay(dateString: string): TimeOfDay {
  const date = new Date(dateString);
  const hour = date.getHours();
  
  if (hour >= 0 && hour <= 4) return "early_morning";
  if (hour >= 5 && hour <= 11) return "morning";
  if (hour >= 12 && hour <= 17) return "afternoon";
  return "evening";
}

function getStopsCount(itinerary: { segments: unknown[] }): number {
  return Math.max(0, itinerary.segments.length - 1);
}

function getStopFilter(stops: number): StopFilter | null {
  if (stops === 0) return "direct";
  if (stops === 1) return "1stop";
  if (stops >= 2) return "2plus";
  return null;
}

export function FlightResults({
  flights,
  searchId,
  isLoading,
  error,
}: FlightResultsProps) {
  const [selectedFlight, setSelectedFlight] =
    useState<EnhancedFlightWithPaymentPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentPlanFlight, setSelectedPaymentPlanFlight] =
    useState<EnhancedFlightWithPaymentPlan | null>(null);
  const [isPaymentPlanModalOpen, setIsPaymentPlanModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("price");
  const [filters, setFilters] = useState<Filters>({
    stops: [],
    airlines: [],
    departureTime: [],
    returnTime: [],
  });
  const [isFiltersSheetOpen, setIsFiltersSheetOpen] = useState(false);

  const getFlightPrice = (flight: EnhancedFlightWithPaymentPlan): number => {
    return parseFloat(flight.price.total);
  };

  localStorage.setItem("searchId", String(searchId));

  // Extract unique airlines from flights
  const availableAirlines = useMemo(() => {
    const airlineSet = new Set<string>();
    flights.forEach((flight) => {
      flight.airlines?.forEach((airline) => airlineSet.add(airline));
      // Also check segments for airlines
      flight.itineraries.forEach((itinerary) => {
        itinerary.segments.forEach((segment) => {
          if (segment.airline) airlineSet.add(segment.airline);
        });
      });
    });
    return Array.from(airlineSet).sort();
  }, [flights]);

  // Check if there are return flights
  const hasReturnFlights = useMemo(() => {
    return flights.some((flight) => flight.itineraries.length > 1);
  }, [flights]);

  // Filter toggle handlers
  const toggleFilter = (
    filterType: keyof Filters,
    value: string | StopFilter | TimeOfDay
  ) => {
    setFilters((prev) => {
      const currentValues = prev[filterType] as string[];
      const newValues = currentValues.includes(value as string)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value as string];
      return { ...prev, [filterType]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({
      stops: [],
      airlines: [],
      departureTime: [],
      returnTime: [],
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.stops.length > 0 ||
      filters.airlines.length > 0 ||
      filters.departureTime.length > 0 ||
      filters.returnTime.length > 0
    );
  }, [filters]);

  const getTotalItineraryDuration = (
    flight: EnhancedFlightWithPaymentPlan,
  ): number => {
    let totalDuration: number = 0;

    flight.itineraries.forEach((itinerary) => {
      totalDuration = parseDurationToMinutes(itinerary.duration);
    });
    return totalDuration;
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
      (a, b) => getTotalItineraryDuration(a) - getTotalItineraryDuration(b),
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

  // Apply filters and sort flights
  const filteredAndSortedFlights = useMemo(() => {
    let filtered = [...flights];

    // Apply stop filters
    if (filters.stops.length > 0) {
      filtered = filtered.filter((flight) => {
        return flight.itineraries.some((itinerary) => {
          const stops = getStopsCount(itinerary);
          const stopFilter = getStopFilter(stops);
          return stopFilter && filters.stops.includes(stopFilter);
        });
      });
    }

    // Apply airline filters
    if (filters.airlines.length > 0) {
      filtered = filtered.filter((flight) => {
        const flightAirlines = new Set<string>();
        flight.airlines?.forEach((a) => flightAirlines.add(a));
        flight.itineraries.forEach((itinerary) => {
          itinerary.segments.forEach((segment) => {
            if (segment.airline) flightAirlines.add(segment.airline);
          });
        });
        return filters.airlines.some((filterAirline) =>
          flightAirlines.has(filterAirline)
        );
      });
    }

    // Apply departure time filters
    if (filters.departureTime.length > 0) {
      filtered = filtered.filter((flight) => {
        const firstItinerary = flight.itineraries[0];
        if (!firstItinerary || firstItinerary.segments.length === 0) return false;
        const departureTime = firstItinerary.segments[0].departure.at;
        const timeOfDay = getTimeOfDay(departureTime);
        return filters.departureTime.includes(timeOfDay);
      });
    }

    // Apply return time filters (for return flights) - using arrival time
    if (filters.returnTime.length > 0) {
      filtered = filtered.filter((flight) => {
        const returnItinerary = flight.itineraries[1];
        if (!returnItinerary || returnItinerary.segments.length === 0) return false;
        const lastSegment = returnItinerary.segments[returnItinerary.segments.length - 1];
        const returnArrivalTime = lastSegment.arrival.at;
        const timeOfDay = getTimeOfDay(returnArrivalTime);
        return filters.returnTime.includes(timeOfDay);
      });
    }

    // Sort flights
    switch (sortBy) {
      case "price":
        return filtered.sort((a, b) => getFlightPrice(a) - getFlightPrice(b));
      case "duration":
        return filtered.sort(
          (a, b) => getTotalItineraryDuration(a) - getTotalItineraryDuration(b)
        );
      case "best":
      default:
        // Recalculate best ranking for filtered flights
        if (filtered.length === 0) return [];
        const priceRanks = new Map<string, number>();
        const sortedByPrice = [...filtered].sort(
          (a, b) => getFlightPrice(a) - getFlightPrice(b)
        );
        sortedByPrice.forEach((flight, index) => {
          priceRanks.set(flight.id, index + 1);
        });

        const durationRanks = new Map<string, number>();
        const sortedByDuration = [...filtered].sort(
          (a, b) => getTotalItineraryDuration(a) - getTotalItineraryDuration(b)
        );
        sortedByDuration.forEach((flight, index) => {
          durationRanks.set(flight.id, index + 1);
        });

        const flightsWithAvgRank = filtered.map((flight) => {
          const priceRank = priceRanks.get(flight.id) || 1;
          const durationRank = durationRanks.get(flight.id) || 1;
          const avgRank = (priceRank + durationRank) / 2;
          return { ...flight, avgRank };
        });

        return flightsWithAvgRank.sort((a, b) => a.avgRank - b.avgRank);
    }
  }, [flights, filters, sortBy]);

  const handleSelectFlight = (flight: EnhancedFlightWithPaymentPlan) => {
    setSelectedFlight(flight);
    setIsModalOpen(true);
  };

  const handlePaymentPlanClick = (flight: EnhancedFlightWithPaymentPlan) => {
    setSelectedPaymentPlanFlight(flight);
    setIsPaymentPlanModalOpen(true);
  };

  // Filter panel component
  const FiltersPanel = ({ onClose }: { onClose?: () => void }) => ( 
    <div className="space-y-6 pb-6">
     

      {/* Sort Dropdown - Desktop Only */}
      <div className="hidden lg:block">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full [&>svg.opacity-50]:hidden" data-testid="select-sort-desktop">
            <SelectValue />
            <ArrowUpDown className="h-4 w-4 text-splickets-slate-500 ml-auto shrink-0" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="best">Best</SelectItem>
            <SelectItem value="price">Cheapest</SelectItem>
            <SelectItem value="duration">Shortest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      
      <Separator className="lg:block hidden" />

      {/* Number of Stops */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-splickets-slate-700">
          Number of Stops
        </Label>
        <div className="space-y-2">
          {(["direct", "1stop", "2plus"] as StopFilter[]).map((stop) => (
            <div key={stop} className="flex items-center space-x-2">
              <Checkbox
                id={`stop-${stop}`}
                checked={filters.stops.includes(stop)}
                onCheckedChange={() => toggleFilter("stops", stop)}
              />
              <Label
                htmlFor={`stop-${stop}`}
                className="text-sm font-normal cursor-pointer"
              >
                {stop === "direct"
                  ? "Direct"
                  : stop === "1stop"
                  ? "1 Stop"
                  : "2+ Stops"}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Airlines */}
      {availableAirlines.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-splickets-slate-700">
            Airlines
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableAirlines.map((airline) => (
              <div key={airline} className="flex items-center space-x-2">
                <Checkbox
                  id={`airline-${airline}`}
                  checked={filters.airlines.includes(airline)}
                  onCheckedChange={() => toggleFilter("airlines", airline)}
                />
                <Label
                  htmlFor={`airline-${airline}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {airline}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Departure Time */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-splickets-slate-700">
          Departure Time
        </Label>
        <div className="space-y-2">
          {(
            [
              "early_morning",
              "morning",
              "afternoon",
              "evening",
            ] as TimeOfDay[]
          ).map((time) => (
            <div key={time} className="flex items-center space-x-2">
              <Checkbox
                id={`departure-${time}`}
                checked={filters.departureTime.includes(time)}
                onCheckedChange={() => toggleFilter("departureTime", time)}
              />
              <Label
                htmlFor={`departure-${time}`}
                className="text-sm font-normal cursor-pointer"
              >
                {TIME_RANGES[time].label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Return Time - only show if there are return flights */}
      {hasReturnFlights && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-medium text-splickets-slate-700">
              Return Flight Arrival Time
            </Label>
            <div className="space-y-2">
              {(
                [
                  "early_morning",
                  "morning",
                  "afternoon",
                  "evening",
                ] as TimeOfDay[]
              ).map((time) => (
                <div key={time} className="flex items-center space-x-2">
                  <Checkbox
                    id={`return-${time}`}
                    checked={filters.returnTime.includes(time)}
                    onCheckedChange={() => toggleFilter("returnTime", time)}
                  />
                  <Label
                    htmlFor={`return-${time}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {TIME_RANGES[time].label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Clear Filters Button - Desktop Only (Mobile version is in modal footer) */}
      <div className="hidden lg:block">
        <Separator />
        <Button
          variant="outline"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="w-full"
          data-testid="button-clear-filters"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-splickets-slate-200 p-6 animate-pulse"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-4 bg-splickets-slate-200 rounded w-3/4"></div>
                  <div className="h-6 bg-splickets-slate-200 rounded w-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-splickets-slate-200 rounded w-20"></div>
                  <div className="h-4 bg-splickets-slate-200 rounded w-16"></div>
                </div>
                <div className="h-10 bg-splickets-slate-200 rounded w-24"></div>
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
          <h3 className="text-lg font-semibold text-splickets-slate-900 mb-2">
            Search Error
          </h3>
          <p className="text-splickets-slate-600 mb-4">{error}</p>
          <p className="text-sm text-splickets-slate-500">
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
          <div className="text-splickets-slate-400 mb-4">
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
          <h3 className="text-lg font-semibold text-splickets-slate-900 mb-2">
            No Flights Found
          </h3>
          <p className="text-splickets-slate-600">
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
        {/* Header with Sort (Mobile) and Mobile Filters Button */}
        <div className="flex justify-between items-center mb-6">
          {/* Sort Dropdown - Mobile Only */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-10  lg:hidden [&>svg.opacity-50]:hidden" data-testid="select-sort">
              <SelectValue />
              <ArrowUpDown className="h-4 w-4 text-splickets-slate-500 ml-auto shrink-0" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="best">Best</SelectItem>
              <SelectItem value="price">Cheapest</SelectItem>
              <SelectItem value="duration">Shortest</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Mobile Filters Button */}
          <Sheet open={isFiltersSheetOpen} onOpenChange={setIsFiltersSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="w-40 h-10 lg:hidden justify-between"
                data-testid="button-filters-mobile"
              >
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {filters.stops.length +
                      filters.airlines.length +
                      filters.departureTime.length +
                      filters.returnTime.length}
                  </Badge>
                )}
                <Filter className="w-4 h-4 ml-1" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-screen max-h-screen rounded-none p-0">
              <div className="h-full flex flex-col">
                <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <SheetTitle>Filters 
                      <Label className="text-sm font-medium text-splickets-slate-700 ml-2">
        - {filteredAndSortedFlights.length} {filteredAndSortedFlights.length === 1 ? 'flight' : 'flights'} found

        </Label></SheetTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFiltersSheetOpen(false)}
                      className="lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-6 py-0 min-h-0">
                  <FiltersPanel onClose={() => setIsFiltersSheetOpen(false)} />
                </div>
                {/* Mobile Footer with Clear Button */}
                <div className="px-6 py-4 border-t bg-white flex-shrink-0 lg:hidden">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full disabled:bg-splickets-slate-100 disabled:text-splickets-slate-400 disabled:border-splickets-slate-200 disabled:cursor-not-allowed"
                    data-testid="button-clear-filters-mobile"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content: Filters Sidebar + Flight Cards */}
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-splickets-slate-200 p-6 ">
              <FiltersPanel />
            </div>
          </aside>

          {/* Flight Cards */}
          <div className="flex-1 space-y-4">
            {filteredAndSortedFlights.length === 0 ? (
              <div className="text-center py-12" data-testid="no-results">
                <div className="text-splickets-slate-400 mb-4">
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
                <h3 className="text-lg font-semibold text-splickets-slate-900 mb-2">
                  No Flights Match Your Filters
                </h3>
                <p className="text-splickets-slate-600 mb-4">
                  Try adjusting your filters to see more results.
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    data-testid="button-clear-filters-no-results"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              filteredAndSortedFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onSelect={handleSelectFlight}
                  onPaymentPlanClick={handlePaymentPlanClick}
                />
              ))
            )}
          </div>
        </div>

        {selectedFlight && (
          <ItineraryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            flight={selectedFlight}
          />
        )}

        {selectedPaymentPlanFlight && (
          <PaymentPlanModal
            isOpen={isPaymentPlanModalOpen}
            onClose={() => setIsPaymentPlanModalOpen(false)}
            flight={selectedPaymentPlanFlight}
          />
        )}
      </section>
    </>
  );
}
