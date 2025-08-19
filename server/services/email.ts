import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email functionality will be disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

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
    this.isConfigured = !!process.env.SENDGRID_API_KEY;
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('SendGrid not configured - email would have been sent:', params.subject);
      return false;
    }

    try {
      const msg: any = {
        to: params.to,
        from: params.from || process.env.FROM_EMAIL || 'noreply@flightpay.com',
        subject: params.subject,
      };

      // Add content based on what's provided
      if (params.templateId && params.dynamicTemplateData) {
        msg.templateId = params.templateId;
        msg.dynamicTemplateData = params.dynamicTemplateData;
      } else {
        msg.content = [];
        if (params.text) {
          msg.content.push({
            type: 'text/plain',
            value: params.text
          });
        }
        if (params.html) {
          msg.content.push({
            type: 'text/html',
            value: params.html
          });
        }
      }

      await mailService.send(msg);
      console.log('Email sent successfully to:', params.to);
      return true;
    } catch (error: any) {
      console.error('SendGrid email error:', error);
      
      // Provide more specific error information
      if (error.code === 403) {
        console.error('SendGrid 403 Error: This is likely due to:');
        console.error('1. Sender email not verified in SendGrid');
        console.error('2. API key lacks permissions');
        console.error('3. Domain authentication required');
      }
      
      return false;
    }
  }

  async sendBookingConfirmation(email: string, data: BookingConfirmationData): Promise<boolean> {
    const subject = `Booking Confirmed - ${data.bookingReference}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Flight Booking Confirmed!</h2>
        
        <p>Dear ${data.customerName},</p>
        
        <p>Your flight booking has been confirmed. Here are your details:</p>
        
        <div style="background: #f8fafc; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #374151; margin-top: 0;">Flight Details</h3>
          <p><strong>Route:</strong> ${data.flightDetails.origin} → ${data.flightDetails.destination}</p>
          <p><strong>Departure:</strong> ${new Date(data.flightDetails.departureDate).toLocaleDateString()}</p>
          ${data.flightDetails.returnDate ? `<p><strong>Return:</strong> ${new Date(data.flightDetails.returnDate).toLocaleDateString()}</p>` : ''}
          <p><strong>Passengers:</strong> ${data.flightDetails.passengers}</p>
          <p><strong>Booking Reference:</strong> ${data.bookingReference}</p>
        </div>
        
        <div style="background: #ecfdf5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #065f46; margin-top: 0;">Payment Plan</h3>
          <p><strong>Total Amount:</strong> $${data.paymentPlan.totalAmount.toFixed(2)}</p>
          <p><strong>Deposit Paid:</strong> $${data.paymentPlan.depositAmount.toFixed(2)}</p>
          ${data.paymentPlan.installmentAmount ? `
            <p><strong>Installments:</strong> ${data.paymentPlan.installmentCount} payments of $${data.paymentPlan.installmentAmount.toFixed(2)} ${data.paymentPlan.frequency}</p>
          ` : ''}
        </div>
        
        <p>Thank you for choosing FlightPay! We'll send you reminders for upcoming payments.</p>
        
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
${data.flightDetails.returnDate ? `- Return: ${new Date(data.flightDetails.returnDate).toLocaleDateString()}` : ''}
- Passengers: ${data.flightDetails.passengers}
- Booking Reference: ${data.bookingReference}

Payment Plan:
- Total Amount: $${data.paymentPlan.totalAmount.toFixed(2)}
- Deposit Paid: $${data.paymentPlan.depositAmount.toFixed(2)}
${data.paymentPlan.installmentAmount ? `- Installments: ${data.paymentPlan.installmentCount} payments of $${data.paymentPlan.installmentAmount.toFixed(2)} ${data.paymentPlan.frequency}` : ''}

Thank you for choosing FlightPay!
    `;

    return this.sendEmail({
      to: email,
      from: 'bookings@flightpay.com',
      subject,
      text,
      html,
    });
  }

  async sendPaymentReminder(email: string, data: PaymentReminderData): Promise<boolean> {
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

Thank you for choosing FlightPay!
    `;

    return this.sendEmail({
      to: email,
      from: 'payments@flightpay.com',
      subject,
      text,
      html,
    });
  }

  async sendWelcomeEmail(email: string, customerName: string): Promise<boolean> {
    const subject = 'Welcome to FlightPay!';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to FlightPay!</h2>
        
        <p>Dear ${customerName},</p>
        
        <p>Welcome to FlightPay! We're excited to help you book flights with flexible payment plans.</p>
        
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
        <p>The FlightPay Team</p>
      </div>
    `;

    const text = `
Welcome to FlightPay!

Dear ${customerName},

Welcome to FlightPay! We're excited to help you book flights with flexible payment plans.

What's Next?
- Search for flights with our easy-to-use interface
- Choose from flexible payment plans starting at 20% down
- Book confidently with our secure payment system
- Manage your bookings and payments in your account

If you have any questions, our support team is here to help.

Happy travels!
The FlightPay Team
    `;

    return this.sendEmail({
      to: email,
      from: 'welcome@flightpay.com',
      subject,
      text,
      html,
    });
  }
}

export const emailService = EmailService.getInstance();