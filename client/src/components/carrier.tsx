import React from "react";
import { toTitleCase } from "@/utils/titlecase";
import { EnhancedFlightWithPaymentPlan } from "@shared/schema";

// The function signature with an inline type definition
export function Carrier({ flight }: { flight: EnhancedFlightWithPaymentPlan }) {
  const isMultipleCarriers = flight.airlines.length > 1;

  // For multiple carriers, we join them into a single string for display.
  const joinedAirlines = isMultipleCarriers
    ? flight.airlines.join(", ")
    : flight.airlines[0];

  // This is the updated base URL for the airline logos CDN
  return (
    <div className="flex items-center gap-4 mb-4">
      {isMultipleCarriers ? (
        <div>
          <div className="font-semibold">Multiple Carriers</div>
          <div
            className="text-sm font-normal text-flightpay-slate-900"
            data-testid={`text-airline-name-${flight.id}`}
          >
            {toTitleCase(joinedAirlines)}
          </div>
        </div>
      ) : (
        <div
          className="font-medium text-flightpay-slate-900"
          data-testid={`text-airline-name-${flight.id}`}
        >
          {toTitleCase(joinedAirlines)}
        </div>
      )}
    </div>
  );
}
