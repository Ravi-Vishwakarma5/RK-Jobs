import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getSubscriptionPlanById } from '@/data/subscriptions';

// Razorpay test credentials (hardcoded)

const RAZORPAY_KEY_ID = 'rzp_test_7VXRc8O89d3bz1'
const RAZORPAY_KEY_SECRET = '69fFf3BjY8z7Yd3r98gVPmni'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, userId, email, name } = body;

    // Validate required fields
    if (!planId || !userId || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the subscription plan details
    const plan = await getSubscriptionPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
    }

    // Convert INR to paise (1 INR = 100 paise)
    const amountInPaise = plan.price * 100;

    // Initialize Razorpay instance with test credentials
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    // Create the Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: plan.currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: true,
      notes: {
        planId: plan.id,
        userId,
        email,
        name,
        duration: plan.duration,
      },
    }) as any;

    // Return order and user info
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      planDetails: {
        name: plan.name,
        description: plan.description,
        duration: plan.duration,
      },
      userInfo: {
        name,
        email,
        userId,
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
  }
}
