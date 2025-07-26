export interface PaymentScheduleItem {
  paymentNumber: number;
  dueDate: string;
  amount: number;
  description: string;
}

export interface PaymentPlanCalculation {
  eligible: boolean;
  reason?: string;
  depositAmount?: number;
  installmentAmount?: number;
  installmentCount?: number;
  schedule?: PaymentScheduleItem[];
  totalAmount?: number;
}

export class PaymentPlanService {
  private static readonly DEPOSIT_PERCENTAGE = 0.20; // 20% deposit
  private static readonly MINIMUM_ADVANCE_DAYS = 45; // Minimum days before travel for payment plan
  private static readonly MINIMUM_AMOUNT = 300; // Minimum total amount for payment plan eligibility

  static calculatePaymentPlan(
    totalAmount: number,
    travelDate: Date,
    bookingDate: Date = new Date()
  ): PaymentPlanCalculation {
    // Check if amount is above minimum threshold
    if (totalAmount < this.MINIMUM_AMOUNT) {
      return {
        eligible: false,
        reason: `Payment plans are available for bookings of $${this.MINIMUM_AMOUNT} or more`,
      };
    }

    // Check if travel date is far enough in advance
    const daysUntilTravel = Math.ceil(
      (travelDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilTravel < this.MINIMUM_ADVANCE_DAYS) {
      return {
        eligible: false,
        reason: "Travel date too soon for installment payments",
      };
    }

    // Calculate payment plan
    const depositAmount = Math.round(totalAmount * this.DEPOSIT_PERCENTAGE * 100) / 100;
    const remainingAmount = totalAmount - depositAmount;

    // Determine number of installments based on time until travel
    let installmentCount: number;
    if (daysUntilTravel >= 120) {
      installmentCount = 4; // 4 monthly payments
    } else if (daysUntilTravel >= 90) {
      installmentCount = 3; // 3 monthly payments
    } else {
      installmentCount = 2; // 2 monthly payments
    }

    const installmentAmount = Math.round((remainingAmount / installmentCount) * 100) / 100;

    // Generate payment schedule
    const schedule = this.generatePaymentSchedule(
      depositAmount,
      installmentAmount,
      installmentCount,
      bookingDate,
      travelDate
    );

    return {
      eligible: true,
      depositAmount,
      installmentAmount,
      installmentCount,
      schedule,
      totalAmount,
    };
  }

  private static generatePaymentSchedule(
    depositAmount: number,
    installmentAmount: number,
    installmentCount: number,
    bookingDate: Date,
    travelDate: Date
  ): PaymentScheduleItem[] {
    const schedule: PaymentScheduleItem[] = [];

    // First payment (deposit) - due today
    schedule.push({
      paymentNumber: 1,
      dueDate: bookingDate.toISOString().split('T')[0],
      amount: depositAmount,
      description: "Deposit - Due immediately",
    });

    // Calculate installment dates
    const totalDays = Math.ceil(
      (travelDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysBetweenPayments = Math.floor(totalDays / (installmentCount + 1));

    for (let i = 1; i <= installmentCount; i++) {
      const dueDate = new Date(bookingDate);
      dueDate.setDate(dueDate.getDate() + (daysBetweenPayments * i));

      // Ensure last payment is at least 5 days before travel
      if (i === installmentCount) {
        const minLastPaymentDate = new Date(travelDate);
        minLastPaymentDate.setDate(minLastPaymentDate.getDate() - 5);
        if (dueDate > minLastPaymentDate) {
          dueDate.setTime(minLastPaymentDate.getTime());
        }
      }

      const description = i === installmentCount ? "Final Payment" : `Payment ${i + 1}`;

      schedule.push({
        paymentNumber: i + 1,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: installmentAmount,
        description: `${description} - Due ${dueDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`,
      });
    }

    return schedule;
  }

  static isEligibleForPaymentPlan(totalAmount: number, travelDate: Date): boolean {
    const calculation = this.calculatePaymentPlan(totalAmount, travelDate);
    return calculation.eligible;
  }
}
