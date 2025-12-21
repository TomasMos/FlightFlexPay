import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle } from "lucide-react";
import { EnhancedFlightWithPaymentPlan } from "@shared/schema";
import { Carrier } from "@/components/carrier";
import { formatTime, formatDuration, formattedPrice } from "@/utils/formatters";
import { useCurrency } from "@/contexts/CurrencyContext";
import { trackFlightView } from "@/lib/metaPixel";
import { trackFlightInspectGTM } from "@/lib/analytics";

export function FlightCard({
  flight,
  onSelect,
  onPaymentPlanClick,
}: {
  flight: EnhancedFlightWithPaymentPlan;
  onSelect: (flight: EnhancedFlightWithPaymentPlan) => void;
  onPaymentPlanClick?: (flight: EnhancedFlightWithPaymentPlan) => void;
}) {
  const { currencySymbol } = useCurrency();
  const pricePerTraveller =
    parseFloat(flight.price.total) / (flight?.numberOfPassengers || 1);

  return (
    <div
      className="bg-white rounded-xl hover:shadow-xl transition-all duration-300 shadow-md border border-splickets-slate-200 hover:shadow-md transition-shadow p-6 hover:scale-[1.01]"
      data-testid={`card-flight-${flight.id}`}
      
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Flight Details */}
        <div className="lg:col-span-2 flex flex-col">
          {/*Airline & Flight Information  */}
          <Carrier flight={flight} />

          <div className="flex flex-col gap-4 mt-4">
            {/* Map over all itineraries */}
            {flight.itineraries.map((itinerary, index) => {
              const firstSegment = itinerary.segments[0];
              const lastSegment =
                itinerary.segments[itinerary.segments.length - 1];

              return (
                <div
                  key={index}
                  className={`flex items-center justify-center ${index > 0 ? "border-t pt-4" : ""}`}
                >
                  <div className="text-left w-[100px] ">
                    <div
                      className="text-lg font-bold text-splickets-slate-900"
                      data-testid={`text-departure-time-${flight.id}-${index}`}
                    >
                      {formatTime(firstSegment.departure.at)}
                    </div>
                    <div
                      className="text-sm text-splickets-slate-500"
                      data-testid={`text-origin-${flight.id}-${index}`}
                    >
                      {firstSegment.departure.iataCode}
                    </div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-splickets-slate-300 rounded-full"></div>
                      <div className="flex-1 h-px bg-splickets-slate-300 mx-2"></div>
                      <div
                        className="text-xs text-splickets-slate-500"
                        data-testid={`text-duration-${flight.id}-${index}`}
                      >
                        {formatDuration(itinerary.duration)}
                      </div>
                      <div className="flex-1 h-px bg-splickets-slate-300 mx-2"></div>
                      <div className="w-2 h-2 bg-splickets-slate-300 rounded-full"></div>
                    </div>
                    <div
                      className="text-center text-xs text-splickets-slate-500 mt-1"
                      data-testid={`text-stops-${flight.id}-${index}`}
                    >
                      {itinerary.segments.length - 1 === 0
                        ? "Nonstop"
                        : `${itinerary.segments.length - 1} stop${itinerary.segments.length - 1 > 1 ? "s" : ""}`}
                    </div>
                  </div>
                  <div className="text-right w-[100px]">
                    <div
                      className="text-lg font-bold text-splickets-slate-900 "
                      data-testid={`text-arrival-time-${flight.id}-${index}`}
                    >
                      {formatTime(lastSegment.arrival.at)}
                    </div>
                    <div
                      className="text-sm text-splickets-slate-500"
                      data-testid={`text-destination-${flight.id}-${index}`}
                    >
                      {lastSegment.arrival.iataCode}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col items-center lg:items-end gap-4">
          {/* Pricing */}
          <div className="items-center  flex flex-col gap-6">
            <div className="flex flex-row w-full  justify-center ">
              <div className="w-full">
                <div
                  className="text-2xl text-center font-bold text-splickets-slate-900  mb-1"
                  data-testid={`text-price-${flight.id}`}
                >
                  {currencySymbol}{formattedPrice(Number(pricePerTraveller))}
                </div>
                <div className="text-sm text-center text-splickets-slate-500">
                  per person
                </div>
              </div>
              {flight?.numberOfPassengers && flight.numberOfPassengers > 1 ? (
                <div className="  w-full text-center">
                  <div
                    className="text-2xl text-center font-bold  text-splickets-slate-900  mb-1"
                    data-testid={`text-price-${flight.id}`}
                  >
                    {currencySymbol}{formattedPrice(Number(flight.price.total))}
                  </div>
                  <div className="text-sm text-splickets-slate-500">
                    in total
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>

            {flight.paymentPlanEligible && flight.paymentPlan ? (
              <div
                className="bg-splickets-secondary/10 rounded-lg p-3 border border-splickets-secondary/20 flex flex-col items-center w-full"
                data-testid={`payment-plan-preview-${flight.id}`}
              >
                <div className="flex  items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-splickets-primary" />
                  <span className="text-sm text-center font-medium text-splickets-primary">
                    Payment Plan Available
                  </span>
                </div>
                <div className="text-sm text-center text-splickets-slate-600">
                  Pay {currencySymbol}
                  {formattedPrice(Number(flight.paymentPlan.depositAmount))} today, and{" "}
                  {currencySymbol}
                  {formattedPrice(Number(flight.paymentPlan.installmentAmount))} per week
                </div>
              </div>
            ) : (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-2 w-full">
        <div className="text-sm text-splickets-primary">
          <p>
            Payment plans are available for flights more than 3 weeks away.
          </p>
        </div>
      </div>
            )}
            <div className="flex flex-col gap-3 w-full">
            {flight.paymentPlanEligible && onPaymentPlanClick && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary bg-white hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 px-8 w-full"
                  data-testid="button-payment-plan"
                  onClick={() => {
                    onPaymentPlanClick(flight);
                  }}
                >
                  Payment Plan
                </Button>
              )}
              <Button
                size="lg"
                className="bg-primary hover:bg-blue-700 text-white px-8 w-full"
                data-testid="button-select-flight"
                onClick={() => {
                  // Track flight view in Meta Pixel
                  const route = `${flight.itineraries[0]?.segments[0]?.departure?.iataCode || ''} → ${flight.itineraries[0]?.segments[flight.itineraries[0]?.segments.length - 1]?.arrival?.iataCode || ''}`;
                  trackFlightView(flight.id, route, parseFloat(flight.price.total), flight.price.currency);

                  // Track Google Tag Manager event
                  trackFlightInspectGTM(flight.id, route, parseFloat(flight.price.total), flight.price.currency);

                  onSelect(flight);
                }}
              >
                More Details
              </Button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
