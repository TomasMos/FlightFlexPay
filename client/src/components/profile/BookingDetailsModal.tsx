import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Plane, Check, AlertTriangle, Clock, FileText } from "lucide-react";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
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
