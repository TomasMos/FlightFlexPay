import { useState } from "react";
import { FlightWithPaymentPlan } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, CreditCard, Filter } from "lucide-react";
import { PaymentPlanModal } from "./payment-plan-modal.tsx";

interface FlightResultsProps {
  flights: FlightWithPaymentPlan[];
  isLoading: boolean;
  error?: string;
}

export function FlightResults({ flights, isLoading, error }: FlightResultsProps) {
  const [selectedFlight, setSelectedFlight] = useState<FlightWithPaymentPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("best");

  // Helper functions defined first
  const parseDurationToMinutes = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return 0;
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    return hours * 60 + minutes;
  };

  const calculateBestScore = (flight: FlightWithPaymentPlan): number => {
    let score = 0;
    const price = parseFloat(flight.price.toString());
    
    // Lower price is better (max 50 points)
    score += Math.max(0, 50 - (price / 20));
    
    // Payment plan availability adds points
    if (flight.paymentPlanEligible) score += 30;
    
    // Fewer stops is better
    score += Math.max(0, 20 - (flight.stops * 10));
    
    // Shorter duration is better (rough estimate)
    const duration = parseDurationToMinutes(flight.duration);
    score += Math.max(0, 20 - (duration / 30));
    
    return score;
  };

  // Sort flights based on selected criteria
  const sortedFlights = [...flights].sort((a, b) => {
    const priceA = parseFloat(a.price.toString());
    const priceB = parseFloat(b.price.toString());
    
    switch (sortBy) {
      case "price":
        return priceA - priceB;
      case "duration":
        const durationA = parseDurationToMinutes(a.duration);
        const durationB = parseDurationToMinutes(b.duration);
        return durationA - durationB;
      case "departure":
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      case "best":
      default:
        // Best value: combination of price, payment plan availability, and stops
        const scoreA = calculateBestScore(a);
        const scoreB = calculateBestScore(b);
        return scoreB - scoreA; // Higher score first
    }
  });

  const handleSelectFlight = (flight: FlightWithPaymentPlan) => {
    setSelectedFlight(flight);
    if (flight.paymentPlanEligible) {
      setIsModalOpen(true);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (duration: string) => {
    // Parse ISO 8601 duration format (PT5H45M)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return duration;
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    
    return `${hours}h ${minutes}m`;
  };

  const getAirlineCode = (flightNumber: string) => {
    return flightNumber.split(' ')[0] || 'XX';
  };

  const getAirlineLogo = (code: string) => {
    const logoMap: Record<string, string> = {
      'UA': 'bg-blue-600',
      'DL': 'bg-red-600', 
      'AA': 'bg-blue-800',
      'SW': 'bg-orange-600',
      'JB': 'bg-blue-500',
    };
    return logoMap[code] || 'bg-gray-600';
  };

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12" data-testid="loading-state">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-flightpay-primary mb-4"></div>
          <p className="text-flightpay-slate-600">Searching for the best flights and payment plans...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12" data-testid="error-state">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-flightpay-slate-900 mb-2">Search Error</h3>
          <p className="text-flightpay-slate-600 mb-4">{error}</p>
          <p className="text-sm text-flightpay-slate-500">Please try again with different search criteria.</p>
        </div>
      </section>
    );
  }

  if (!flights.length) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12" data-testid="empty-state">
          <div className="text-flightpay-slate-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.329.94-5.829 2.172M15 19.128A9.059 9.059 0 0112 21c-2.161 0-4.071-.594-5.53-1.611A11.954 11.954 0 013 12a9 9 0 0118 0 11.954 11.954 0 01-3.47 7.389z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-flightpay-slate-900 mb-2">No Flights Found</h3>
          <p className="text-flightpay-slate-600">Try adjusting your search criteria or dates.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="section-flight-results">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-flightpay-slate-900" data-testid="title-flight-options">
            Flight Options
          </h2>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best">Sort by: Best</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="duration">Duration: Shortest</SelectItem>
                <SelectItem value="departure">Departure Time</SelectItem>
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
            const airlineCode = getAirlineCode(flight.flightNumber);
            const totalPrice = parseFloat(flight.price.toString());
            
            return (
              <div
                key={flight.id}
                className="bg-white rounded-xl shadow-sm border border-flightpay-slate-200 hover:shadow-md transition-shadow p-6"
                data-testid={`card-flight-${flight.id}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                  {/* Flight Details */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-8 h-8 ${getAirlineLogo(airlineCode)} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-sm font-bold" data-testid={`text-airline-code-${flight.id}`}>
                          {airlineCode}
                        </span>
                      </div>
                      <span className="font-medium text-flightpay-slate-900" data-testid={`text-airline-name-${flight.id}`}>
                        {flight.airline}
                      </span>
                      <span className="text-sm text-flightpay-slate-500" data-testid={`text-flight-number-${flight.id}`}>
                        {flight.flightNumber}
                      </span>
                      {totalPrice > 500 && (
                        <Badge variant="secondary" className="bg-flightpay-accent text-white" data-testid={`badge-best-value-${flight.id}`}>
                          Best Value
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-lg font-bold text-flightpay-slate-900" data-testid={`text-departure-time-${flight.id}`}>
                          {formatTime(flight.departureTime)}
                        </div>
                        <div className="text-sm text-flightpay-slate-500" data-testid={`text-origin-${flight.id}`}>
                          {flight.origin}
                        </div>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                          <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                          <div className="text-xs text-flightpay-slate-500" data-testid={`text-duration-${flight.id}`}>
                            {formatDuration(flight.duration)}
                          </div>
                          <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                          <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                        </div>
                        <div className="text-center text-xs text-flightpay-slate-500 mt-1" data-testid={`text-stops-${flight.id}`}>
                          {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-flightpay-slate-900" data-testid={`text-arrival-time-${flight.id}`}>
                          {formatTime(flight.arrivalTime)}
                        </div>
                        <div className="text-sm text-flightpay-slate-500" data-testid={`text-destination-${flight.id}`}>
                          {flight.destination}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-flightpay-slate-900 mb-1" data-testid={`text-price-${flight.id}`}>
                      ${totalPrice.toFixed(0)}
                    </div>
                    <div className="text-sm text-flightpay-slate-500 mb-3">per person</div>
                    
                    {flight.paymentPlanEligible && flight.paymentPlan ? (
                      <div className="bg-flightpay-secondary/10 rounded-lg p-3 border border-flightpay-secondary/20" data-testid={`payment-plan-preview-${flight.id}`}>
                        <div className="text-sm font-medium text-flightpay-secondary mb-1">Payment Plan Available</div>
                        <div className="text-xs text-flightpay-slate-600">
                          <span data-testid={`text-deposit-${flight.id}`}>${flight.paymentPlan.depositAmount.toFixed(0)} today</span> + 
                          <span data-testid={`text-installments-${flight.id}`}> {flight.paymentPlan.installmentCount} payments of ${flight.paymentPlan.installmentAmount.toFixed(0)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200" data-testid={`payment-plan-unavailable-${flight.id}`}>
                        <div className="text-sm font-medium text-red-600 mb-1">Payment Plan Not Available</div>
                        <div className="text-xs text-flightpay-slate-600">
                          Travel date too soon for installments
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="text-center lg:text-right">
                    <Button
                      onClick={() => handleSelectFlight(flight)}
                      className={`font-semibold px-6 py-3 rounded-lg transition-colors mb-2 w-full lg:w-auto ${
                        flight.paymentPlanEligible 
                          ? "bg-flightpay-primary hover:bg-blue-700 text-white"
                          : "bg-flightpay-slate-600 hover:bg-flightpay-slate-700 text-white"
                      }`}
                      data-testid={`button-select-flight-${flight.id}`}
                    >
                      {flight.paymentPlanEligible ? "Select Flight" : "Book Now"}
                    </Button>
                    <div className="text-xs text-flightpay-slate-500" data-testid={`text-security-${flight.id}`}>
                      {flight.paymentPlanEligible ? (
                        <>
                          <Shield className="inline w-3 h-3 text-flightpay-secondary mr-1" />
                          Secure payment plans
                        </>
                      ) : (
                        <>
                          <CreditCard className="inline w-3 h-3 text-flightpay-slate-400 mr-1" />
                          Full payment required
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedFlight && (
        <PaymentPlanModal
          flight={selectedFlight}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFlight(null);
          }}
        />
      )}
    </>
  );
}
