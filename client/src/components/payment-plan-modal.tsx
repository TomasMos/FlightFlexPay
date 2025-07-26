import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FlightWithPaymentPlan } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PaymentPlanModalProps {
  flight: FlightWithPaymentPlan;
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentPlanDetails {
  eligible: boolean;
  depositAmount?: number;
  installmentAmount?: number;
  installmentCount?: number;
  schedule?: Array<{
    paymentNumber: number;
    dueDate: string;
    amount: number;
    description: string;
  }>;
  totalAmount?: number;
}

export function PaymentPlanModal({ flight, isOpen, onClose }: PaymentPlanModalProps) {
  const { toast } = useToast();
  const [passengers] = useState(1); // This would come from search context

  const { data: paymentPlan, isLoading } = useQuery<PaymentPlanDetails>({
    queryKey: ['/api/payment-plan/calculate', flight.id],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/payment-plan/calculate', {
        flightId: flight.id,
        passengers,
        travelDate: flight.departureTime,
      });
      return response.json();
    },
    enabled: isOpen && !!flight.id,
  });

  const bookingMutation = useMutation({
    mutationFn: async (paymentPlanEnabled: boolean) => {
      const response = await apiRequest('POST', '/api/bookings', {
        flightId: flight.id,
        passengerCount: passengers,
        totalAmount: (parseFloat(flight.price.toString()) * passengers).toString(),
        paymentPlanEnabled,
        travelDate: flight.departureTime,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Your flight has been booked successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const handleBookWithPaymentPlan = () => {
    bookingMutation.mutate(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFlightDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-payment-plan">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center" data-testid="title-payment-plan">
            Payment Plan Details
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-flightpay-slate-400 hover:text-flightpay-slate-600"
              data-testid="button-close-modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flight Summary */}
          <div className="bg-flightpay-slate-50 rounded-lg p-4" data-testid="section-flight-summary">
            <h4 className="font-semibold text-flightpay-slate-900 mb-2">Flight Summary</h4>
            <div className="text-sm text-flightpay-slate-600 space-y-1">
              <p data-testid="text-route">
                {flight.origin} → {flight.destination}
              </p>
              <p data-testid="text-airline-flight">
                {flight.airline} • {formatFlightDate(flight.departureTime)}
              </p>
              <p data-testid="text-passengers">
                {passengers} Adult passenger{passengers > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Payment Schedule */}
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-payment-plan">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flightpay-primary mx-auto mb-4"></div>
              <p className="text-flightpay-slate-600">Calculating payment plan...</p>
            </div>
          ) : paymentPlan?.schedule ? (
            <div data-testid="section-payment-schedule">
              <h4 className="font-semibold text-flightpay-slate-900 mb-4">Payment Schedule</h4>
              <div className="space-y-3">
                {paymentPlan.schedule.map((payment, index) => (
                  <div
                    key={payment.paymentNumber}
                    className="flex justify-between items-center p-3 bg-white border border-flightpay-slate-200 rounded-lg"
                    data-testid={`payment-item-${payment.paymentNumber}`}
                  >
                    <div>
                      <div className="font-medium text-flightpay-slate-900" data-testid={`payment-title-${payment.paymentNumber}`}>
                        Payment {payment.paymentNumber} {index === 0 ? "(Today)" : ""}
                      </div>
                      <div className="text-sm text-flightpay-slate-500" data-testid={`payment-description-${payment.paymentNumber}`}>
                        {index === 0 ? "Deposit - Due immediately" : `Due ${formatDate(payment.dueDate)}`}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-flightpay-slate-900" data-testid={`payment-amount-${payment.paymentNumber}`}>
                      ${payment.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-flightpay-secondary/10 rounded-lg border border-flightpay-secondary/20" data-testid="section-total">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-flightpay-slate-900">Total</span>
                  <span className="text-lg text-flightpay-slate-900" data-testid="text-total-amount">
                    ${paymentPlan.totalAmount?.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-flightpay-slate-600 mt-1">No additional fees or interest</div>
              </div>
            </div>
          ) : null}

          {/* Trust Indicators */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200" data-testid="section-trust">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="text-green-600 h-5 w-5" />
              <span className="font-medium text-green-800">Secure & Protected</span>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 256-bit SSL encryption</li>
              <li>• No interest or hidden fees</li>
              <li>• Automatic payment reminders</li>
              <li>• Full refund protection</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={bookingMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookWithPaymentPlan}
              disabled={bookingMutation.isPending || !paymentPlan?.eligible}
              className="flex-1 bg-flightpay-accent hover:bg-orange-600 text-white"
              data-testid="button-book-payment-plan"
            >
              {bookingMutation.isPending ? "Processing..." : "Book with Payment Plan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
