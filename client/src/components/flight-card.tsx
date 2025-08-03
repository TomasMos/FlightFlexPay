import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { EnhancedFlightWithPaymentPlan } from "@shared/schema";
import { Carrier } from "@/components/carrier";
import { formatTime, formatDuration } from "@/utils/formatters";

// Component for one-way flights
export function FlightCard({
  flight,
  onSelect,
}: {
  flight: EnhancedFlightWithPaymentPlan;
  onSelect: (flight: EnhancedFlightWithPaymentPlan) => void;
}) {
  const pricePerTraveller =
    parseFloat(flight.price.total) / (flight?.numberOfPassengers || 1);

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-flightpay-slate-200 hover:shadow-md transition-shadow p-6 cursor-pointer"
      data-testid={`card-flight-${flight.id}`}
      onClick={() => onSelect(flight)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Flight Details */}
        <div className="lg:col-span-2  h-full flex flex-col">
          {/*Airline & Flight Information  */}
          <Carrier flight={flight} />

          <div className="flex flex-col gap-4 h-full">
            {/* Outbound Flight */}
            <div className="flex items-center justify-center flex-grow">
              <div className="text-left w-[100px] ">
                <div
                  className="text-lg font-bold text-flightpay-slate-900"
                  data-testid={`text-departure-time-${flight.id}`}
                >
                  {formatTime(flight.itineraries[0]?.segments[0]?.departure.at)}
                </div>
                <div
                  className="text-sm text-flightpay-slate-500"
                  data-testid={`text-origin-${flight.id}`}
                >
                  {flight.itineraries[0]?.segments[0]?.departure.airportName ||
                    flight.origin}
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
                    {formatDuration(
                      flight.itineraries[0]?.duration || flight.duration,
                    )}
                  </div>
                  <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                  <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                </div>
                <div
                  className="text-center text-xs text-flightpay-slate-500 mt-1"
                  data-testid={`text-stops-${flight.id}`}
                >
                  {flight.itineraries[0]?.segments.length - 1 === 0
                    ? "Nonstop"
                    : `${flight.itineraries[0]?.segments.length - 1} stop${flight.itineraries[0]?.segments.length - 1 > 1 ? "s" : ""}`}
                </div>
              </div>
              <div className="text-right w-[100px]">
                <div
                  className="text-lg font-bold text-flightpay-slate-900 "
                  data-testid={`text-arrival-time-${flight.id}`}
                >
                  {formatTime(
                    flight.itineraries[0]?.segments[
                      flight.itineraries[0].segments.length - 1
                    ]?.arrival.at,
                  )}
                </div>
                <div
                  className="text-sm text-flightpay-slate-500"
                  data-testid={`text-destination-${flight.id}`}
                >
                  {flight.itineraries[0]?.segments[
                    flight.itineraries[0].segments.length - 1
                  ]?.arrival.airportName || flight.destination}
                </div>
              </div>
            </div>

            {/* Return Flight (if exists) */}
            {flight.itineraries.length > 1 && (
              <div className="flex items-center justify-center flex-grow border-t pt-4">
                <div className="text-left w-[100px]">
                  <div
                    className="text-lg font-bold text-flightpay-slate-900"
                    data-testid={`text-return-departure-time-${flight.id}`}
                  >
                    {formatTime(flight.itineraries[1].segments[0].departure.at)}
                  </div>
                  <div
                    className="text-sm text-flightpay-slate-500"
                    data-testid={`text-return-origin-${flight.id}`}
                  >
                    {flight.itineraries[1].segments[0].departure.airportName}
                  </div>
                </div>

                <div className="flex-1 mx-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                    <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                    <div
                      className="text-xs text-flightpay-slate-500"
                      data-testid={`text-return-duration-${flight.id}`}
                    >
                      {formatDuration(flight.itineraries[1].duration)}
                    </div>
                    <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                    <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                  </div>
                  <div
                    className="text-center text-xs text-flightpay-slate-500 mt-1"
                    data-testid={`text-return-stops-${flight.id}`}
                  >
                    {flight.itineraries[1].segments.length - 1 === 0
                      ? "Nonstop"
                      : `${flight.itineraries[1].segments.length - 1} stop${flight.itineraries[1].segments.length - 1 > 1 ? "s" : ""}`}
                  </div>
                </div>
                <div className="text-right w-[100px]">
                  <div
                    className="text-lg font-bold text-flightpay-slate-900"
                    data-testid={`text-return-arrival-time-${flight.id}`}
                  >
                    {formatTime(
                      flight.itineraries[1].segments[
                        flight.itineraries[1].segments.length - 1
                      ].arrival.at,
                    )}
                  </div>
                  <div
                    className="text-sm text-flightpay-slate-500"
                    data-testid={`text-return-destination-${flight.id}`}
                  >
                    {
                      flight.itineraries[1].segments[
                        flight.itineraries[1].segments.length - 1
                      ].arrival.airportName
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center lg:items-end gap-4">
          {/* Pricing */}
          <div className="items-center lg:items-end flex flex-col gap-6">
            <div
              className={` flex flex-row w-full  ${
                flight?.numberOfPassengers && flight.numberOfPassengers > 1
                  ? "lg:justify-end lg:gap-10 justify-around"
                  : "lg:justify-end justify-center"
              }`}
            >
              <div className="">
                <div
                  className="text-2xl text-center lg:text-right font-bold text-flightpay-slate-900  mb-1"
                  data-testid={`text-price-${flight.id}`}
                >
                  ${pricePerTraveller.toFixed(0)}
                </div>
                <div className="text-sm text-flightpay-slate-500 lg:text-right">
                  per person
                </div>
              </div>
              {flight?.numberOfPassengers && flight.numberOfPassengers > 1 ? (
                <div className=" text-center">
                  <div
                    className="text-2xl text-center lg:text-right font-bold text-flightpay-slate-900  mb-1"
                    data-testid={`text-price-${flight.id}`}
                  >
                    ${parseFloat(flight.price.total).toFixed(0)}
                  </div>
                  <div className="text-sm text-flightpay-slate-500 lg:text-right">
                    in total
                  </div>
                </div>
              ) : (
                <></>
              )}
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
                (departure is within 14 days)
              </div>
            )}
          </div>

          {/* <div className="w-full flex flex-col items-center lg:items-end gap-2 ">
            <Button
              onClick={() => onSelect(flight)}
              className="min-w-[100px] px-8 bg-flightpay-primary hover:bg-flightpay-primary/90 text-white"
              data-testid={`button-select-${flight.id}`}
            >
              {flight.paymentPlanEligible
                ? "View Payment Options"
                : "Select Flight"}
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
