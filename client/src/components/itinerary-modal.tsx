import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatTime,
  formatDuration,
  formatDate,
  toTitleCase,
  stopoverDuration,
} from "@/utils/formatters";
import { motion, AnimatePresence } from "framer-motion";

import {
  X,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  Clock,
  Plane,
} from "lucide-react";
import { EnhancedFlightWithPaymentPlan } from "@shared/schema";
import { useState } from "react";
import { useLocation } from "wouter";
import { Carrier } from "@/components/carrier";

interface ItineraryModalProps {
  flight: EnhancedFlightWithPaymentPlan;
  isOpen: boolean;
  onClose: () => void;
}

export function ItineraryModal({
  flight,
  isOpen,
  onClose,
}: ItineraryModalProps) {
  const [, setLocation] = useLocation();
  const [expandedDetails, setExpandedDetails] = useState<{
    [key: number]: boolean;
  }>({});
  const [expandedInclusions, setExpandedInclusions] = useState<{
    [key: number]: boolean;
  }>({});

  if (!isOpen) return null;

  const toggleDetails = (itineraryIndex: number) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [itineraryIndex]: !prev[itineraryIndex],
    }));
  };

  const toggleInclusions = (itineraryIndex: number) => {
    setExpandedInclusions((prev) => ({
      ...prev,
      [itineraryIndex]: !prev[itineraryIndex],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 sm:p-10">
      <div className="bg-white w-full h-full sm:max-w-4xl sm:rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className=" flex flex-row items-spread justify-between h-md:p-6 h-md:py-3 px-6 border-b border-flightpay-slate-200">
          <Carrier flight={flight} textSize="xl" />
          <button
            onClick={onClose}
            className="p-2 hover:bg-flightpay-slate-100 rounded-lg"
            data-testid="button-close-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Render each itinerary */}
            {flight.itineraries.map((itinerary, itineraryIndex) => {
              const isOutbound = itineraryIndex === 0;
              const firstSegment = itinerary.segments[0];
              const lastSegment =
                itinerary.segments[itinerary.segments.length - 1];
              const stops = itinerary.segments.length - 1;

              return (
                <div
                  key={itineraryIndex}
                  className="bg-flightpay-slate-50 rounded-lg p-6 border border-flightpay-slate-200"
                  data-testid={`itinerary-section-${itineraryIndex}`}
                >
                  {/* Route Overview */}
                  <div className="flex items-center justify-between mb-6">
                    {/* Origin */}
                    <div className="text-left">
                      <div className="text-xl font-bold text-flightpay-slate-900">
                        {firstSegment.departure.iataCode}
                      </div>
                      <div className="text-sm text-flightpay-slate-600">
                        {toTitleCase(firstSegment.departure.cityName)}
                        
                      </div>
                      <div className="text-sm font-medium text-flightpay-slate-900 mt-1">
                        {formatTime(firstSegment.departure.at)}
                      </div>
                    </div>

                    {/* Flight info */}
                    <div className="flex-1 mx-8 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                        <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                        <Plane className="w-4 h-4 text-green-600" />
                        <div className="flex-1 h-px bg-flightpay-slate-300 mx-2"></div>
                        <div className="w-2 h-2 bg-flightpay-slate-300 rounded-full"></div>
                      </div>
                      <div className="text-sm text-flightpay-slate-600 mb-1">
                        {stops === 0
                          ? "Nonstop"
                          : `${stops} stop${stops > 1 ? "s" : ""}`}
                      </div>
                      <div className="text-sm text-flightpay-slate-500">
                        {formatDuration(itinerary.duration)}
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-flightpay-slate-900">
                        {lastSegment.arrival.iataCode}
                      </div>
                      <div className="text-sm text-flightpay-slate-600">
                        {toTitleCase(lastSegment.arrival.cityName)}
                        {/* {lastSegment.arrival.cityName} */}
                      </div>
                      <div className="text-sm font-medium text-flightpay-slate-900 mt-1">
                        {formatTime(lastSegment.arrival.at)}
                      </div>
                    </div>
                  </div>

                  {/* Flight Details Collapsible */}
                  <div className="border-t border-flightpay-slate-200 pt-4">
                    <button
                      onClick={() => toggleDetails(itineraryIndex)}
                      className="flex items-center justify-between w-full p-3 hover:bg-flightpay-slate-100 rounded-lg"
                      data-testid={`button-toggle-details-${itineraryIndex}`}
                    >
                      <span className="text-sm font-medium text-flightpay-slate-700">
                        Details
                      </span>
                      <motion.div
                        animate={{
                          rotate: expandedDetails[itineraryIndex] ? -180 : 0,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {expandedDetails[itineraryIndex] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedDetails[itineraryIndex] && (
                        <motion.div
                          key={`details-${itineraryIndex}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          className="overflow-hidden"
                          data-testid={`details-content-${itineraryIndex}`}
                        >
                          {itinerary.segments.map((segment, segmentIndex) => (
                            <div key={segment.id} className="flex flex-col gap-4 mt-4">
                              {/* Segment details */}
                              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-flightpay-slate-200">
                                <div className="flex-1">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Departure */}
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className=" font-medium text-flightpay-slate-900">
                                          {formatTime(segment.departure.at)} -{" "}
                                          {formatDate(segment.departure.at)}
                                        </div>
                                      </div>
                                      <div className="text-sm text-flightpay-slate-900">
                                        <p>
                                          {" "}
                                          {toTitleCase(segment.departure.airportName)} (
                                          {segment.departure.iataCode})
                                        </p>
                                        {segment.departure.terminal && (
                                          <p>
                                            Terminal{" "}
                                            {segment.departure.terminal}{" "}
                                          </p>
                                        )}
                                        <p>
                                          {" "}
                                          {toTitleCase(segment.airline)} -{" "}
                                          {segment.number}
                                        </p>
                                        <p>
                                          {formatDuration(segment.duration)}
                                        </p>
                                        <p>{toTitleCase(segment.cabin)}</p>
                                      </div>
                                    </div>

                                    {/* Arrival */}
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className=" font-medium text-flightpay-slate-900">
                                          {formatTime(segment.arrival.at)} -{" "}
                                          {formatDate(segment.arrival.at)}
                                        </div>
                                      </div>
                                      <div className="text-sm text-flightpay-slate-900">
                                        <p>
                                          {" "}
                                          {toTitleCase(segment.arrival.airportName)} (
                                          {segment.arrival.iataCode})
                                        </p>
                                        {segment.arrival.terminal && (
                                          <p>
                                            Terminal{" "}
                                            {segment.arrival.terminal}{" "}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                              </div>
                              <div
                                className="p-4 bg-white rounded-lg border border-flightpay-slate-200"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Baggage */}
                                  <div>
                                    <h5 className="text-sm font-medium text-flightpay-slate-900 mb-2">
                                      Baggage
                                    </h5>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-flightpay-slate-600">
                                          {segment.includedCabinBags
                                            ?.quantity &&
                                          segment.includedCabinBags?.weight &&
                                          segment.includedCabinBags
                                            ?.weightUnit ? (
                                            <div className="flex flex-row gap-2">
                                              <Check className="w-4 h-4 text-green-600" />
                                              <span className="text-sm text-flightpay-slate-600">
                                                {
                                                  segment.includedCabinBags
                                                    ?.weight
                                                }{" "}
                                                {segment.includedCabinBags?.weightUnit.toLowerCase()}{" "}
                                                x{" "}
                                                {
                                                  segment.includedCabinBags
                                                    ?.quantity
                                                }{" "}
                                                piece(s) carry-on
                                              </span>
                                            </div>
                                          ) : segment.includedCabinBags
                                              ?.weightUnit &&
                                            segment.includedCabinBags
                                              ?.weight ? (
                                            <div className="flex flex-row gap-2">
                                              <Check className="w-4 h-4 text-green-600" />
                                              <span className="text-sm text-flightpay-slate-600">
                                                {
                                                  segment.includedCabinBags
                                                    ?.weight
                                                }{" "}
                                                {segment.includedCabinBags?.weightUnit.toLowerCase()}{" "}
                                                carry-on
                                              </span>
                                            </div>
                                          ) : segment.includedCabinBags
                                              ?.quantity ? (
                                            <div className="flex flex-row gap-2">
                                              <Check className="w-4 h-4 text-green-600" />
                                              <span className="text-sm text-flightpay-slate-600">
                                                {
                                                  segment.includedCabinBags
                                                    ?.quantity
                                                }{" "}
                                                piece(s) carry-on
                                              </span>
                                            </div>
                                          ) : (
                                            <></>
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {segment.includedCheckedBags
                                          ?.quantity &&
                                        segment.includedCheckedBags?.weight &&
                                        segment.includedCheckedBags
                                          ?.weightUnit ? (
                                          <div className="flex flex-row gap-2">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-flightpay-slate-600">
                                              {
                                                segment.includedCheckedBags
                                                  ?.weight
                                              }{" "}
                                              {segment.includedCheckedBags?.weightUnit.toLowerCase()}{" "}
                                              x{" "}
                                              {
                                                segment.includedCheckedBags
                                                  ?.quantity
                                              }{" "}
                                              piece(s) checked
                                            </span>
                                          </div>
                                        ) : segment.includedCheckedBags
                                            ?.weightUnit &&
                                          segment.includedCheckedBags
                                            ?.weight ? (
                                          <div className="flex flex-row gap-2">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-flightpay-slate-600">
                                              {
                                                segment.includedCheckedBags
                                                  ?.weight
                                              }{" "}
                                              {segment.includedCheckedBags?.weightUnit.toLowerCase()}{" "}
                                              checked
                                            </span>
                                          </div>
                                        ) : segment.includedCheckedBags
                                            ?.quantity ? (
                                          <div className="flex flex-row gap-2">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-flightpay-slate-600">
                                              {
                                                segment.includedCheckedBags
                                                  ?.quantity
                                              }{" "}
                                              piece(s) checked
                                            </span>
                                          </div>
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Flexibility */}
                                  <div>
                                    <h5 className="text-sm font-medium text-flightpay-slate-900 mb-2">
                                      Flexibility
                                    </h5>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        {flight.pricingOptions
                                          ?.refundableFare ? (
                                          <>
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-green-600">
                                              Refundable
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <X className="w-4 h-4 text-red-600" />
                                            <span className="text-sm text-red-600">
                                              Non-refundable
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {flight.pricingOptions
                                          ?.noPenaltyFare ? (
                                          <>
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-green-600">
                                              Free changes
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                            <span className="text-sm text-yellow-600">
                                              Changes with a fee
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Stopover indicator */}
                              {segmentIndex < itinerary.segments.length - 1 && (
                                <div className="flex items-center justify-center   ">
                                  <div className=" flex items-center gap-2 px-3 py-1 bg-flightpay-slate-100 rounded-full">
                                    <Clock className="w-3 h-3 text-flightpay-slate-500" />
                                    <span className="text-xs text-flightpay-slate-600">
                                      {toTitleCase(itinerary.segments[segmentIndex + 1]
                                                   .departure.airportName)} (
                                      {
                                        itinerary.segments[segmentIndex + 1]
                                          .departure.iataCode
                                      }
                                      ) -{" "}
                                      {stopoverDuration(
                                        new Date(segment.arrival.at),
                                        new Date(
                                          itinerary.segments[
                                            segmentIndex + 1
                                          ].departure.at,
                                        ),
                                      )}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                 
                  
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer with pricing and select button */}
        <div className="border-t border-flightpay-slate-200 h-md:p-6 h-md:py-3 px-6 bg-flightpay-slate-900">
          <div className="flex items-center justify-between">
            <div className="">
              <div className="text-2xl font-bold">
                ${parseFloat(flight.price.total).toFixed(2)}
              </div>
              {flight.paymentPlanEligible && (
                <div className="text-flightpay-slate-300 text-sm">
                  ${flight.paymentPlan?.installmentAmount?.toFixed(2) || "0.00"}
                  /week
                </div>
              )}
            </div>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              data-testid="button-select-flight"
              onClick={() => {
                // Store flight data in localStorage for the passenger details page
                localStorage.setItem("selectedFlight", JSON.stringify(flight));
                // Navigate to passenger details page
                setLocation(`/flight-search/passenger-details/${flight.id}`);
                onClose(); // Close the modal
              }}
            >
              Select
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
