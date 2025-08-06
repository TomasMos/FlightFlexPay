import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Check, Loader2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnhancedFlightWithPaymentPlan } from "@shared/schema";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51QbMwRAIE9EfBRRmGpNZ5FDdUcPsNzNlvb45vRGZ89LG5Sx4Sgi4Z9nE7beLN0AV7zlG2vLAqNYNpSblcOgfUxGT00bUKOGe3p");

// Payment Form Component
function PaymentForm({ 
  clientSecret, 
  onSuccess, 
  onError,
  amount,
  paymentType 
}: {
  clientSecret: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  amount: number;
  paymentType: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: "if_required",
    });

    setIsLoading(false);

    if (error) {
      onError(error.message || "Payment failed");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-flightpay-slate-200 rounded-lg p-4">
        <PaymentElement 
          options={{
            layout: "tabs",
          }}
        />
      </div>
      
      <div className="bg-flightpay-slate-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-flightpay-slate-700">
            {paymentType === "full_payment" ? "Total Amount" : "Deposit Amount"}
          </span>
          <span className="font-bold text-flightpay-slate-900">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full bg-flightpay-accent hover:bg-orange-600 text-white"
        data-testid="button-pay-now"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {formatCurrency(amount)}
          </>
        )}
      </Button>
    </form>
  );
}

export default function FlightBooking() {
  const [, setLocation] = useLocation();
  const [flight, setFlight] = useState<EnhancedFlightWithPaymentPlan | null>(null);
  const [passengerData, setPassengerData] = useState<any>(null);
  const [selectedDeposit, setSelectedDeposit] = useState(30); // Default to 30%
  const [selectedInstallment, setSelectedInstallment] = useState<"weekly" | "bi-weekly">("weekly");
  const [installmentDetailsOpen, setInstallmentDetailsOpen] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
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
          <h2 className="text-xl font-semibold text-flightpay-slate-900 mb-2">Loading...</h2>
          <p className="text-flightpay-slate-600">Please wait while we load your flight details.</p>
        </div>
      </div>
    );
  }

  // Payment calculations
  const flightTotal = parseFloat(flight.price.total);
  const depositAmount = (flightTotal * selectedDeposit) / 100;
  const remainingAmount = flightTotal - depositAmount;
  
  // Calculate weeks until 2 weeks before departure
  const departureDate = new Date(flight.itineraries[0].segments[0].departure.at);
  const twoWeeksBeforeDeparture = new Date(departureDate);
  twoWeeksBeforeDeparture.setDate(departureDate.getDate() - 14);
  
  const today = new Date();
  const weeksUntilPayoff = Math.max(1, Math.ceil((twoWeeksBeforeDeparture.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  
  // Installment calculations
  const weeklyInstallments = weeksUntilPayoff;
  const biWeeklyInstallments = Math.ceil(weeksUntilPayoff / 2);
  
  const weeklyAmount = remainingAmount / weeklyInstallments;
  const biWeeklyAmount = remainingAmount / biWeeklyInstallments;
  
  const installmentCount = selectedInstallment === "weekly" ? weeklyInstallments : biWeeklyInstallments;
  const installmentAmount = selectedInstallment === "weekly" ? weeklyAmount : biWeeklyAmount;
  
  // Calculate installment dates
  const generateInstallmentDates = () => {
    const dates = [];
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + (selectedInstallment === "weekly" ? 7 : 14));
    
    for (let i = 0; i < installmentCount; i++) {
      const installmentDate = new Date(startDate);
      installmentDate.setDate(startDate.getDate() + (i * (selectedInstallment === "weekly" ? 7 : 14)));
      dates.push(installmentDate);
    }
    
    return dates;
  };
  
  const installmentDates = generateInstallmentDates();

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Create flight summary
  const flightSummary = {
    origin: flight.itineraries[0].segments[0].departure.iataCode,
    destination: flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode,
    departureDate: formatDate(new Date(flight.itineraries[0].segments[0].departure.at)),
    arrivalDate: formatDate(new Date(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at)),
    departureTime: new Date(flight.itineraries[0].segments[0].departure.at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    arrivalTime: new Date(flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
  };

  // Price breakdown
  const flightFare = flightTotal * 0.85; // Approximate fare (85% of total)
  const flightTaxes = flightTotal * 0.15; // Approximate taxes (15% of total)

  // Deposit options
  const depositOptions = [
    { value: 20, label: "20%" },
    { value: 30, label: "30%" },
    { value: 40, label: "40%" },
    { value: 50, label: "50%" },
  ];

  // Create payment intent
  const createPaymentIntent = async () => {
    if (!passengerData?.contactDetails?.email) {
      alert("Please go back and enter a valid email address.");
      return;
    }

    setIsLoadingPayment(true);
    
    try {
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(depositAmount * 100), // Convert to cents
          currency: "usd",
          customer_email: passengerData.contactDetails.email,
          metadata: {
            flightId: flight.id || "",
            passengers: JSON.stringify(passengerData.passengers?.map((p: any) => `${p.firstName} ${p.lastName}`) || []),
            depositPercentage: selectedDeposit.toString(),
          },
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setClientSecret(data.clientSecret);
      setShowPaymentForm(true);
    } catch (error: any) {
      alert(`Payment setup failed: ${error.message}`);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentCompleted(true);
    setBookingConfirmed(true);
    
    // Save booking details
    const bookingData = {
      flight,
      passengers: passengerData,
      paymentPlan: {
        depositPercentage: selectedDeposit,
        depositAmount,
        installmentType: selectedInstallment,
        installmentCount,
        installmentAmount,
        installmentDates: installmentDates.map(date => date.toISOString()),
        totalAmount: flightTotal,
        remainingAmount,
      },
      paymentResult: paymentIntent,
      bookingDate: new Date().toISOString(),
    };
    
    localStorage.setItem("bookingData", JSON.stringify(bookingData));
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
    setShowPaymentForm(false);
    setClientSecret("");
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-flightpay-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-flightpay-slate-900 mb-2">Booking Confirmed!</h2>
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
        {/* Flight Summary Header */}
        <div className="bg-white rounded-lg shadow-sm border border-flightpay-slate-200 p-6 mb-8">
          <h1 className="text-2xl font-bold text-flightpay-slate-900 mb-4" data-testid="title-booking">
            Complete Your Booking
          </h1>
          <div className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-flightpay-slate-900" data-testid="text-origin">
                {flightSummary.origin}
              </span>
              <span className="text-flightpay-slate-600" data-testid="text-departure-time">
                {flightSummary.departureTime}
              </span>
              <span className="text-flightpay-slate-400">→</span>
              <span className="font-semibold text-flightpay-slate-900" data-testid="text-destination">
                {flightSummary.destination}
              </span>
              <span className="text-flightpay-slate-600" data-testid="text-arrival-time">
                {flightSummary.arrivalTime}
              </span>
            </div>
            <div className="text-sm text-flightpay-slate-600">
              <span data-testid="text-departure-date">{flightSummary.departureDate}</span>
              {flightSummary.departureDate !== flightSummary.arrivalDate && (
                <>
                  <span className="mx-2">-</span>
                  <span data-testid="text-arrival-date">{flightSummary.arrivalDate}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Payment Plan Calculator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deposit Amount Section */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="title-deposit-amount">Deposit Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {depositOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedDeposit(option.value)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-center transition-all",
                        selectedDeposit === option.value
                          ? "border-flightpay-accent bg-orange-50 text-orange-700"
                          : "border-flightpay-slate-200 bg-white text-flightpay-slate-700 hover:border-flightpay-slate-300"
                      )}
                      data-testid={`button-deposit-${option.value}`}
                    >
                      <div className="font-semibold text-lg">{option.label}</div>
                      <div className="text-sm mt-1">
                        {formatCurrency((flightTotal * option.value) / 100)}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 bg-flightpay-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-flightpay-slate-700">
                      {selectedDeposit === 100 ? "Total Payment" : "Deposit Payment"}
                    </span>
                    <span className="font-bold text-xl text-flightpay-slate-900" data-testid="text-deposit-amount">
                      {formatCurrency(depositAmount)}
                    </span>
                  </div>
                  {selectedDeposit < 100 && (
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-flightpay-slate-600">Remaining to pay</span>
                      <span className="text-flightpay-slate-700" data-testid="text-remaining-amount">
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Installment Options (only show if not 100% deposit) */}
            {selectedDeposit < 100 && (
              <Card>
                <CardHeader>
                  <CardTitle data-testid="title-installment-plan">Installment Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setSelectedInstallment("weekly")}
                      className={cn(
                        "p-4 rounded-lg border-2 text-center transition-all",
                        selectedInstallment === "weekly"
                          ? "border-flightpay-accent bg-orange-50 text-orange-700"
                          : "border-flightpay-slate-200 bg-white text-flightpay-slate-700 hover:border-flightpay-slate-300"
                      )}
                      data-testid="button-weekly"
                    >
                      <div className="font-semibold">Weekly</div>
                      <div className="text-sm mt-1">{weeklyInstallments} payments</div>
                      <div className="text-lg font-bold mt-2">
                        {formatCurrency(weeklyAmount)}
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedInstallment("bi-weekly")}
                      className={cn(
                        "p-4 rounded-lg border-2 text-center transition-all",
                        selectedInstallment === "bi-weekly"
                          ? "border-flightpay-accent bg-orange-50 text-orange-700"
                          : "border-flightpay-slate-200 bg-white text-flightpay-slate-700 hover:border-flightpay-slate-300"
                      )}
                      data-testid="button-bi-weekly"
                    >
                      <div className="font-semibold">Bi-weekly</div>
                      <div className="text-sm mt-1">{biWeeklyInstallments} payments</div>
                      <div className="text-lg font-bold mt-2">
                        {formatCurrency(biWeeklyAmount)}
                      </div>
                    </button>
                  </div>

                  {/* Billing Plan Details */}
                  <Collapsible open={installmentDetailsOpen} onOpenChange={setInstallmentDetailsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        data-testid="button-view-billing-plan"
                      >
                        View Billing Plan
                        {installmentDetailsOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-4">
                      {installmentDates.map((date, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 px-3 bg-flightpay-slate-50 rounded"
                        >
                          <span className="text-sm text-flightpay-slate-600" data-testid={`text-installment-date-${index + 1}`}>
                            Payment {index + 1} - {formatDate(date)}
                          </span>
                          <span className="text-flightpay-slate-900" data-testid={`text-installment-amount-${index + 1}`}>
                            {formatCurrency(installmentAmount)}
                          </span>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            )}

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="title-payment-details">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showPaymentForm ? (
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/flight-search/passenger-details/" + flight.id)}
                      className="flex-1"
                      data-testid="button-back"
                    >
                      Back to Passenger Details
                    </Button>
                    <Button
                      onClick={createPaymentIntent}
                      disabled={isLoadingPayment}
                      className="flex-1 bg-flightpay-accent hover:bg-orange-600 text-white"
                      data-testid="button-confirm-booking"
                    >
                      {isLoadingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Setting up payment...
                        </>
                      ) : (
                        "Proceed to Payment"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div>
                    {clientSecret && (
                      <Elements 
                        stripe={stripePromise} 
                        options={{ 
                          clientSecret,
                          appearance: {
                            theme: 'stripe',
                            variables: {
                              colorPrimary: '#fb923c', // flightpay-accent color
                            },
                          },
                        }}
                      >
                        <PaymentForm
                          clientSecret={clientSecret}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          amount={Math.round(depositAmount * 100)}
                          paymentType={selectedDeposit === 100 ? "full_payment" : "deposit"}
                        />
                      </Elements>
                    )}
                    <div className="mt-4 text-center">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowPaymentForm(false);
                          setClientSecret("");
                        }}
                        data-testid="button-back-to-booking"
                      >
                        Back to Booking Details
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Flight Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle data-testid="title-flight-summary">Flight Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span data-testid="text-summary-origin">{flightSummary.origin}</span>
                    <span className="text-flightpay-slate-400">→</span>
                    <span data-testid="text-summary-destination">{flightSummary.destination}</span>
                  </div>
                  <div className="text-sm text-flightpay-slate-600">
                    <div data-testid="text-summary-date">{flightSummary.departureDate}</div>
                    <div className="flex justify-between mt-1">
                      <span>Departure: {flightSummary.departureTime}</span>
                      <span>Arrival: {flightSummary.arrivalTime}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-flightpay-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-flightpay-slate-600">Flight Fare</span>
                    <span data-testid="text-flight-fare">{formatCurrency(flightFare)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-flightpay-slate-600">Taxes & Fees</span>
                    <span data-testid="text-flight-taxes">{formatCurrency(flightTaxes)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-flightpay-slate-200 pt-2">
                    <span>Total</span>
                    <span data-testid="text-summary-total">{formatCurrency(flightTotal)}</span>
                  </div>
                </div>

                {passengerData && (
                  <div className="border-t border-flightpay-slate-200 pt-4">
                    <h4 className="font-medium text-flightpay-slate-900 mb-2">Passengers ({passengerData.passengerCount || 1})</h4>
                    <div className="space-y-1 text-sm text-flightpay-slate-600">
                      {passengerData.passengers?.map((passenger: any, index: number) => (
                        <div key={index} data-testid={`text-passenger-${index + 1}`}>
                          {passenger.title} {passenger.firstName} {passenger.lastName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}