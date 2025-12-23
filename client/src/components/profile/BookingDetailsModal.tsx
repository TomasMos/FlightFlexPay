import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Plane, Check, AlertTriangle, Clock, FileText, Users, Luggage, Shield, Calendar, Activity } from "lucide-react";
import {
  formatTime,
  formatDuration,
  formatDate,
  toTitleCase,
  stopoverDuration,
} from "@/utils/formatters";
import { useCurrency } from "@/contexts/CurrencyContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface BookingDetailsModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
}: BookingDetailsModalProps) {
  const { currencySymbol } = useCurrency();
  const [expandedItinerary, setExpandedItinerary] = useState<{
    [key: number]: boolean;
  }>({});

  if (!isOpen) return null;

  const flightData = booking.flight.flightOffer;

  const toggleItinerary = (index: number) => {
    setExpandedItinerary((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 sm:p-10 sm:pt-[calc(4rem+2.5rem)]">
      <div className="bg-white w-full h-full sm:max-w-4xl sm:max-h-[calc(100vh-4rem-5rem)] sm:rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2
              className="text-2xl font-bold"
              data-testid="text-booking-details-title"
            >
              Booking #{booking.id}
            </h2>
            <p className="text-gray-600">
              Flight Details & Payment Information
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-close-booking-modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Itineraries Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Itineraries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {flightData.itineraries.map((itinerary: any, index: number) => {
                const firstSegment = itinerary.segments[0];
                const lastSegment =
                  itinerary.segments[itinerary.segments.length - 1];
                const isExpanded = expandedItinerary[index];

                return (
                  <div key={index} className="border rounded-lg p-4">
                    {/* Itinerary Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-lg font-bold">
                            {firstSegment.departure.iataCode} →{" "}
                            {lastSegment.arrival.iataCode}
                          </div>
                          <div className="text-sm text-gray-600">
                            {index === 0 ? "Outbound" : "Return"} •{" "}
                            {formatDate(firstSegment.departure.at)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItinerary(index)}
                        data-testid={`button-toggle-itinerary-${index}`}
                      >
                        {isExpanded ? "Hide Details" : "Show Details"}
                      </Button>
                    </div>

                    {/* Flight Overview */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Departure</div>
                        <div className="font-medium">
                          {formatTime(firstSegment.departure.at)}
                        </div>
                        <div className="text-sm">
                          {firstSegment.departure.iataCode}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Duration</div>
                        <div className="font-medium">
                          {formatDuration(itinerary.duration)}
                        </div>
                        <div className="text-sm">
                          {itinerary.segments.length - 1 === 0
                            ? "Nonstop"
                            : `${itinerary.segments.length - 1} stop${itinerary.segments.length - 1 > 1 ? "s" : ""}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Arrival</div>
                        <div className="font-medium">
                          {formatTime(lastSegment.arrival.at)}
                        </div>
                        <div className="text-sm">
                          {lastSegment.arrival.iataCode}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <Separator className="mb-4" />
                          <div className="space-y-4">
                            {itinerary.segments.map(
                              (segment: any, segmentIndex: number) => (
                                <div key={segment.id}>
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <div className="font-medium mb-2">
                                          {formatTime(segment.departure.at)} -{" "}
                                          {formatDate(segment.departure.at)}
                                        </div>
                                        <div className="text-sm space-y-1">
                                          <p>
                                            {toTitleCase(
                                              segment.departure.airportName,
                                            )}{" "}
                                            ({segment.departure.iataCode})
                                          </p>
                                          {segment.departure.terminal && (
                                            <p>
                                              Terminal{" "}
                                              {segment.departure.terminal}
                                            </p>
                                          )}
                                          <p>
                                            {toTitleCase(segment.airline)} -{" "}
                                            {segment.number}
                                          </p>
                                          <p>
                                            {formatDuration(segment.duration)}
                                          </p>
                                          <p>{toTitleCase(segment.cabin)}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="font-medium mb-2">
                                          {formatTime(segment.arrival.at)} -{" "}
                                          {formatDate(segment.arrival.at)}
                                        </div>
                                        <div className="text-sm space-y-1">
                                          <p>
                                            {toTitleCase(
                                              segment.arrival.airportName,
                                            )}{" "}
                                            ({segment.arrival.iataCode})
                                          </p>
                                          {segment.arrival.terminal && (
                                            <p>
                                              Terminal{" "}
                                              {segment.arrival.terminal}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Baggage and Flexibility */}
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h5 className="font-medium mb-2">
                                          Baggage
                                        </h5>
                                        <div className="space-y-1 text-sm">
                                          {segment.includedCabinBags
                                            ?.weight && (
                                            <div className="flex items-center gap-2">
                                              <Check className="w-4 h-4 text-green-600" />
                                              <span>
                                                {
                                                  segment.includedCabinBags
                                                    .weight
                                                }
                                                {segment.includedCabinBags.weightUnit?.toLowerCase()}
                                                {segment.includedCabinBags
                                                  .quantity &&
                                                  ` x${segment.includedCabinBags.quantity}`}{" "}
                                                carry-on
                                              </span>
                                            </div>
                                          )}
                                          {segment.includedCheckedBags
                                            ?.weight && (
                                            <div className="flex items-center gap-2">
                                              <Check className="w-4 h-4 text-green-600" />
                                              <span>
                                                {
                                                  segment.includedCheckedBags
                                                    .weight
                                                }
                                                {segment.includedCheckedBags.weightUnit?.toLowerCase()}
                                                {segment.includedCheckedBags
                                                  .quantity &&
                                                  ` x${segment.includedCheckedBags.quantity}`}{" "}
                                                checked
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <h5 className="font-medium mb-2">
                                          Flexibility
                                        </h5>
                                        <div className="space-y-1 text-sm">
                                          <div className="flex items-center gap-2">
                                            {flightData.pricingOptions
                                              ?.refundableFare ? (
                                              <>
                                                <Check className="w-4 h-4 text-green-600" />
                                                <span className="text-green-600">
                                                  Refundable
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <X className="w-4 h-4 text-red-600" />
                                                <span className="text-red-600">
                                                  Non-refundable
                                                </span>
                                              </>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {flightData.pricingOptions
                                              ?.noPenaltyFare ? (
                                              <>
                                                <Check className="w-4 h-4 text-green-600" />
                                                <span className="text-green-600">
                                                  Free changes
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                                <span className="text-yellow-600">
                                                  Changes with fee
                                                </span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Stopover indicator */}
                                  {segmentIndex <
                                    itinerary.segments.length - 1 && (
                                    <div className="flex items-center justify-center my-4">
                                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                                        <Clock className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs text-gray-600">
                                          {toTitleCase(
                                            itinerary.segments[segmentIndex + 1]
                                              .departure.airportName,
                                          )}
                                          (
                                          {
                                            itinerary.segments[segmentIndex + 1]
                                              .departure.iataCode
                                          }
                                          ) -
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
                              ),
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Costs Section */}
          <Card>
            <CardHeader>
              <CardTitle>Costs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Amount</span>
                <span className="text-lg font-bold">
                  {currencySymbol}
                  {parseFloat(booking.totalPrice).toFixed(2)} {booking.currency}
                </span>
              </div>

              {booking.paymentPlan.type !== "full" && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Deposit Amount</span>
                    <span className="font-medium">
                      {currencySymbol}
                      {parseFloat(booking.paymentPlan.depositAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Installment Amounts</span>
                    <span className="font-medium">
                      {currencySymbol}
                      {(
                        (parseFloat(booking.paymentPlan.totalAmount) -
                          parseFloat(booking.paymentPlan.depositAmount)) /
                        booking.paymentPlan.installmentCount
                      ).toFixed(2)}
                      x {booking.paymentPlan.installmentCount} installments
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Passengers Section */}
          {booking.passengers && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Passengers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(Array.isArray(booking.passengers)
                  ? booking.passengers
                  : [booking.passengers]
                ).map((passenger: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="font-medium text-lg mb-2">
                      {passenger.title} {passenger.firstName} {passenger.lastName}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Date of Birth:</span>{" "}
                        <span className="font-medium">
                          {passenger.dateOfBirth || passenger.dob || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Passport Country:</span>{" "}
                        <span className="font-medium">
                          {passenger.passportCountry || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Extras Section */}
          {booking.extras && booking.passengers && (
            <Card>
              <CardHeader>
                <CardTitle>Extras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const passengers = Array.isArray(booking.passengers)
                    ? booking.passengers
                    : [booking.passengers];

                  // Determine the selections object - could be nested or direct
                  let selections: any = null;
                  if (booking.extras.extrasSelections) {
                    // Nested format: booking.extras.extrasSelections
                    selections = booking.extras.extrasSelections;
                  } else if (booking.extras.additionalBaggage || 
                             booking.extras.travelInsurance || 
                             booking.extras.flexibleTicket || 
                             booking.extras.airlineInsolvency ||
                             booking.extras.seatSelection) {
                    // Direct format: booking.extras is the extrasSelections object
                    selections = booking.extras;
                  }

                  // Normalize extras data to per-passenger format with prices
                  const getPassengerExtras = (passengerIndex: number): any => {
                    // Check if it's per-passenger format (e.g., { 0: {...}, 1: {...} })
                    const firstKey = Object.keys(booking.extras)[0];
                    if (firstKey && typeof firstKey === 'string' && !isNaN(Number(firstKey))) {
                      // Per-passenger format
                      return booking.extras[passengerIndex] || {};
                    }

                    if (!selections) {
                      return {};
                    }

                    const passengerExtras: any = {};

                    // Helper function to check if passenger has this extra and get price
                    const getExtraInfo = (extraSelection: any, extraId: string): { has: boolean; price?: number } => {
                      if (!extraSelection) return { has: false };
                      
                      if (extraSelection.type === "all") {
                        // Calculate per-passenger price from total price and count
                        const totalPrice = extraSelection.price || 0;
                        const count = extraSelection.count || passengers.length;
                        const perPassengerPrice = count > 0 ? totalPrice / count : 0;
                        return { has: true, price: perPassengerPrice };
                      }
                      
                      if (extraSelection.type === "specific" && 
                          Array.isArray(extraSelection.passengers) &&
                          extraSelection.passengers.includes(passengerIndex)) {
                        // Calculate per-passenger price from total price and count
                        const totalPrice = extraSelection.price || 0;
                        const count = extraSelection.count || extraSelection.passengers.length;
                        const perPassengerPrice = count > 0 ? totalPrice / count : 0;
                        return { has: true, price: perPassengerPrice };
                      }
                      
                      return { has: false };
                    };

                    // Additional Baggage
                    const baggageInfo = getExtraInfo(selections.additionalBaggage, "additionalBaggage");
                    if (baggageInfo.has) {
                      passengerExtras.additionalBaggage = { 
                        has: true, 
                        price: baggageInfo.price 
                      };
                    }

                    // Travel Insurance
                    const insuranceInfo = getExtraInfo(selections.travelInsurance, "travelInsurance");
                    if (insuranceInfo.has) {
                      passengerExtras.travelInsurance = { 
                        has: true, 
                        price: insuranceInfo.price 
                      };
                    }

                    // Flexible Ticket
                    const flexibleInfo = getExtraInfo(selections.flexibleTicket, "flexibleTicket");
                    if (flexibleInfo.has) {
                      passengerExtras.flexibleTicket = { 
                        has: true, 
                        price: flexibleInfo.price 
                      };
                    }

                    // Airline Insolvency
                    const insolvencyInfo = getExtraInfo(selections.airlineInsolvency, "airlineInsolvency");
                    if (insolvencyInfo.has) {
                      passengerExtras.airlineInsolvency = { 
                        has: true, 
                        price: insolvencyInfo.price 
                      };
                    }

                    // Seat Selection (always per-passenger, price stored directly)
                    if (selections.seatSelection && selections.seatSelection[passengerIndex]) {
                      const seatData = selections.seatSelection[passengerIndex];
                      if (seatData.type && seatData.type !== "random") {
                        passengerExtras.seatSelection = {
                          type: seatData.type,
                          price: seatData.price || 0
                        };
                      }
                    }

                    return passengerExtras;
                  };

                  const extrasDefinitions = [
                    {
                      id: "additionalBaggage",
                      title: "Additional Checked Baggage",
                      icon: Luggage,
                      iconColor: "text-blue-500",
                      iconBg: "bg-blue-50",
                    },
                    {
                      id: "travelInsurance",
                      title: "Travel Insurance (Medical)",
                      icon: Activity,
                      iconColor: "text-red-500",
                      iconBg: "bg-red-50",
                    },
                    {
                      id: "flexibleTicket",
                      title: "Flexible Ticket",
                      icon: Calendar,
                      iconColor: "text-green-500",
                      iconBg: "bg-green-50",
                    },
                    {
                      id: "airlineInsolvency",
                      title: "Airline Insolvency Protection",
                      icon: Shield,
                      iconColor: "text-orange-500",
                      iconBg: "bg-orange-50",
                    },
                    {
                      id: "seatSelection",
                      title: "Seat Selection",
                      icon: Users,
                      iconColor: "text-purple-500",
                      iconBg: "bg-purple-50",
                      formatValue: (value: any) => {
                        if (!value || value === "random") return null;
                        const seatMap: Record<string, string> = {
                          window: "Window",
                          aisle: "Aisle",
                          next_to_passenger: "Next to Other Passenger",
                        };
                        return seatMap[value] || value;
                      },
                    },
                  ];

                  // Format price with currency
                  const formatPrice = (amount: number): string => {
                    return `${currencySymbol}${amount.toFixed(2)}`;
                  };

                  return (
                    <div className="space-y-4">
                      {passengers.map((passenger: any, passengerIndex: number) => {
                        const passengerExtras = getPassengerExtras(passengerIndex);
                        const hasAnyExtras = Object.keys(passengerExtras).some((key) => {
                          const extraData = passengerExtras[key];
                          if (key === "seatSelection") {
                            return extraData && extraData.type && extraData.type !== "random";
                          }
                          return extraData && extraData.has;
                        });

                        return (
                          <div key={passengerIndex} className="border rounded-lg p-4">
                            <div className="font-medium text-lg mb-3">
                              {passenger.title} {passenger.firstName} {passenger.lastName}
                            </div>
                            {hasAnyExtras ? (
                              <div className="space-y-2">
                                {extrasDefinitions.map((extraDef) => {
                                  const extraData = passengerExtras[extraDef.id];
                                  
                                  // Handle different data formats
                                  let hasExtra = false;
                                  let extraPrice = 0;
                                  let displayValue = null;
                                  
                                  if (extraDef.id === "seatSelection") {
                                    // Seat selection format: { type: "aisle", price: 561.5585 }
                                    if (extraData && extraData.type && extraData.type !== "random") {
                                      hasExtra = true;
                                      extraPrice = extraData.price || 0;
                                      displayValue = extraDef.formatValue
                                        ? extraDef.formatValue(extraData.type)
                                        : null;
                                    }
                                  } else {
                                    // Other extras format: { has: true, price: 123.45 }
                                    if (extraData && extraData.has) {
                                      hasExtra = true;
                                      extraPrice = extraData.price || 0;
                                    }
                                  }
                                  
                                  if (!hasExtra) {
                                    return null;
                                  }

                                  const Icon = extraDef.icon;

                                  return (
                                    <div
                                      key={extraDef.id}
                                      className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                                    >
                                      <div className={`w-8 h-8 rounded-lg ${extraDef.iconBg} flex items-center justify-center flex-shrink-0`}>
                                        <Icon className={`w-4 h-4 ${extraDef.iconColor}`} />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium">
                                          {extraDef.title}
                                          {displayValue && (
                                            <span className="text-gray-500 ml-1">
                                              ({displayValue})
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">
                                          {formatPrice(extraPrice)} {booking.currency}
                                        </span>
                                        <Check className="w-4 h-4 text-green-600" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No extras selected for this passenger.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Tickets Section */}
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tickets</h3>
              <p className="text-gray-600 mb-4">
                Your flight tickets will be available here once the payment plan
                has been completed.
              </p>
              <Button
                variant="outline"
                disabled
                data-testid="button-tickets-placeholder"
              >
                Tickets (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
