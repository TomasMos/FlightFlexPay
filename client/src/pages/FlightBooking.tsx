import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnhancedFlightWithPaymentPlan } from "@shared/schema";
import StripePaymentForm from "@/components/StripePaymentForm";
import {
  formatTime,
  formatDuration,
  formatDate,
  formatDateShort,
  toTitleCase,
  formattedPrice,
  stopoverDuration,
} from "@/utils/formatters";

export default function FlightBooking() {
  const [, setLocation] = useLocation();
  const [flight, setFlight] = useState<EnhancedFlightWithPaymentPlan | null>(
    null,
  );
  const [passengerData, setPassengerData] = useState<any>(null);
  const [selectedDeposit, setSelectedDeposit] = useState(30); // Default to 30%
  const [selectedInstallment, setSelectedInstallment] = useState<
    "weekly" | "bi-weekly"
  >("weekly");
  const [installmentDetailsOpen, setInstallmentDetailsOpen] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  

  // Load flight and passenger data from localStorage
  useEffect(() => {
    const flightData = localStorage.getItem("selectedFlight");
    const passengerInfo = localStorage.getItem("passengerData");

    if (flightData) {
      setFlight(JSON.parse(flightData));
    }

    if (passengerInfo) {
      setPassengerData(JSON.parse(passengerInfo));
    }
  }, []);

  if (!flight) {
    return (
      <div className="min-h-screen bg-flightpay-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-flightpay-slate-900 mb-2">
            Loading...
          </h2>
          <p className="text-flightpay-slate-600">
            Please wait while we load your flight details.
          </p>
        </div>
      </div>
    );
  }


  // Payment calculations
  const flightTotal = parseFloat(flight.price.total);
  const depositAmount = (flightTotal * selectedDeposit) / 100;
  const remainingAmount = flightTotal - depositAmount;

  // Calculate weeks until 2 weeks before departure
  const departureDate = new Date(
    flight.itineraries[0].segments[0].departure.at,
  );
  const twoWeeksBeforeDeparture = new Date(departureDate);
  twoWeeksBeforeDeparture.setDate(departureDate.getDate() - 14);

  const today = new Date();
  const weeksUntilPayoff = Math.max(
    1,
    Math.ceil(
      (twoWeeksBeforeDeparture.getTime() - today.getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    ),
  );

  // Installment calculations
  const weeklyInstallments = weeksUntilPayoff;
  const biWeeklyInstallments = Math.ceil(weeksUntilPayoff / 2);

  const weeklyAmount = remainingAmount / weeklyInstallments;
  const biWeeklyAmount = remainingAmount / biWeeklyInstallments;

  const installmentCount =
    selectedInstallment === "weekly"
      ? weeklyInstallments
      : biWeeklyInstallments;
  const installmentAmount =
    selectedInstallment === "weekly" ? weeklyAmount : biWeeklyAmount;

  // Calculate installment dates
  const generateInstallmentDates = () => {
    const dates = [];
    const startDate = new Date(today);
    startDate.setDate(
      today.getDate() + (selectedInstallment === "weekly" ? 7 : 14),
    );

    for (let i = 0; i < installmentCount; i++) {
      const installmentDate = new Date(startDate);
      installmentDate.setDate(
        startDate.getDate() + i * (selectedInstallment === "weekly" ? 7 : 14),
      );
      dates.push(installmentDate);
    }

    return dates;
  };

  const installmentDates = generateInstallmentDates();
  const firstInstallmentDate = installmentDates[0];
  console.log(firstInstallmentDate)
  const lastInstallmentDate = installmentDates[installmentDates.length - 1];



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Flight summary calculation
  const getFlightSummary = () => {
    if (!flight) return null;

    const outboundSegments = flight.itineraries[0].segments;
    const firstSegment = outboundSegments[0];
    const lastSegment = outboundSegments[outboundSegments.length - 1];

    return {
      origin: firstSegment.departure.cityName,
      destination: lastSegment.arrival.cityName,
      departureTime: new Date(firstSegment.departure.at).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        },
      ),
      arrivalTime: new Date(lastSegment.arrival.at).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        },
      ),
      departureDate: formatDate(String(firstSegment.departure.at)),
      arrivalDate: formatDate(String(lastSegment.arrival.at)),
    };
  };

  const flightSummary = getFlightSummary();
  const flightFare = parseFloat(flight.price.base);
  const flightTaxes =
    parseFloat(flight.price.total) - parseFloat(flight.price.base);

  const depositOptions = [
    { value: 20, label: "20%" },
    { value: 30, label: "30%" },
    { value: 40, label: "40%" },
    { value: 50, label: "50%" },
  ];

  const handleBooking = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentResult: any) => {
    setPaymentCompleted(true);

    // Save booking details to localStorage
    const bookingData = {
      flight,
      passengers: passengerData,
      paymentPlan: {
        depositPercentage: selectedDeposit,
        depositAmount,
        installmentType: selectedInstallment,
        installmentCount,
        installmentAmount,
        installmentDates: installmentDates.map((date) => date.toISOString()),
        totalAmount: flightTotal,
        remainingAmount,
      },
      paymentResult,
      bookingDate: new Date().toISOString(),
    };

    localStorage.setItem("bookingData", JSON.stringify(bookingData));
    setBookingConfirmed(true);
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    // You might want to show an error toast or modal here
    alert(`Payment failed: ${error}`);
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-flightpay-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-flightpay-slate-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-flightpay-slate-600 mb-6">
            Your flight has been successfully booked and payment processed.
            {selectedDeposit < 100 && " Your installment plan has been set up."}
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-flightpay-accent hover:bg-orange-600 text-white"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-flightpay-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        

          <div>
            {/* Flight Summary Header */}
            

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Section - Payment Plan Calculator */}
              <div className="lg:col-span-2 space-y-6">
                {/* Deposit Amount Section */}
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="title-deposit-amount">
                      Deposit Amount
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-3">
                      {depositOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={
                            selectedDeposit === option.value
                              ? "default"
                              : "outline"
                          }
                          className={cn(
                            "h-12 text-base font-semibold",
                            selectedDeposit === option.value
                              ? "bg-blue-500 text-white "
                              : "border-flightpay-slate-300 text-flightpay-slate-700 hover:bg-blue-200 hover:text-flightpay-slate-700",
                          )}
                          onClick={() => setSelectedDeposit(option.value)}
                          data-testid={`button-deposit-${option.value}`}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Installments Section */}
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="title-installments">
                      Installments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 ">
                      <div
                        className={cn(
                          "relative border-2 rounded-lg p-4 cursor-pointer transition-colors",
                          selectedInstallment === "weekly"
                            ? "border-blue-500 bg-blue-50"
                            : "border-flightpay-slate-200 hover:border-flightpay-slate-300",
                        )}
                        onClick={() => setSelectedInstallment("weekly")}
                        data-testid="button-weekly-installments"
                      >
                        {selectedInstallment === "weekly" && (
                          <div className="absolute top-3 right-3">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-sm font-medium text-flightpay-slate-600 mb-1">
                            Weekly
                          </div>
                          <div className={cn("text-xl font-bold ",selectedInstallment === "weekly"
                                                 ? "text-blue-600"
                                                 : "text-flightpay-slate-700",
                                             )} >
                            {formatCurrency(weeklyAmount)}
                          </div>
                          <div className="text-xs text-flightpay-slate-500">
                            x {weeklyInstallments}
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "relative border-2 rounded-lg p-4 cursor-pointer transition-colors",
                          selectedInstallment === "bi-weekly"
                            ? "border-blue-500 bg-blue-50"
                            : "border-flightpay-slate-200 hover:border-flightpay-slate-300",
                        )}
                        onClick={() => setSelectedInstallment("bi-weekly")}
                        data-testid="button-biweekly-installments"
                      >
                        {selectedInstallment === "bi-weekly" && (
                          <div className="absolute top-3 right-3">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-sm font-medium text-flightpay-slate-600 mb-1">
                            Bi-weekly
                          </div>
                          <div className={cn("text-xl font-bold ",selectedInstallment === "bi-weekly"
                                 ? "text-blue-600"
                                 : "text-flightpay-slate-700",
                             )} >
                            {formatCurrency(biWeeklyAmount)}
                          </div>
                          <div className="text-xs text-flightpay-slate-500">
                            x {biWeeklyInstallments}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="text-center text-sm text-flightpay-slate-600"
                      data-testid="text-installment-schedule"
                    >
                      {installmentCount} installments, starting{" "}
                      {formatDate(String(firstInstallmentDate))} and ending{" "}
                      {formatDate(String(lastInstallmentDate))}
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Plan Section */}
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="title-billing-plan">
                      Billing Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span
                        className="font-medium text-flightpay-slate-900"
                        data-testid="text-total-due"
                      >
                        Total Due
                      </span>
                      <span
                        className="font-semibold text-flightpay-slate-900 mr-6"
                        data-testid="text-total-amount"
                      >
                        {formatCurrency(flightTotal)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span
                        className="text-flightpay-slate-700"
                        data-testid="text-deposit-due"
                      >
                        {selectedDeposit}% Deposit (due today)
                      </span>
                      <span
                        className="font-semibold text-flightpay-slate-900"
                        data-testid="text-deposit-amount"
                      >
                        {formatCurrency(depositAmount)}
                      </span>
                    </div>

                    <Collapsible
                      open={installmentDetailsOpen}
                      onOpenChange={setInstallmentDetailsOpen}
                    >
                      <CollapsibleTrigger
                        className="flex justify-between items-center w-full py-2 hover:bg-flightpay-slate-50 rounded"
                        data-testid="button-toggle-installments"
                      >
                        <span className="text-flightpay-slate-700">
                          Installments ({installmentCount})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-flightpay-slate-900">
                            {formatCurrency(remainingAmount)}
                          </span>
                          {installmentDetailsOpen ? (
                            <ChevronUp className="h-4 w-4 text-flightpay-slate-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-flightpay-slate-500" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 pt-2">
                        {installmentDates.map((date, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-1 text-sm border-l-2 border-flightpay-slate-200 pl-4"
                          >
                            <span
                              className="text-flightpay-slate-600"
                              data-testid={`text-installment-date-${index + 1}`}
                            >
                              {formatDate(String(date))}
                            </span>
                            <span
                              className="text-flightpay-slate-900"
                              data-testid={`text-installment-amount-${index + 1}`}
                            >
                              {formatCurrency(installmentAmount)}
                            </span>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setLocation(
                        "/flight-search/passenger-details/" + flight.id,
                      )
                    }
                    className="flex-1"
                    data-testid="button-back"
                  >
                    Back to Passenger Details
                  </Button>
                  <Button
                    onClick={handleBooking}
                    className="flex-1 bg-flightpay-accent hover:bg-orange-600 text-white"
                    data-testid="button-confirm-booking"
                  >
                    Confirm Booking
                  </Button>
                </div>

                <div className="max-w-2xl mx-auto">
                  <h2
                    className="text-2xl font-bold text-flightpay-slate-900 mb-6"
                    data-testid="title-payment"
                  >
                    Complete Your Payment
                  </h2>
                  <StripePaymentForm
                    amount={Math.round(depositAmount * 100)} // Convert to cents
                    currency="usd"
                    customerEmail={passengerData?.contact?.email || ""}
                    customerName={`${passengerData?.passengers?.[0]?.firstName} ${passengerData?.passengers?.[0]?.lastName}`}
                    paymentType={selectedDeposit === 100 ? "full_payment" : "deposit"}
                    metadata={{
                      flightId: flight?.id || "",
                      passengers: JSON.stringify(
                        passengerData?.passengers?.map(
                          (p: any) => `${p.firstName} ${p.lastName}`,
                        ) || [],
                      ),
                      depositPercentage: selectedDeposit.toString(),
                    }}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    hasInstallments={selectedDeposit < 100}
                    installmentData={
                      selectedDeposit < 100
                        ? {
                            amount: Math.round(installmentAmount * 100), // Convert to cents
                            interval: "week",
                              interval_count: selectedInstallment === "weekly" ? 1 : 2,
                          }
                        : undefined
                    }
                  />
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentForm(false)}
                      data-testid="button-back-to-booking"
                    >
                      Back to Booking Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Section - Flight Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="title-flight-summary">
                      Flight Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span data-testid="text-summary-origin">
                          {flightSummary?.origin}
                        </span>
                        <span className="text-flightpay-slate-400">→</span>
                        <span data-testid="text-summary-destination">
                          {flightSummary?.destination}
                        </span>
                      </div>
                      <div className="text-sm text-flightpay-slate-600">
                        <div data-testid="text-summary-date">
                          {flightSummary?.departureDate}
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Departure: {flightSummary?.departureTime}</span>
                          <span>Arrival: {flightSummary?.arrivalTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-flightpay-slate-200 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-flightpay-slate-600">
                          Flight Fare
                        </span>
                        <span data-testid="text-flight-fare">
                          {formatCurrency(flightFare)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-flightpay-slate-600">
                          Taxes & Fees
                        </span>
                        <span data-testid="text-flight-taxes">
                          {formatCurrency(flightTaxes)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t border-flightpay-slate-200 pt-2">
                        <span>Total</span>
                        <span data-testid="text-summary-total">
                          {formatCurrency(flightTotal)}
                        </span>
                      </div>
                    </div>

                    {passengerData && (
                      <div className="border-t border-flightpay-slate-200 pt-4">
                        <h4 className="font-medium text-flightpay-slate-900 mb-2">
                          Passengers ({passengerData.passengerCount || 1})
                        </h4>
                        <div className="space-y-1 text-sm text-flightpay-slate-600">
                          {passengerData.passengers?.map(
                            (passenger: any, index: number) => (
                              <div
                                key={index}
                                data-testid={`text-passenger-${index + 1}`}
                              >
                                {passenger.title} {passenger.firstName}{" "}
                                {passenger.lastName}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

      </div>
    </div>
  );
}
