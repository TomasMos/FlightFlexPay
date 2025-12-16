import { MailerSend, EmailParams as MailerSendEmailParams, Sender, Recipient } from "mailersend";

if (!process.env.MAILERSEND_API_KEY) {
  console.warn(
    "MAILERSEND_API_KEY environment variable not set - email functionality will be disabled",
  );
}

const mailerSend = process.env.MAILERSEND_API_KEY 
  ? new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY })
  : null;

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: any;
}

interface BookingConfirmationData {
  customerName: string;
  flightDetails: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    flightNumber: string;
    passengers: number;
  };
  paymentPlan: {
    totalAmount: number;
    depositAmount: number;
    installmentAmount?: number;
    installmentCount?: number;
    frequency?: string;
    currency: string
  };
  bookingReference: string;
}

interface PaymentReminderData {
  customerName: string;
  dueAmount: number;
  dueDate: string;
  bookingReference: string;
  paymentUrl: string;
}

export class EmailService {
  private static instance: EmailService;
  private isConfigured: boolean;

  private constructor() {
    this.isConfigured = !!process.env.MAILERSEND_API_KEY;
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!this.isConfigured || !mailerSend) {
      console.log(
        "MailerSend not configured - email would have been sent:",
        params.subject,
      );
      return false;
    }

    try {
      const sentFrom = new Sender(
        params.from || process.env.FROM_EMAIL || "no-reply@splickets.app",
        "Splickets"
      );
      const recipients = [new Recipient(params.to)];

      const emailParams = new MailerSendEmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(params.subject);

      if (params.html) {
        emailParams.setHtml(params.html);
      }
      if (params.text) {
        emailParams.setText(params.text);
      }

      await mailerSend.email.send(emailParams);
      console.log("Email sent successfully to:", params.to);
      return true;
    } catch (error: any) {
      console.error("MailerSend email error:", error);

      if (error.statusCode === 401) {
        console.error("MailerSend 401 Error: Invalid API key");
      } else if (error.statusCode === 403) {
        console.error("MailerSend 403 Error: This is likely due to:");
        console.error("1. Sender email domain not verified in MailerSend");
        console.error("2. API key lacks permissions");
      }

      return false;
    }
  }

  async sendBookingConfirmation(
    email: string,
    data: BookingConfirmationData,
  ): Promise<boolean> {
    const subject = `Booking Confirmed - ${data.bookingReference}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Flight Booking Confirmed!</h2>
        
        <p>Dear ${data.customerName},</p>
        
        <p>Your flight booking has been confirmed. Here are your details:</p>
        
        <div style="background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #374151; margin-top: 0;">Flight Details</h3>
          <p><strong>Route:</strong> ${data.flightDetails.origin} → ${data.flightDetails.destination}</p>
          <p><strong>Departure:</strong> ${new Date(data.flightDetails.departureDate).toLocaleString()}</p>
          ${data.flightDetails.returnDate ? `<p><strong>Return:</strong> ${new Date(data.flightDetails.returnDate).toLocaleString()}</p>` : ""}
          <p><strong>Passengers:</strong>  ${data.flightDetails.passengers}</p>
          <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #065f46; margin-top: 0;">Payment Plan</h3>
          <p><strong>Total Amount:</strong> ${data.paymentPlan.currency} ${data.paymentPlan.totalAmount.toFixed(2)}</p>
          <p><strong>Deposit Paid:</strong> ${data.paymentPlan.currency} ${data.paymentPlan.depositAmount.toFixed(2)}</p>
          ${
            data.paymentPlan.installmentAmount
              ? `
            <p><strong>Installments:</strong> ${data.paymentPlan.installmentCount} payments of ${data.paymentPlan.currency} ${data.paymentPlan.installmentAmount.toFixed(2)} ${data.paymentPlan.frequency}</p>
          `
              : ""
          }
        </div>
        
        <p>Thank you for choosing Splickets! We'll send you reminders for upcoming payments.</p>
        
        <div style="background: #f0f9ff; padding: 20px; margin: 30px 0; border-radius: 8px; text-align: center;">
          <h3 style="color: #1e40af; margin-top: 0;">Complete Your Account Setup</h3>
          <p style="margin: 10px 0;">Create your Splickets account to manage your bookings and payment schedule:</p>
          <a href="${'https://splickets.app/signin?signup=true' }" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">Create Account</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    const text = `
Flight Booking Confirmed!

Dear ${data.customerName},

Your flight booking has been confirmed.

Flight Details:
- Route: ${data.flightDetails.origin} → ${data.flightDetails.destination}
- Departure: ${new Date(data.flightDetails.departureDate).toLocaleDateString()}
${data.flightDetails.returnDate ? `- Return: ${new Date(data.flightDetails.returnDate).toLocaleDateString()}` : ""}
- Passengers: ${data.flightDetails.passengers}
- Booking Reference: ${data.bookingReference}

Payment Plan:
- Total Amount: $${data.paymentPlan.totalAmount.toFixed(2)}
- Deposit Paid: $${data.paymentPlan.depositAmount.toFixed(2)}
${data.paymentPlan.installmentAmount ? `- Installments: ${data.paymentPlan.installmentCount} payments of $${data.paymentPlan.installmentAmount.toFixed(2)} ${data.paymentPlan.frequency}` : ""}

Complete Your Account Setup:
Create your Splickets account to manage your bookings and payment schedule.
Visit: ${process.env.BASE_URL || 'http://localhost:5000'}/signin

Thank you for choosing Splickets!
    `;

    return this.sendEmail({
      to: email,
      from: "no-reply@splickets.app",
      subject,
      text,
      html,
    });
  }

  async sendPaymentReminder(
    email: string,
    data: PaymentReminderData,
  ): Promise<boolean> {
    const subject = `Payment Reminder - ${data.bookingReference}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Reminder</h2>
        
        <p>Dear ${data.customerName},</p>
        
        <p>This is a friendly reminder that your payment is due soon.</p>
        
        <div style="background: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626;">
          <h3 style="color: #991b1b; margin-top: 0;">Payment Due</h3>
          <p><strong>Amount:</strong> $${data.dueAmount.toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
          <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.paymentUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Make Payment</a>
        </div>
        
        <p>Please ensure payment is made by the due date to avoid any issues with your booking.</p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          If you have any questions or need assistance, please contact our support team.
        </p>
      </div>
    `;

    const text = `
Payment Reminder

Dear ${data.customerName},

This is a friendly reminder that your payment is due soon.

Payment Details:
- Amount: $${data.dueAmount.toFixed(2)}
- Due Date: ${new Date(data.dueDate).toLocaleDateString()}
- Booking Reference: ${data.bookingReference}

Please make your payment at: ${data.paymentUrl}

Thank you for choosing Splickets!
    `;

    return this.sendEmail({
      to: email,
      from: "no-reply@splickets.app",
      subject,
      text,
      html,
    });
  }

  async sendWelcomeEmail(
    email: string,
    customerName: string,
  ): Promise<boolean> {
    const subject = "Welcome to Splickets!";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Splickets!</h2>
        
        <p>Dear ${customerName},</p>
        
        <p>Welcome to Splickets! We're excited to help you book flights with flexible payment plans.</p>
        
        <div style="background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
          <ul style="color: #374151;">
            <li>Search for flights with our easy-to-use interface</li>
            <li>Choose from flexible payment plans starting at 20% down</li>
            <li>Book confidently with our secure payment system</li>
            <li>Manage your bookings and payments in your account</li>
          </ul>
        </div>
        
        <p>If you have any questions, our support team is here to help.</p>
        
        <p>Happy travels!</p>
        <p>The Splickets Team</p>
      </div>
    `;

    const text = `
Welcome to Splickets!

Dear ${customerName},

Welcome to Splickets! We're excited to help you book flights with flexible payment plans.

What's Next?
- Search for flights with our easy-to-use interface
- Choose from flexible payment plans starting at 20% down
- Book confidently with our secure payment system
- Manage your bookings and payments in your account

If you have any questions, our support team is here to help.

Happy travels!
The Splickets Team
    `;

    return this.sendEmail({
      to: email,
      from: "no-reply@splickets.app",
      subject,
      text,
      html,
    });
  }

  async addLeadToList(email: string, firstName?: string, lastName?: string) {
    console.log("MailerSend: Lead tracking - email:", email, "name:", firstName, lastName);
  }

  async getContactIdByEmail(email: string): Promise<string | null> {
    console.log("Contact lookup not implemented for MailerSend - email:", email);
    return null;
  }

  async removeFromList(listId: string, contactIds: string[]): Promise<void> {
    if (!contactIds.length) return;
    console.log("Remove from list not implemented for MailerSend");
  }

  async moveLeadToCustomers(email: string): Promise<void> {
    console.log("Move lead to customers - MailerSend implementation pending:", email);
  }
}

export const emailService = EmailService.getInstance();
