import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";

// Initialize Stripe Test
const stripePromise = loadStripe("pk_test_51Rt7ymAUy8x2iu0HB3xDTUlgU7zGr0QukGNjkcrQHbK1HmQtgKQziPH0DqQzQ2SxFVTbxRhhYqUXu43UqB2qn3fc00l5IihEVR");

interface PaymentFormProps {
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  amount: number;
  currency: string;
  paymentType: "deposit" | "full_payment";
}

function PaymentForm({onSuccess, onError, amount, currency, paymentType }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: "if_required",
    });

    setIsLoading(false);
    setIsProcessing(false);

    if (error) {
      onError(error.message || "Payment failed");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
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
            {paymentType === "deposit" ? "Deposit Amount" : "Total Amount"}
          </span>
          <span className="font-bold text-flightpay-slate-900">
            {formatCurrency(amount, currency)}
          </span>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isLoading || isProcessing}
        className="w-full bg-flightpay-accent hover:bg-orange-600 text-white"
        data-testid="button-pay-now"
      >
        {isLoading || isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {formatCurrency(amount, currency)}
          </>
        )}
      </Button>
    </form>
  );
}

interface StripePaymentFormProps {
  amount: number;
  currency?: string;
  customerEmail: string;
  customerName?: string;
  paymentType: "deposit" | "full_payment";
  metadata?: Record<string, string>;
  onSuccess: (paymentResult: any) => void;
  onError: (error: string) => void;
  hasInstallments?: boolean;
  installmentData?: {
    amount: number;
    interval: 'week' | 'month';
    interval_count: number;
    bookingId?: string;
  };
}

export default function StripePaymentForm({
  amount,
  currency = "usd",
  customerEmail,
  customerName,
  paymentType,
  metadata = {},
  onSuccess,
  onError,
  hasInstallments = false,
  installmentData,
}: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isSettingUpInstallments, setIsSettingUpInstallments] = useState(false);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoadingPayment(true);

        // Create payment intent for deposit/full payment
        const response = await fetch("/api/payments/create-intent", {
          method: "POST",
          body: JSON.stringify({
            amount: amount, // amount in cents
            currency,
            customer_email: customerEmail,
            metadata: {
              ...metadata,
              payment_type: paymentType,
              customer_name: customerName || "",
            },
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment intent');
        }

        const paymentResponse = await response.json();
        setClientSecret(paymentResponse.clientSecret);

      } catch (error: any) {
        onError(error.message || "Failed to initialize payment");
      } finally {
        setIsLoadingPayment(false);
      }
    };

    createPaymentIntent();
  }, [amount, currency, customerEmail, customerName, paymentType, metadata]);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    setPaymentCompleted(true);

    // If there are installments, set up the subscription schedule
    if (hasInstallments && installmentData) {
      try {
        setIsSettingUpInstallments(true);

        const response = await fetch("/api/payments/create-subscription", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            customer_email: customerEmail,
            customer_name: customerName,
            installment_amount: installmentData.amount / 100, // Convert from cents to dollars
            currency,
            interval: installmentData.interval,
            interval_count: installmentData.interval_count,
            metadata: {
              ...metadata,
              payment_type: "installment",
              deposit_payment_intent_id: paymentIntent.id,
              booking_id: installmentData.bookingId || "",
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to set up installment plan');
        }

        const subscriptionData = await response.json();

        // Payment and installments successful
        onSuccess({
          paymentIntent,
          hasInstallments: true,
          subscriptionSchedule: subscriptionData,
        });

      } catch (error: any) {
        // Payment succeeded but installment setup failed
        onError(`Payment succeeded but failed to set up installments: ${error.message}`);
      } finally {
        setIsSettingUpInstallments(false);
      }
    } else {
      // No installments needed, just return payment success
      onSuccess({
        paymentIntent,
        hasInstallments: false,
      });
    }
  };

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#fb923c', // flightpay-accent color
    },
  };

  if (isLoadingPayment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="title-payment-loading">
            <Loader2 className="h-5 w-5 animate-spin" />
            Setting up payment...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-flightpay-slate-600">Please wait while we prepare your payment.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentCompleted && isSettingUpInstallments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="title-setting-up-installments">
            <Loader2 className="h-5 w-5 animate-spin" />
            Setting up installment plan...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-flightpay-slate-600">
              Your payment was successful! We're now setting up your installment plan.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentCompleted && !isSettingUpInstallments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600" data-testid="title-payment-success">
            <CheckCircle className="h-5 w-5" />
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-flightpay-slate-600">
              Your payment has been processed successfully.
              {hasInstallments && " Your installment plan has been set up."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardHeader>
          <CardTitle data-testid="title-payment-error">Payment Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to initialize payment. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="title-payment-details">Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Elements 
          stripe={stripePromise} 
          options={{ 
            clientSecret,
            appearance,
          }}
        >
          <PaymentForm 
            onSuccess={handlePaymentSuccess}
            onError={onError}
            amount={amount}
            currency={currency}
            paymentType={paymentType}
          />
        </Elements>

        {hasInstallments && installmentData && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Installment Plan Setup</p>
                <p>
                  After your {paymentType} payment is processed, your installment plan will be automatically set up for{" "}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency.toUpperCase(),
                  }).format(installmentData.amount / 100)}{" "}
                  every {installmentData.interval_count === 1 ? "" : installmentData.interval_count + " "}
                  {installmentData.interval === 'week' ? 'week' : 'month'}
                  {installmentData.interval_count > 1 ? 's' : ''}.
                </p>
                <p className="mt-1 text-xs">
                  Installments will begin one week after today's payment.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}