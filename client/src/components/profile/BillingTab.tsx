import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, AlertTriangle, DollarSign, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatDate } from '@/utils/formatters';
import { InstallmentDetailsModal } from './InstallmentDetailsModal';

export function BillingTab() {
  const { currentUser } = useAuth();
  const { currencySymbol } = useCurrency();
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<any>(null);

  const { data: paymentPlans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['/api/billing/payment-plans', currentUser?.email],
    queryFn: async () => {
      const response = await fetch(`/api/billing/payment-plans?email=${encodeURIComponent(currentUser?.email || '')}`);
      if (!response.ok) throw new Error('Failed to fetch payment plans');
      return response.json();
    },
    enabled: !!currentUser?.email,
  });

  const { data: paymentMethods = [], isLoading: loadingMethods } = useQuery({
    queryKey: ['/api/billing/payment-methods', currentUser?.email],
    queryFn: async () => {
      const response = await fetch(`/api/billing/payment-methods?email=${encodeURIComponent(currentUser?.email || '')}`);
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return response.json();
    },
    enabled: !!currentUser?.email,
  });

  const { data: paymentHistory = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['/api/billing/payment-history', currentUser?.email],
    queryFn: async () => {
      const response = await fetch(`/api/billing/payment-history?email=${encodeURIComponent(currentUser?.email || '')}`);
      if (!response.ok) throw new Error('Failed to fetch payment history');
      return response.json();
    },
    enabled: !!currentUser?.email,
  });

  return (
    <div>
      <Tabs defaultValue="installment-plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="installment-plans" data-testid="tab-installment-plans">Installment Plans</TabsTrigger>
          <TabsTrigger value="payment-methods" data-testid="tab-payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="payment-history" data-testid="tab-payment-history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="installment-plans">
          <div className="space-y-4">
            {loadingPlans ? (
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (paymentPlans as any[]).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="mb-2">No payment plans</CardTitle>
                  <CardDescription>
                    Your payment plans will appear here when you book flights with installment options.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              (paymentPlans as any[]).map((plan: any) => (
                <Card key={plan.id} className="mb-4" data-testid={`card-payment-plan-${plan.id}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-lg" data-testid={`text-booking-number-${plan.bookingId}`}>
                          Booking #{plan.bookingId}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{plan.route}</span>
                          {plan.isRoundTrip && <span>↔</span>}
                          {!plan.isRoundTrip && <span>→</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={plan.status === 'completed' ? 'default' : plan.hasOverdue ? 'destructive' : 'secondary'} 
                          data-testid={`badge-plan-status-${plan.id}`}
                        >
                          {plan.status}
                        </Badge>
                        {plan.hasOverdue && (
                          <div className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Overdue payments
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="font-medium">{currencySymbol}{parseFloat(plan.totalAmount).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Deposit</div>
                        <div className="font-medium">{currencySymbol}{parseFloat(plan.depositAmount).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Installments</div>
                        <div className="font-medium">{plan.paidInstallments}/{plan.totalInstallments}</div>
                      </div>
                      <div className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPaymentPlan(plan)}
                          data-testid={`button-plan-details-${plan.id}`}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="payment-methods">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Saved Payment Methods</h3>
              <Button data-testid="button-add-payment-method">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            {loadingMethods ? (
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (paymentMethods as any[]).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="mb-2">No payment methods</CardTitle>
                  <CardDescription>
                    Add a payment method to make future bookings easier.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              (paymentMethods as any[]).map((method: any) => (
                <Card key={method.id} data-testid={`card-payment-method-${method.id}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-gray-500" />
                        <div>
                          <div className="font-medium">
                            **** **** **** {method.last4}
                          </div>
                          <div className="text-sm text-gray-500">
                            {method.brand.toUpperCase()} • Expires {method.expMonth}/{method.expYear}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {method.isDefault && (
                          <Badge variant="outline">Default</Badge>
                        )}
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Remove</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="payment-history">
          <div className="space-y-4">
            {loadingHistory ? (
              <div className="space-y-4">
                <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (paymentHistory as any[]).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="mb-2">No payment history</CardTitle>
                  <CardDescription>
                    Your payment history will appear here once you make payments.
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              (paymentHistory as any[]).map((payment: any) => (
                <Card key={payment.id} data-testid={`card-payment-${payment.id}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">
                            {currencySymbol}{parseFloat(payment.amount).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            **** {payment.last4} • {payment.cardType}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm">{formatDate(payment.date)}</div>
                          <div className="text-sm text-gray-500">
                            Booking #{payment.bookingReference}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={payment.status === 'succeeded' ? 'default' : 'destructive'}
                        data-testid={`badge-payment-status-${payment.id}`}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedPaymentPlan && (
        <InstallmentDetailsModal
          paymentPlan={selectedPaymentPlan}
          isOpen={!!selectedPaymentPlan}
          onClose={() => setSelectedPaymentPlan(null)}
        />
      )}
    </div>
  );
}