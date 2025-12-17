import Stripe from "stripe";

// ---------------- Production --------------
// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error("STRIPE_SECRET_KEY environment variable is required");
// }

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2025-07-30.basil",
// });
// -----------------------------------------

// ---------------- TEST --------------
if (!process.env.STRIPE_SECRET_KEY_TEST) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST, {
  apiVersion: "2025-07-30.basil",
});
// -----------------------------------------

export interface PaymentIntentData {
  amount: number; // in cents
  currency: string;
  metadata?: Record<string, string>;
  customer_email?: string;
  setup_future_usage?: 'off_session' | 'on_session';
}

export interface SubscriptionData {
  customer_email: string;
  amount: number; // in cents
  currency: string;
  interval: "week" | "month";
  interval_count: number; // 1 for weekly, 2 for bi-weekly
  metadata?: Record<string, string>;
  payment_method_id?: string; // Payment method to attach to customer
}

export class StripeService {
  
  // Create payment intent for one-time payments (deposits or full payments)
  static async createPaymentIntent(
    data: PaymentIntentData,
  ): Promise<Stripe.PaymentIntent> {
    // Get or create customer if email is provided
    let customerId: string | undefined;
    if (data.customer_email) {
      const customer = await this.getOrCreateCustomer(data.customer_email);
      customerId = customer.id;
    }

    return await stripe.paymentIntents.create({
      amount: Math.round(data.amount), // Ensure it's a whole number
      currency: data.currency,
      metadata: data.metadata || {},
      receipt_email: data.customer_email,
      customer: customerId,
      setup_future_usage: data.setup_future_usage, // This is key for saving payment methods
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  // Create customer for recurring payments
  static async createCustomer(
    email: string,
    name?: string,
  ): Promise<Stripe.Customer> {
    return await stripe.customers.create({
      email,
      name,
    });
  }

  // Get or create customer by email (helpful for handling existing customers)
  static async getOrCreateCustomer(
    email: string,
    name?: string
  ): Promise<Stripe.Customer> {
    try {
      // Try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Create new customer if none exists
      return await this.createCustomer(email, name);
    } catch (error) {
      console.error("Error getting or creating customer:", error);
      throw error;
    }
  }

  // Attach payment method to customer
  static async attachPaymentMethodToCustomer(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    return await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  // Set default payment method for customer
  static async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    return await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  // Create subscription for installment payments
  static async createSubscription(
    customerId: string,
    data: SubscriptionData,
  ): Promise<Stripe.Subscription> {
    // First create a price for the installment amount
    const price = await stripe.prices.create({
      unit_amount: Math.round(data.amount),
      currency: data.currency,
      recurring: {
        interval: data.interval,
        interval_count: data.interval_count,
      },
      product_data: {
        name: "Flight Payment Installment",
      },
      metadata: data.metadata || {},
    });

    // Attach and set default payment method if provided
    if (data.payment_method_id) {
      await this.attachPaymentMethodToCustomer(data.payment_method_id, customerId);
      await this.setDefaultPaymentMethod(customerId, data.payment_method_id);
    }

    // Create the subscription
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: price.id,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: data.metadata || {},
    });
  }

  // Cancel subscription (if needed)
  static async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  // Retrieve payment intent
  static async getPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }

  // Retrieve subscription
  static async getSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }


  // ACTUAL REQUEST
  static async createInstallmentPrice(
    amount: number, // amount in dollars (not cents)
    currency: string,
    interval: 'week' | 'month',
    interval_count: number,
    productId?: string
  ) {
    const product = productId
      ? { product: productId }
      : { product_data: { name: "Flight Installment" } };

    try {
      const price = await stripe.prices.create({
        unit_amount: Math.round(amount * 100), // Convert dollars to cents
        currency,
        recurring: { 
          interval, 
        interval_count},
        ...product,
      });

      return price;
    } catch (error) {
      console.error("Error creating installment price:", error);
      throw error;
    }
  }

  static async createInstallmentSchedule(
    customerId: string,
    priceId: string,
    iterations: number,
    startDate: Date,
    paymentMethodId?: string, // Payment method to use for the schedule
    metadata?: Record<string, string>
  ) {

    try {
      // If payment method is provided, attach it to the customer and set as default
      if (paymentMethodId) {
        await this.attachPaymentMethodToCustomer(paymentMethodId, customerId);
        await this.setDefaultPaymentMethod(customerId, paymentMethodId);
      }

      const schedule = await stripe.subscriptionSchedules.create({
        customer: customerId,
        start_date: Math.floor(startDate.getTime() / 1000),
        end_behavior: 'cancel',
        phases: [
          {
            iterations,
            items: [{ price: priceId }],
          },
        ],
        metadata,
      });

      return schedule;
    } catch (error) {
      console.error("Error creating subscription schedule:", error);
      throw error;
    }
  }

  // Retrieve subscription schedule
  static async getSubscriptionSchedule(
    scheduleId: string,
  ): Promise<Stripe.SubscriptionSchedule> {
    return await stripe.subscriptionSchedules.retrieve(scheduleId);
  }

  // Cancel subscription schedule
  static async cancelSubscriptionSchedule(
    scheduleId: string,
  ): Promise<Stripe.SubscriptionSchedule> {
    return await stripe.subscriptionSchedules.cancel(scheduleId);
  }

  // Get customer's payment methods
  static async getCustomerPaymentMethods(
    customerId: string,
    type: 'card' | 'us_bank_account' = 'card'
  ): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: type,
    });
    return paymentMethods.data;
  }

  // Get customer by ID
  static async getCustomer(customerId: string): Promise<Stripe.Customer> {
    return await stripe.customers.retrieve(customerId) as Stripe.Customer;
  }
}