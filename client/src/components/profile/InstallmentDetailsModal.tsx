import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Calendar, DollarSign, AlertTriangle, Check } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { useCurrency } from '@/contexts/CurrencyContext';

interface InstallmentDetailsModalProps {
  paymentPlan: any;
  isOpen: boolean;
  onClose: () => void;
}

export function InstallmentDetailsModal({ paymentPlan, isOpen, onClose }: InstallmentDetailsModalProps) {
  const { currencySymbol } = useCurrency();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold" data-testid="text-installment-details-title">
              Payment Plan Details
            </h2>
            <p className="text-gray-600">Booking #{paymentPlan.bookingId}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-testid="button-close-installment-modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Plan Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Plan Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total Amount</div>
                  <div className="text-lg font-bold">{currencySymbol}{parseFloat(paymentPlan.totalAmount).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Deposit Paid</div>
                  <div className="text-lg font-bold text-green-600">{currencySymbol}{parseFloat(paymentPlan.depositAmount).toFixed(2)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Installments</div>
                  <div className="text-lg font-bold">{paymentPlan.paidInstallments} of {paymentPlan.totalInstallments} paid</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <Badge variant={paymentPlan.status === 'completed' ? 'default' : 'secondary'}>
                    {paymentPlan.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Installment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentPlan.installments?.map((installment: any, index: number) => {
                  const isOverdue = installment.status === 'overdue';
                  const isPaid = installment.status === 'paid';
                  const today = new Date();
                  const dueDate = new Date(installment.dueDate);
                  
                  return (
                    <div 
                      key={installment.id} 
                      className={`flex justify-between items-center p-4 rounded-lg border ${
                        isOverdue ? 'bg-red-50 border-red-200' : 
                        isPaid ? 'bg-green-50 border-green-200' : 
                        'bg-gray-50 border-gray-200'
                      }`}
                      data-testid={`installment-${installment.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {isPaid ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : isOverdue ? (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Calendar className="w-5 h-5 text-gray-500" />
                        )}
                        <div>
                          <div className="font-medium">
                            Installment #{index + 1}
                          </div>
                          <div className="text-sm text-gray-600">
                            Due: {formatDate(installment.dueDate)}
                          </div>
                          {isPaid && installment.paidAt && (
                            <div className="text-sm text-green-600">
                              Paid: {formatDate(installment.paidAt)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          {currencySymbol}{parseFloat(installment.amount).toFixed(2)}
                        </div>
                        <Badge 
                          variant={
                            isPaid ? 'default' : 
                            isOverdue ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {installment.status}
                        </Badge>
                        {isOverdue && (
                          <div className="text-red-600 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            Overdue
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}