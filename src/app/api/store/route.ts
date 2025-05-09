import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/uitlis/model/mongodb';

// This endpoint stores subscription data in MongoDB
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/store');

  try {
    // Parse request body
    const body = await request.json();
    console.log('Request body:', body);

    // Extract subscription details
    const { name, email, paymentId, amount, planId, planName } = body;

    // Validate required fields
    if (!name || !email) {
      console.error('Missing required fields');
      return NextResponse.json({
        error: 'Missing required fields. Need at least name and email.'
      }, { status: 400 });
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB');

    // Define a simple subscription schema directly here for reliability
    const subscriptionSchema = new mongoose.Schema({
      name: String,
      email: String,
      paymentId: String,
      amount: Number,
      planId: String,
      planName: String,
      status: { type: String, default: 'active' },
      startDate: { type: Date, default: Date.now },
      endDate: Date,
      createdAt: { type: Date, default: Date.now }
    });

    // Create or get the model
    let SubscriptionModel;
    try {
      SubscriptionModel = mongoose.model('Subscription');
      console.log('Using existing Subscription model');
    } catch (e) {
      SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);
      console.log('Created new Subscription model');
    }

    // Calculate end date (1 year from now)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Create subscription document
    console.log('Creating subscription document...');
    const subscription = new SubscriptionModel({
      name,
      email,
      paymentId: paymentId || `pay_${Date.now()}`,
      amount: amount,
      planId: planId || 'premium',
      planName: planName || 'Premium',
      status: 'active',
      startDate: new Date(),
      endDate
    });

    // Save subscription document
    console.log('Saving subscription document...');
    const savedSubscription = await subscription.save();
    console.log('Subscription saved to MongoDB:', savedSubscription._id);

    // Also save to the payments collection for consistency
    const paymentSchema = new mongoose.Schema({
      name: String,
      email: String,
      paymentId: String,
      amount: Number,
      status: String,
      date: { type: Date, default: Date.now }
    });

    // Create or get the model
    let PaymentModel;
    try {
      PaymentModel = mongoose.model('Payment');
      console.log('Using existing Payment model');
    } catch (e) {
      PaymentModel = mongoose.model('Payment', paymentSchema);
      console.log('Created new Payment model');
    }

    // Create payment document
    const payment = new PaymentModel({
      name,
      email,
      paymentId: paymentId || `pay_${Date.now()}`,
      amount: amount,
      status: 'success',
      date: new Date()
    });

    // Save payment document
    await payment.save();
    console.log('Payment also saved to MongoDB');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Subscription data saved successfully',
      subscriptionId: savedSubscription._id,
      subscription: savedSubscription
    });
  } catch (error: any) {
    console.error('Error saving subscription data:', error);
    return NextResponse.json({
      error: 'Failed to save subscription data',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
