import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Check, Loader2, Tag, X, Lock, AlertCircle, Plane, AlertTriangle, Clock } from "lucide-react";
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
import { useCurrency } from "@/contexts/CurrencyContext";
import { trackPurchase } from "@/lib/metaPixel";
import { trackPurchaseGTM } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { BookingWizard } from "@/components/booking-wizard";
import { motion, AnimatePresence } from "framer-motion";
import { extrasOptions } from "./Extras";

export default function FlightBooking() {
  const [, setLocation] = useLocation();
  const { currencySymbol, currency } = useCurrency();
  const { toast } = useToast();
  const { signInWithToken, currentUser } = useAuth();
  const [flight, setFlight] = useState<EnhancedFlightWithPaymentPlan | null>(
    null,
  );
  const [passengerData, setPassengerData] = useState<any>(null);
  
  // Check if user has bookings
  const { data: userBookings = [] } = useQuery({
    queryKey: ['/api/bookings/user', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      const response = await fetch(`/api/bookings/user?email=${encodeURIComponent(currentUser.email)}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!currentUser?.email,
  });

  const hasBookings = (userBookings as any[]).length > 0;
  const canAccessLowerDeposits = currentUser && hasBookings;
  
  // Default to 50% if user doesn't have access to lower deposits, otherwise 30%
  const [selectedDeposit, setSelectedDeposit] = useState(canAccessLowerDeposits ? 30 : 50);
  const [selectedInstallment, setSelectedInstallment] = useState<
    "weekly" | "bi-weekly"
  >("weekly");
  const [installmentDetailsOpen, setInstallmentDetailsOpen] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ 
    code: string; 
    promoCodeId: number;
    discount: number; 
    newTotal: number;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [expandedDetails, setExpandedDetails] = useState<{
    [key: number]: boolean;
  }>({});

  // Load flight and passenger data from localStorage
  useEffect(() => {
    const flightData = localStorage.getItem("selectedFlight");
    const passengerInfo = localStorage.getItem("passengerData");

    if (flightData) {
      setFlight(JSON.parse(flightData));
    }

    if (passengerInfo) {
      const parsed = JSON.parse(passengerInfo);
      setPassengerData(parsed);
    }
  }, []);

  // Update default deposit when user status changes
  useEffect(() => {
    if (!canAccessLowerDeposits && selectedDeposit < 40) {
      setSelectedDeposit(50);
    }
  }, [canAccessLowerDeposits, selectedDeposit]);

  // If payment plan is not eligible, force 100% deposit
  useEffect(() => {
    if (flight && !flight.paymentPlanEligible && selectedDeposit < 100) {
      setSelectedDeposit(100);
    }
  }, [flight, selectedDeposit]);

  if (!flight) {
    return (
      <div className="min-h-screen bg-splickets-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-splickets-slate-900 mb-2">
            Loading...
          </h2>
          <p className="text-splickets-slate-600">
            Please wait while we load your flight details.
          </p>
        </div>
      </div>
    );
  }

  const ppEligible = flight?.paymentPlanEligible;

  // Payment calculations - use promo code amount if applied, and include extras
  const originalFlightTotal = parseFloat(flight.price.total);
  const extrasTotal = passengerData?.extrasTotal || 0;
  const baseFlightTotal = appliedPromo ? appliedPromo.newTotal : originalFlightTotal;
  const flightTotal = baseFlightTotal + extrasTotal;
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  
  // Calculate extras breakdown for display
  const calculateExtrasBreakdown = () => {
    if (!passengerData?.extrasSelections || extrasTotal === 0) {
      return {};
    }
    
    const breakdown: Record<string, { count: number; total: number }> = {};
    const passengerCount = passengerData.passengerCount || passengerData.passengers?.length || 1;
    const perPassengerCost = originalFlightTotal / passengerCount;
    const extrasSelections = passengerData.extrasSelections;
    
    extrasOptions.forEach((option) => {
      // Skip travel insurance if not international (check if it exists in selections)
      if (option.id === "travelInsurance") {
        // Check if flight is international by checking if travel insurance is in selections
        if (!extrasSelections[option.id]) return;
      }
      
      const selection = extrasSelections[option.id];
      if (!selection || selection.type === "none") return;
      
      let count = 0;
      if (selection.type === "all") {
        count = passengerCount;
      } else if (selection.type === "specific") {
        count = selection.passengers.length;
      }
      
      if (count > 0) {
        const basePrice = option.perPassenger ? perPassengerCost : originalFlightTotal;
        const optionTotal = basePrice * option.pricePercentage * count;
        breakdown[option.id] = {
          count,
          total: optionTotal,
        };
      }
    });
    
    // Handle seat selection separately
    if (extrasSelections.seatSelection) {
      let seatCount = 0;
      let seatTotal = 0;
      Object.entries(extrasSelections.seatSelection).forEach(([passengerIdx, seatType]) => {
        if (seatType && seatType !== "random" && seatType !== undefined) {
          seatCount += 1;
          seatTotal += perPassengerCost * 0.05;
        }
      });
      if (seatCount > 0) {
        breakdown.seatSelection = { count: seatCount, total: seatTotal };
      }
    }
    
    return breakdown;
  };
  
  const extrasBreakdown = calculateExtrasBreakdown();
  
  // Promo code validation and application
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }
    
    setPromoLoading(true);
    setPromoError("");
    
    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: promoCode.trim().toUpperCase(),
          totalAmount: originalFlightTotal, // Promo applies to original flight cost only (before extras)
          currency: currency,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.valid) {
        setPromoError(data.error || "Invalid promo code");
        return;
      }
      
      setAppliedPromo({ 
        code: data.code, 
        promoCodeId: data.promoCodeId,
        discount: data.discount,
        newTotal: data.newTotal,
      });
      setPromoCode("");
      toast({
        title: "Promo code applied!",
        description: `You saved ${formatCurrency(data.discount)}! New total: ${formatCurrency(data.newTotal)}`,
      });
    } catch (error) {
      setPromoError("Failed to validate promo code");
    } finally {
      setPromoLoading(false);
    }
  };
  
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast({
      title: "Promo code removed",
      description: "Your original price has been restored",
    });
  };
  const depositAmount = (flightTotal * selectedDeposit) / 100;
  const remainingAmount = flightTotal - depositAmount;

  // Calculate weeks until 2 weeks before departure
  const departureDate = new Date(
    flight.itineraries[0].segments[0].departure.at,
  );
 

  const today = new Date();

  const sevenMonthsFromToday = new Date(today);
  sevenMonthsFromToday.setMonth(today.getMonth() + 7);

  let twoWeeksBeforeDeparture;

  if (departureDate > sevenMonthsFromToday) {
    // Case 1: Departure is more than 7 months away
    twoWeeksBeforeDeparture = new Date(today);
    twoWeeksBeforeDeparture.setMonth(today.getMonth() + 6); // 6 months from today
  } else {
    // Case 2: Departure is within 7 months
    twoWeeksBeforeDeparture = new Date(departureDate);
    twoWeeksBeforeDeparture.setDate(departureDate.getDate() - 19); // 19 days before departure
  }
  
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
  const lastInstallmentDate = installmentDates[installmentDates.length - 1];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const toggleDetails = (itineraryIndex: number) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [itineraryIndex]: !prev[itineraryIndex],
    }));
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

  // Define all deposit options - always show all options
  const depositOptions = [
    { value: 20, label: "20%" },
    { value: 30, label: "30%" },
    { value: 40, label: "40%" },
    { value: 50, label: "50%" },
    { value: 75, label: "75%" },
    { value: 100, label: "100%" },
  ];

  const handlePaymentSuccess = async (paymentResult: any) => {
    setPaymentCompleted(true);

    try {
      const leadId = localStorage.getItem("leadId");
      if (!leadId) {
        throw new Error(
          "Lead ID not found. Please go back and re-enter passenger details.",
        );
      }

      const searchId = localStorage.getItem("searchId");

      // Complete booking in database
      const response = await fetch("/api/bookings/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flightData: flight,
          passengerData,
          paymentPlan: {
            depositPercentage: selectedDeposit,
            depositAmount,
            installmentType: selectedInstallment,
            installmentCount,
            installmentAmount,
            installmentDates: installmentDates.map((date) =>
              date.toISOString(),
            ),
            totalAmount: flightTotal,
            remainingAmount,
          },
          paymentIntentId: paymentResult.paymentIntentId,
          leadId: parseInt(leadId),
          searchId: searchId,
          promoCode: appliedPromo ? {
            promoCodeId: appliedPromo.promoCodeId,
            code: appliedPromo.code,
            discount: appliedPromo.discount,
            originalPrice: originalFlightTotal,
          } : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to complete booking");
      }

      // Save booking details to localStorage for confirmation page
      const bookingData = {
        bookingId: result.bookingId,
        flightId: result.flightId,
        paymentPlanId: result.paymentPlanId,
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
      
      // Track purchase in Meta Pixel
      const totalValue = parseFloat(flight.price.total);
      const passengerCount = passengerData?.passengers?.length || 1;
      trackPurchase(flight.id, totalValue, flight.price.currency, passengerCount);
      
      // Track Google Tag Manager event
      trackPurchaseGTM(flight.id, totalValue, flight.price.currency, passengerCount);
      
      // Auto-login using custom token if available
      if (result.customToken) {
        try {
          await signInWithToken(result.customToken);
          toast({
            title: "Account created",
            description: "You're now signed in to your Splickets account",
          });
          // Redirect to profile page after successful auto-login
          setLocation("/profile");
          return;
        } catch (authError) {
          console.error("Auto-login failed:", authError);
          // Continue without auto-login - user can sign in later
        }
      }
      
      setBookingConfirmed(true);
    } catch (error) {
      console.error("Error completing booking:", error);
      alert(
        `Failed to complete booking: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setPaymentCompleted(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
    // You might want to show an error toast or modal here
    alert(`Payment failed: ${error}`);
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-splickets-slate-50 flex flex-col">
        {/* Middle content takes all available space */}
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto px-4  py-12 sm:py-16">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-splickets-slate-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-splickets-slate-600 mb-6">
            Your flight has been successfully booked and payment processed.
            {selectedDeposit < 100 && " Your installment plan has been set up."}
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-splickets-accent hover:bg-orange-600 text-white"
          >
            Return to Home
          </Button>
        </div>
      </div>

    );
  }

  return (
    <div className="min-h-screen bg-splickets-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BookingWizard currentStep="payment" />
        <div className="mt-8">
          {/* Flight Summary Header */}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Section - Payment Plan Calculator */}

            <div className="lg:col-span-3 space-y-6">
              {ppEligible ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle data-testid="title-deposit-amount">
                        Payment Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                      <div>
                        <h2 className="text-xl font-semibold text-splickets-slate-900 mb-4">
                          Choose a Deposit Amount
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                          {depositOptions.map((option) => {
                            const isLocked = !canAccessLowerDeposits && option.value < 40;
                            return (
                              <div key={option.value} className="relative">
                                <Button
                                  variant={
                                    selectedDeposit === option.value
                                      ? "default"
                                      : "outline"
                                  }
                                  className={cn(
                                    "h-12 text-base font-semibold w-full",
                                    selectedDeposit === option.value
                                      ? "bg-primary text-white "
                                      : "border-splickets-slate-300 text-splickets-slate-700 hover:bg-splickets-hover hover:text-splickets-slate-700",
                                    isLocked && "opacity-60 cursor-not-allowed"
                                  )}
                                  onClick={() => !isLocked && setSelectedDeposit(option.value)}
                                  disabled={isLocked}
                                  data-testid={`button-deposit-${option.value}`}
                                >
                                  {option.label}
                                </Button>
                                {isLocked && (
                                  <div className="absolute inset-0 bg-black/20 bg-splickets-slate-900 bg-opacity-60 rounded-md pointer-events-none">
                                  <Lock className="absolute top-2 right-2 w-5 h-5 text-white opacity-80" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {!canAccessLowerDeposits && (
                          <p className="text-sm text-splickets-slate-600 mt-3">
                            You can unlock smaller deposits the more you use Splickets. If you have a Splickets account, sign in to get access.
                          </p>
                        )}
                      </div>
                      {selectedDeposit < 100 && (
                        <div>
                          <h2 className="text-xl font-semibold text-splickets-slate-900 mb-4">
                            Choose an Installment Plan
                          </h2>
                          <div className="grid grid-cols-2 gap-4 ">
                          <div
                            className={cn(
                              "relative border-2 rounded-lg p-4 cursor-pointer transition-colors",
                              selectedInstallment === "weekly"
                                ? "border-primary bg-blue-50"
                                : "border-splickets-slate-200 hover:border-splickets-slate-300",
                            )}
                            onClick={() => setSelectedInstallment("weekly")}
                            data-testid="button-weekly-installments"
                          >
                            {selectedInstallment === "weekly" && (
                              <div className="absolute top-3 right-3">
                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}
                            <div className="text-center">
                              <div className="text-sm font-medium text-splickets-slate-600 mb-1">
                                Weekly
                              </div>
                              <div
                                className={cn(
                                  "text-xl font-bold ",
                                  selectedInstallment === "weekly"
                                    ? "text-primary"
                                    : "text-splickets-slate-700",
                                )}
                              >
                                {formatCurrency(weeklyAmount)}
                              </div>
                              <div className="text-xs text-splickets-slate-500">
                                x {weeklyInstallments}
                              </div>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "relative border-2 rounded-lg p-4 cursor-pointer transition-colors",
                              selectedInstallment === "bi-weekly"
                                ? "border-primary bg-blue-50"
                                : "border-splickets-slate-200 hover:border-splickets-slate-300",
                            )}
                            onClick={() => setSelectedInstallment("bi-weekly")}
                            data-testid="button-biweekly-installments"
                          >
                            {selectedInstallment === "bi-weekly" && (
                              <div className="absolute top-3 right-3">
                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}
                            <div className="text-center">
                              <div className="text-sm font-medium text-splickets-slate-600 mb-1">
                                Bi-weekly
                              </div>
                              <div
                                className={cn(
                                  "text-xl font-bold ",
                                  selectedInstallment === "bi-weekly"
                                    ? "text-primary"
                                    : "text-splickets-slate-700",
                                )}
                              >
                                {formatCurrency(biWeeklyAmount)}
                              </div>
                              <div className="text-xs text-splickets-slate-500">
                                x {biWeeklyInstallments}
                              </div>
                            </div>
                          </div>
                        </div>
                        </div>
                      )}
                      {selectedDeposit < 100 && (
                        <div
                          className=" text-sm text-splickets-slate-600"
                          data-testid="text-installment-schedule"
                        >
                          {installmentCount} installments, starting{" "}
                          {formatDate(String(firstInstallmentDate))} and ending{" "}
                          {formatDate(String(lastInstallmentDate))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle data-testid="title-billing-plan">
                        Billing Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center ">
                        <span
                          className="font-medium text-splickets-slate-900"
                          data-testid="text-total-due"
                        >
                          Flight Total
                        </span>
                        <span
                          className="font-semibold text-splickets-slate-900 mr-6 "
                          data-testid="text-total-amount"
                        >
                          {formatCurrency(baseFlightTotal)}
                        </span>
                      </div>

                      {extrasTotal > 0 && (
                        <div className="flex justify-between items-center ">
                          <span className="text-splickets-slate-700">
                            Extras
                          </span>
                          <span className="font-semibold text-splickets-slate-900 mr-6">
                            {formatCurrency(extrasTotal)}
                          </span>
                        </div>
                      )}

                      {discountAmount > 0 && (
                        <div className="flex justify-between items-center ">
                          <span className="text-splickets-slate-700">
                            Discount
                          </span>
                          <span className="font-semibold text-green-600 mr-6">
                            -{formatCurrency(discountAmount)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center border-t border-splickets-slate-200 pt-4">
                        <span
                          className="font-medium text-splickets-slate-900"
                          data-testid="text-total-due"
                        >
                          Total
                        </span>
                        <span
                          className="font-semibold text-splickets-slate-900 mr-6 "
                          data-testid="text-total-amount"
                        >
                          {formatCurrency(flightTotal)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center ">
                        <span
                          className="text-splickets-slate-700"
                          data-testid="text-deposit-due"
                        >
                          Deposit ({selectedDeposit}% - due today)
                        </span>
                        <span
                          className="font-semibold text-splickets-slate-900  mr-6"
                          data-testid="text-deposit-amount"
                        >
                          {formatCurrency(depositAmount)}
                        </span>
                      </div>

                      {selectedDeposit < 100 && (
                        <Collapsible
                          open={installmentDetailsOpen}
                          onOpenChange={setInstallmentDetailsOpen}
                        >
                          <CollapsibleTrigger
                            className="flex justify-between items-center w-full hover:bg-splickets-slate-50 rounded "
                            data-testid="button-toggle-installments"
                          >
                            <span className="text-splickets-slate-700">
                              Installments ({installmentCount})
                            </span>
                            <div className="flex items-center gap-2 ">
                              <span className="font-semibold text-splickets-slate-900">
                                {formatCurrency(remainingAmount)}
                              </span>
                              {installmentDetailsOpen ? (
                                <ChevronUp className="h-4 w-4 text-splickets-slate-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-splickets-slate-500" />
                              )}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 pt-2">
                            {installmentDates.map((date, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center py-1 text-sm border-l-2 border-splickets-slate-200 pl-4"
                              >
                                <span
                                  className="text-splickets-slate-600"
                                  data-testid={`text-installment-date-${index + 1}`}
                                >
                                  {formatDate(String(date))}
                                </span>
                                <span
                                  className="text-splickets-slate-900"
                                  data-testid={`text-installment-amount-${index + 1}`}
                                >
                                  {formatCurrency(installmentAmount)}
                                </span>
                              </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                      {selectedDeposit === 100 && (
                        <div className="text-sm text-splickets-slate-600 pt-2">
                          Full payment - no payment plan required
                        </div>
                      )}
                      
                      {/* Promo Code Section */}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="h-4 w-4 text-splickets-slate-600" />
                          <span className="text-sm font-medium text-splickets-slate-700">Promo Code</span>
                        </div>
                        
                        {appliedPromo ? (
                          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800" data-testid="text-applied-promo">
                                {appliedPromo.code} applied
                              </span>
                              <span className="text-xs text-green-600">
                                (Saved {formatCurrency(appliedPromo.discount)})
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemovePromo}
                              className="text-green-700 hover:text-green-900 hover:bg-green-100"
                              data-testid="button-remove-promo"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter promo code"
                                value={promoCode}
                                onChange={(e) => {
                                  setPromoCode(e.target.value.toUpperCase());
                                  setPromoError("");
                                }}
                                className="flex-1"
                                data-testid="input-promo-code"
                              />
                              <Button
                                onClick={handleApplyPromo}
                                disabled={promoLoading || !promoCode.trim()}
                                variant="outline"
                                data-testid="button-apply-promo"
                              >
                                {promoLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Apply"
                                )}
                              </Button>
                            </div>
                            {promoError && (
                              <p className="text-sm text-red-500" data-testid="text-promo-error">
                                {promoError}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
           <>
           
           </>
              )}

              {/* Payment Plan Not Eligible Notice */}
              {!ppEligible && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                          Payment Plan Not Available
                        </h3>
                        <p className="text-sm text-yellow-800">
                          {(() => {
                            const departureDate = new Date(
                              flight.itineraries[0].segments[0].departure.at,
                            );
                            const today = new Date();
                            const daysUntilDeparture = Math.ceil(
                              (departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                            );
                            
                            if (daysUntilDeparture < 21) {
                              return `Payment plans are only available for flights more than 21 days away. Your flight departs in ${daysUntilDeparture} day${daysUntilDeparture !== 1 ? 's' : ''}, so full payment is required.`;
                            } else {
                              return "Payment plans are only available for flights more than 21 days away. Full payment is required for this booking.";
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* StripePaymentForm */}
              <div className=" mx-auto">
                <StripePaymentForm
                  amount={Math.round(depositAmount * 100)} // Convert to cents
                  currency={currency}
                  customerEmail={passengerData?.contactDetails?.email}
                  customerName={`${passengerData?.passengers?.[0]?.firstName} ${passengerData?.passengers?.[0]?.lastName}`}
                  paymentType={
                    selectedDeposit === 100 ? "full_payment" : "deposit"
                  }
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
                          interval_count:
                            selectedInstallment === "weekly" ? 1 : 2,
                          start_date: firstInstallmentDate,
                          installment_count: installmentCount
                        }
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Right Section - Flight Summary */}
            <div className="lg:col-span-2">
              <div className=" sticky top-[98px] space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-splickets-slate-200 p-6 mb-8">
                  <h1
                    className="text-2xl font-bold text-splickets-slate-900 mb-4"
                    data-testid="title-passenger-details"
                  >
                    Flight Summary
                  </h1>
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
                        className="bg-splickets-slate-50 rounded-lg p-6 border border-splickets-slate-200 mb-4"
                        data-testid={`itinerary-section-${itineraryIndex}`}
                      >
                        {/* Route Overview */}
                        <div className="flex items-center justify-between mb-6">
                          {/* Origin */}
                          <div className="text-left">
                            <div className="text-xl font-bold text-splickets-slate-900">
                              {firstSegment.departure.iataCode}
                            </div>
                            <div className="text-sm text-splickets-slate-600">
                              {toTitleCase(firstSegment.departure.cityName)}
                              
                            </div>
                            <div className="text-sm font-medium text-splickets-slate-900 mt-1">
                              {formatTime(firstSegment.departure.at)}
                            </div>
                          </div>

                          {/* Flight info */}
                          <div className="flex-1 mx-8 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <div className="w-2 h-2 bg-splickets-slate-300 rounded-full"></div>
                              <div className="flex-1 h-px bg-splickets-slate-300 mx-2"></div>
                              <Plane className="w-4 h-4 text-green-600" />
                              <div className="flex-1 h-px bg-splickets-slate-300 mx-2"></div>
                              <div className="w-2 h-2 bg-splickets-slate-300 rounded-full"></div>
                            </div>
                            <div className="text-sm text-splickets-slate-600 mb-1">
                              {stops === 0
                                ? "Nonstop"
                                : `${stops} stop${stops > 1 ? "s" : ""}`}
                            </div>
                            <div className="text-sm text-splickets-slate-500">
                              {formatDuration(itinerary.duration)}
                            </div>
                          </div>

                          {/* Destination */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-splickets-slate-900">
                              {lastSegment.arrival.iataCode}
                            </div>
                            <div className="text-sm text-splickets-slate-600">
                              {toTitleCase(lastSegment.arrival.cityName)}
                              {/* {lastSegment.arrival.cityName} */}
                            </div>
                            <div className="text-sm font-medium text-splickets-slate-900 mt-1">
                              {formatTime(lastSegment.arrival.at)}
                            </div>
                          </div>
                        </div>

                        {/* Flight Details Collapsible */}
                        <div className="border-t border-splickets-slate-200 pt-4">
                          <button
                            onClick={() => toggleDetails(itineraryIndex)}
                            className="flex items-center justify-between w-full p-3 hover:bg-splickets-slate-100 rounded-lg"
                            data-testid={`button-toggle-details-${itineraryIndex}`}
                          >
                            <span className="text-sm font-medium text-splickets-slate-700">
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
                                    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-splickets-slate-200">
                                      <div className="flex-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* Departure */}
                                          <div>
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className=" font-medium text-splickets-slate-900">
                                                {formatTime(segment.departure.at)} -{" "}
                                                  {formatDate(segment.departure.at)}
                                              </div>
                                            </div>
                                            <div className="text-sm text-splickets-slate-900">
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
                                              <div className=" font-medium text-splickets-slate-900">
                                                {formatTime(segment.arrival.at)} -{" "}
                                                  {formatDate(segment.arrival.at)}
                                              </div>
                                            </div>
                                            <div className="text-sm text-splickets-slate-900">
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
                                      className="p-4 bg-white rounded-lg border border-splickets-slate-200"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Baggage */}
                                        <div>
                                          <h5 className="text-sm font-medium text-splickets-slate-900 mb-2">
                                            Baggage
                                          </h5>
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm text-splickets-slate-600">
                                                {segment.includedCabinBags
                                                  ?.quantity &&
                                                segment.includedCabinBags?.weight &&
                                                segment.includedCabinBags
                                                  ?.weightUnit ? (
                                                    <div className="flex flex-row gap-2">
                                                      <Check className="w-4 h-4 text-green-600" />
                                                      <span className="text-sm text-splickets-slate-600">
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
                                                      <span className="text-sm text-splickets-slate-600">
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
                                                      <span className="text-sm text-splickets-slate-600">
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
                                                  <span className="text-sm text-splickets-slate-600">
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
                                                  <span className="text-sm text-splickets-slate-600">
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
                                                  <span className="text-sm text-splickets-slate-600">
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
                                          <h5 className="text-sm font-medium text-splickets-slate-900 mb-2">
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
                                        <div className=" flex items-center gap-2 px-3 py-1 bg-splickets-slate-100 rounded-full">
                                          <Clock className="w-3 h-3 text-splickets-slate-500" />
                                          <span className="text-xs text-splickets-slate-600">
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
                  {passengerData && (
                    <div className="border-t border-splickets-slate-200 pt-4 mt-4">
                      <h4 className="font-medium text-splickets-slate-900 mb-2">
                        Passengers ({passengerData.passengerCount || 1})
                      </h4>
                      <div className="space-y-1 text-sm text-splickets-slate-600">
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
                </div>
                
                {/* Price Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="title-price-details">
                      Price Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-splickets-slate-700">Flight Total</span>
                      <span className="font-semibold text-splickets-slate-900">
                        {formatCurrency(baseFlightTotal)}
                      </span>
                    </div>

                    {extrasTotal > 0 && Object.keys(extrasBreakdown).length > 0 && (
                      <>
                        {Object.entries(extrasBreakdown).map(([key, value]) => {
                          const option = extrasOptions.find((o) => o.id === key);
                          if (!option || value.count === 0) {
                            if (key === "seatSelection") {
                              return (
                                <div
                                  key={key}
                                  className="flex justify-between items-center text-sm"
                                >
                                  <span className="text-splickets-slate-600">
                                    Seat Selection ({value.count})
                                  </span>
                                  <span className="text-splickets-slate-900">
                                    {formatCurrency(value.total)}
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          }
                          return (
                            <div
                              key={key}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-splickets-slate-600">
                                {option.title} ({value.count})
                              </span>
                              <span className="text-splickets-slate-900">
                                {formatCurrency(value.total)}
                              </span>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-splickets-slate-600">
                          Promo Code ({appliedPromo?.code})
                        </span>
                        <span className="text-green-600 font-semibold">
                          -{formatCurrency(discountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-splickets-slate-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-splickets-slate-900">
                          Total
                        </span>
                        <span className="text-lg font-bold text-splickets-slate-900">
                          {formatCurrency(flightTotal)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
