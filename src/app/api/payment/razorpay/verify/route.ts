import { NextRequest, NextResponse } from 'next/server';
import { addPaymentRecord, addSubscription } from '@/data/subscriptions';
// import crypto from 'crypto'; // Uncomment when implementing signature verification

// Razorpay test credentials
// const RAZORPAY_KEY_SECRET = 'thiswouldbeyoursecretkey'; // Uncomment when implementing signature verification

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
    const body = await request.json();

    // Validate required fields
    if (!body.razorpay_payment_id || !body.razorpay_order_id || !body.razorpay_signature || !body.planId || !body.userId || !body.email || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a production environment, you would verify the payment signature
    // This is important for security to ensure the payment data hasn't been tampered with
    //
    // const generatedSignature = crypto
    //   .createHmac('sha256', RAZORPAY_KEY_SECRET)
    //   .update(body.razorpay_order_id + '|' + body.razorpay_payment_id)
    //   .digest('hex');
    //
    // if (generatedSignature !== body.razorpay_signature) {
    //   return NextResponse.json(
    //     { error: 'Invalid payment signature' },
    //     { status: 400 }
    //   );
    // }

    // For this test implementation, we'll assume the payment is valid
    // In a real application, ALWAYS verify the signature

    // Record the payment
    const paymentRecord = addPaymentRecord({
      userId: body.userId,
      planId: body.planId,
      amount: body.amount / 100, // Convert from paise to INR
      currency: body.currency,
      status: 'completed',
      paymentMethod: 'razorpay',
      createdAt: new Date().toISOString(),
      transactionId: body.razorpay_payment_id
    });

    // Create subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + body.duration); // Add duration (e.g., 365 days)

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
      `Your ${body.planName} Subscription is Confirmed!`,
      `
Dear ${body.name},

Thank you for subscribing to our ${body.planName} plan!

Your subscription is now active and will be valid until ${endDate.toLocaleDateString()}.

Subscription Details:
- Plan: ${body.planName}
- Amount: ${body.amount / 100} ${body.currency}
- Start Date: ${startDate.toLocaleDateString()}
- End Date: ${endDate.toLocaleDateString()}
- Transaction ID: ${body.razorpay_payment_id}

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
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
