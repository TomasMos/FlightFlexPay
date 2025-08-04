export interface PaymentScheduleItem {
  paymentNumber: number;
  dueDate: string;
  amount: number;
  description: string;
}

export interface PaymentPlanCalculation {
  eligible: boolean;
  reason?: string;
  flightPrice: number;
  baseCost: number;
  adminFee: number;
  layByFee?: number;
  depositAmount?: number;
  installmentAmount?: number;
  installmentCount?: number;
  installmentCadence?: 'weekly' | 'biweekly';
  schedule?: PaymentScheduleItem[];
  daysUntilTravel: number;
  weeksUntilTravel?: number;
}

export class PaymentPlanService {
  private static readonly ADMIN_FEE_PERCENTAGE = 0.0; // 5% admin fee on all flights
  private static readonly LAY_BY_FEE_PERCENTAGE = 0.0; // 10% lay by fee for flights > 14 days
  private static readonly DEPOSIT_PERCENTAGE = 0.20; // 20% deposit
  private static readonly MINIMUM_ADVANCE_DAYS = 14; // Payment plans only available for flights > 14 days
  private static readonly MAX_INSTALLMENT_WEEKS = 26; // Maximum 26 weeks of installments

  static calculateFlightPrice(baseCost: number, travelDate: Date) {
    const today = new Date();
    const daysUntilTravel = Math.ceil((travelDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Admin Fee: 5% on all flights
    const adminFee = baseCost * this.ADMIN_FEE_PERCENTAGE;
    
    // Lay By Fee: 10% additional if departure > 14 days
    const layByFee = daysUntilTravel > this.MINIMUM_ADVANCE_DAYS ? baseCost * this.LAY_BY_FEE_PERCENTAGE : 0;
    
    // Calculate Flight Price
    const flightPrice = baseCost + adminFee + layByFee;
    
    return {
      flightPrice,
      baseCost,
      adminFee,
      layByFee,
      daysUntilTravel
    };
  }

  static calculatePaymentPlan(
    baseCost: number,
    travelDate: Date,
    bookingDate: Date = new Date()
  ): PaymentPlanCalculation {
    const today = new Date();
    const daysUntilTravel = Math.ceil((travelDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));


    // Calculate flight price with fees
    const priceCalculation = this.calculateFlightPrice(baseCost, travelDate);

    // console.log(`paymentPlan - 64 -flight price with fees`, priceCalculation)
    
    const { flightPrice, adminFee, layByFee } = priceCalculation;
    
    // Payment plans only available if departure > 14 days
    const isEligible = daysUntilTravel > this.MINIMUM_ADVANCE_DAYS;
    
    if (!isEligible) {
      return {
        eligible: false,
        reason: 'Payment plans not available for flights within 14 days',
        flightPrice,
        baseCost,
        adminFee,
        layByFee,
        daysUntilTravel
      };
    }
    
    // Calculate installment period
    const weeksUntilTravel = Math.floor(daysUntilTravel / 7);
    const weeksUntilTwoWeeksBefore = Math.max(0, weeksUntilTravel - 2);
    const installmentLengthWeeks = Math.min(this.MAX_INSTALLMENT_WEEKS, weeksUntilTwoWeeksBefore);
    
    // 20% deposit
    const depositAmount = Math.round(flightPrice * this.DEPOSIT_PERCENTAGE * 100) / 100;
    const remainingAmount = flightPrice - depositAmount;
    
    // Weekly installments
    const weeklyInstallmentAmount = installmentLengthWeeks > 0 
      ? Math.round((remainingAmount / installmentLengthWeeks) * 100) / 100 
      : 0;
    
    // Generate payment schedule
    const schedule = this.generateWeeklyPaymentSchedule(
      depositAmount,
      weeklyInstallmentAmount,
      installmentLengthWeeks,
      bookingDate,
      travelDate
    );
    
    return {
      eligible: true,
      flightPrice,
      baseCost,
      adminFee,
      layByFee,
      depositAmount,
      installmentAmount: weeklyInstallmentAmount,
      installmentCount: installmentLengthWeeks,
      installmentCadence: 'weekly',
      schedule,
      daysUntilTravel,
      weeksUntilTravel: installmentLengthWeeks
    };
  }

  private static generateWeeklyPaymentSchedule(
    depositAmount: number,
    weeklyInstallmentAmount: number,
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

    // Weekly installments
    for (let i = 1; i <= installmentCount; i++) {
      const dueDate = new Date(bookingDate);
      dueDate.setDate(dueDate.getDate() + (7 * i)); // Weekly payments

      // Ensure payment is at least 2 weeks before travel
      const twoWeeksBeforeTravel = new Date(travelDate);
      twoWeeksBeforeTravel.setDate(twoWeeksBeforeTravel.getDate() - 14);
      
      if (dueDate > twoWeeksBeforeTravel) {
        dueDate.setTime(twoWeeksBeforeTravel.getTime());
      }

      const description = i === installmentCount ? "Final Payment" : `Weekly Payment ${i}`;

      schedule.push({
        paymentNumber: i + 1,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: weeklyInstallmentAmount,
        description: `${description} - Due ${dueDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`,
      });
    }

    return schedule;
  }

  static isEligibleForPaymentPlan(baseCost: number, travelDate: Date): boolean {
    const calculation = this.calculatePaymentPlan(baseCost, travelDate);
    return calculation.eligible;
  }
}