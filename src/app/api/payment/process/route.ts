import { NextRequest, NextResponse } from 'next/server';
import {
  addPaymentRecord,
  addSubscription,
  getSubscriptionPlanById
} from '@/data/subscriptions';
import { PaymentRequest } from '@/types/subscription';

// Mock function to simulate sending an email
async function sendEmail(to: string, subject: string, body: string) {
  console.log(`Sending email to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);

  // In a real application, you would use a service like SendGrid, Mailgun, etc.
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();

    // Validate required fields
    const requiredFields = ['planId', 'userId', 'email', 'name', 'paymentMethod'];
    for (const field of requiredFields) {
      if (!body[field as keyof PaymentRequest]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get the subscription plan
    const plan = getSubscriptionPlanById(body.planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Process payment (this would normally integrate with a payment gateway like Stripe)
    // For this example, we'll simulate a successful payment
    const paymentSuccessful = Math.random() > 0.2; // 80% success rate for demo purposes

    if (!paymentSuccessful) {
      return NextResponse.json(
        { error: 'Payment processing failed', success: false },
        { status: 400 }
      );
    }

    // Record the payment
    const paymentRecord = addPaymentRecord({
      userId: body.userId,
      planId: body.planId,
      amount: plan.price,
      currency: plan.currency,
      status: 'completed',
      paymentMethod: body.paymentMethod,
      createdAt: new Date().toISOString(),
      transactionId: `txn_${Math.random().toString(36).substring(2, 15)}`
    });

    // Create subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration); // Add duration (e.g., 365 days)

    const subscription = addSubscription({
      userId: body.userId,
      planId: body.planId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      paymentId: paymentRecord.id
    });

    // Send confirmation email
    await sendEmail(
      body.email,
      `Your ${plan.name} Subscription is Confirmed!`,
      `
Dear ${body.name},

Thank you for subscribing to our ${plan.name} plan!

Your subscription is now active and will be valid until ${endDate.toLocaleDateString()}.

Subscription Details:
- Plan: ${plan.name}
- Amount: ${plan.price} ${plan.currency}
- Start Date: ${startDate.toLocaleDateString()}
- End Date: ${endDate.toLocaleDateString()}
- Transaction ID: ${paymentRecord.transactionId}

Thank you for choosing our service!

Best regards,
The Job Portal Team
      `
    );

    return NextResponse.json({
      success: true,
      subscription,
      payment: paymentRecord,
      redirectUrl: '/home' // Always redirect to home page after successful payment
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment', success: false },
      { status: 500 }
    );
  }
}
