import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDate, formattedPrice } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { X, ChevronDown, ChevronUp, Check, Lock } from "lucide-react";
import { EnhancedFlightWithPaymentPlan } from "@shared/schema";
import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface PaymentPlanModalProps {
  flight: EnhancedFlightWithPaymentPlan;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentPlanModal({
  flight,
  isOpen,
  onClose,
}: PaymentPlanModalProps) {
  const { currencySymbol, currency } = useCurrency();
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();

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

  // Payment plan calculator state
  // Default to 50% if user doesn't have access to lower deposits, otherwise 30%
  const [selectedDeposit, setSelectedDeposit] = useState(canAccessLowerDeposits ? 30 : 50);
  const [selectedInstallment, setSelectedInstallment] = useState<
    "weekly" | "bi-weekly"
  >("weekly");
  const [installmentDetailsOpen, setInstallmentDetailsOpen] = useState(false);

  // Update default deposit when user status changes
  useEffect(() => {
    if (!canAccessLowerDeposits && selectedDeposit < 50) {
      setSelectedDeposit(50);
    }
  }, [canAccessLowerDeposits, selectedDeposit]);

  if (!isOpen) return null;

  // Payment plan calculations
  const ppEligible = flight?.paymentPlanEligible;
  const flightTotal = parseFloat(flight.price.total);
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
    twoWeeksBeforeDeparture = new Date(today);
    twoWeeksBeforeDeparture.setMonth(today.getMonth() + 6);
  } else {
    twoWeeksBeforeDeparture = new Date(departureDate);
    twoWeeksBeforeDeparture.setDate(departureDate.getDate() - 19);
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

  // Define all deposit options - always show all options
  const depositOptions = [
    { value: 20, label: "20%" },
    { value: 30, label: "30%" },
    { value: 40, label: "40%" },
    { value: 50, label: "50%" },
    { value: 75, label: "75%" },
    { value: 100, label: "100%" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 sm:p-10">
      <div className="bg-white w-full h-full sm:max-w-4xl sm:rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex flex-row items-center justify-between h-md:p-6 h-md:py-3 px-6 border-b border-splickets-slate-200">
          <h2 className="text-xl font-semibold text-splickets-slate-900">
            Payment Plan Calculator
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-splickets-slate-100 rounded-lg"
            data-testid="button-close-payment-plan-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Payment Plan Calculator */}
            {ppEligible ? (
              <>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-splickets-slate-900 mb-4">
                      Deposit Amount
                    </h2>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {depositOptions.map((option) => {
                        const isLocked = !canAccessLowerDeposits && option.value < 50;
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
                                  ? "bg-primary text-white"
                                  : "border-splickets-slate-300 text-splickets-slate-700 hover:bg-splickets-hover hover:text-splickets-slate-700",
                                isLocked && "opacity-60 cursor-not-allowed"
                              )}
                              onClick={() => !isLocked && setSelectedDeposit(option.value)}
                              disabled={isLocked}
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
                      <h2 className="text-lg font-semibold text-splickets-slate-900 mb-4">
                        Payment Schedule
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                      <div
                        className={cn(
                          "relative border-2 rounded-lg p-4 cursor-pointer transition-colors",
                          selectedInstallment === "weekly"
                            ? "border-primary bg-blue-50"
                            : "border-splickets-slate-200 hover:border-splickets-slate-300",
                        )}
                        onClick={() => setSelectedInstallment("weekly")}
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
                              "text-xl font-bold",
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
                              "text-xl font-bold",
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
                    <div className="text-sm text-splickets-slate-600">
                      {installmentCount} instalments, starting{" "}
                      {formatDate(String(firstInstallmentDate))} and ending{" "}
                      {formatDate(String(lastInstallmentDate))}
                    </div>
                  )}
                </div>

                <div className="border-t border-splickets-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-splickets-slate-900 mb-4">
                    Billing Plan
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-splickets-slate-900">
                        Total
                      </span>
                      <span className="font-semibold text-splickets-slate-900 mr-6">
                        {formatCurrency(flightTotal)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-splickets-slate-700">
                        Today's Deposit ({selectedDeposit}%)
                      </span>
                      <span className="font-semibold text-splickets-slate-900 mr-6">
                        {formatCurrency(depositAmount)}
                      </span>
                    </div>

                    {selectedDeposit < 100 && (
                      <Collapsible
                        open={installmentDetailsOpen}
                        onOpenChange={setInstallmentDetailsOpen}
                      >
                        <CollapsibleTrigger className="flex justify-between items-center w-full hover:bg-splickets-slate-50 rounded">
                          <span className="text-splickets-slate-700">
                            Instalments ({installmentCount})
                          </span>
                          <div className="flex items-center gap-2">
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
                              className="flex justify-between items-center py-1 text-sm border-l-2 border-splickets-slate-200 pl-4 mr-6"
                            >
                              <span className="text-splickets-slate-600">
                                {formatDate(String(date))}
                              </span>
                              <span className="text-splickets-slate-900">
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
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6">
                <p className="text-center text-sm text-splickets-slate-600">
                  Payment plans are available for flights more than 3 weeks
                  away.
                </p>
              </div>
            )}

            <div className="border-t border-splickets-slate-200 pt-6">
              <p className="text-sm text-splickets-slate-600">
                {" "}
                Your payment plan will be confirmed at checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with select button */}
        <div className="border-t border-splickets-slate-200 h-md:p-6 h-md:py-3 px-6 bg-splickets-slate-900">
          <div className="flex justify-center lg:justify-end">
            <Button
              size="lg"
              className="bg-primary hover:bg-blue-700 text-white px-8"
              data-testid="button-select-payment-plan"
              onClick={() => {
                // Store flight data and selected payment plan options in localStorage
                localStorage.setItem("selectedFlight", JSON.stringify(flight));
                localStorage.setItem("selectedPaymentPlan", JSON.stringify({
                  depositPercentage: selectedDeposit,
                  installmentType: selectedInstallment,
                }));
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
