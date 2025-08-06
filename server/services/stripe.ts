import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

export interface PaymentIntentData {
  amount: number; // in cents
  currency: string;
  metadata?: Record<string, string>;
  customer_email?: string;
}

export interface SubscriptionData {
  customer_email: string;
  amount: number; // in cents
  currency: string;
  interval: 'week' | 'month';
  interval_count: number; // 1 for weekly, 2 for bi-weekly
  metadata?: Record<string, string>;
}

export class StripeService {
  // Create payment intent for one-time payments (deposits or full payments)
  static async createPaymentIntent(data: PaymentIntentData): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.create({
      amount: Math.round(data.amount), // Ensure it's a whole number
      currency: data.currency,
      metadata: data.metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  // Create customer for recurring payments
  static async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return await stripe.customers.create({
      email,
      name,
    });
  }

  // Create subscription for installment payments
  static async createSubscription(customerId: string, data: SubscriptionData): Promise<Stripe.Subscription> {
    // First create a price for the installment amount
    const price = await stripe.prices.create({
      unit_amount: Math.round(data.amount),
      currency: data.currency,
      recurring: {
        interval: data.interval,
        interval_count: data.interval_count,
      },
      product_data: {
        name: 'Flight Payment Installment',
      },
      metadata: data.metadata || {},
    });

    // Create the subscription
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: price.id,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: data.metadata || {},
    });
  }

  // Cancel subscription (if needed)
  static async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  // Retrieve payment intent
  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }

  // Retrieve subscription
  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await stripe.subscriptions.retrieve(subscriptionId);
  }
}