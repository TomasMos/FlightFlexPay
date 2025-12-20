import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDate, formattedPrice } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { X, ChevronDown, ChevronUp, Check } from "lucide-react";
import { EnhancedFlightWithPaymentPlan } from "@shared/schema";
import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

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

  // Payment plan calculator state
  const [selectedDeposit, setSelectedDeposit] = useState(30); // Default to 30%
  const [selectedInstallment, setSelectedInstallment] = useState<
    "weekly" | "bi-weekly"
  >("weekly");
  const [installmentDetailsOpen, setInstallmentDetailsOpen] = useState(false);

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

  const depositOptions = [
    { value: 20, label: "20%" },
    { value: 30, label: "30%" },
    { value: 40, label: "40%" },
    { value: 50, label: "50%" },
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
                              ? "bg-primary text-white"
                              : "border-splickets-slate-300 text-splickets-slate-700 hover:bg-splickets-hover hover:text-splickets-slate-700",
                          )}
                          onClick={() => setSelectedDeposit(option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
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
                  <div className="text-sm text-splickets-slate-600">
                    {installmentCount} installments, starting{" "}
                    {formatDate(String(firstInstallmentDate))} and ending{" "}
                    {formatDate(String(lastInstallmentDate))}
                  </div>
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

                    <Collapsible
                      open={installmentDetailsOpen}
                      onOpenChange={setInstallmentDetailsOpen}
                    >
                      <CollapsibleTrigger className="flex justify-between items-center w-full hover:bg-splickets-slate-50 rounded">
                        <span className="text-splickets-slate-700">
                          Installments ({installmentCount})
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
      </div>
    </div>
  );
}
