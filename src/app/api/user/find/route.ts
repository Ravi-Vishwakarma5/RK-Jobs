import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/uitlis/model/mongodb';
import { generateToken } from '@/app/uitlis/jwt';

// This endpoint finds a user by email and checks if they have an active subscription
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/user/find');

  try {
    // Parse request body
    const body = await request.json();
    console.log('Request body:', body);

    // Extract email
    const { email } = body;

    // Validate required fields
    if (!email) {
      console.error('Missing required field: email');
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB');

    // Define the subscription schema
    const subscriptionSchema = new mongoose.Schema({
      name: String,
      email: String,
      paymentId: String,
      amount: Number,
      planId: String,
      planName: String,
      status: String,
      startDate: Date,
      endDate: Date,
      createdAt: Date
    });

    // Create or get the subscription model
    let SubscriptionModel;
    try {
      SubscriptionModel = mongoose.model('Subscription');
      console.log('Using existing Subscription model');
    } catch (e) {
      SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);
      console.log('Created new Subscription model');
    }

    // Find subscription by email
    console.log(`Finding subscription for email: ${email}`);
    const subscription = await (SubscriptionModel as any).findOne({
      email: email,
      status: 'active',
      endDate: { $gt: new Date() } // Subscription end date is in the future
    }).sort({ createdAt: -1 }); // Get the most recent active subscription

    if (!subscription) {
      console.log('No active subscription found for this email');
      return NextResponse.json({
        success: false,
        message: 'No active subscription found for this email',
        hasActiveSubscription: false
      });
    }

    console.log('Active subscription found:', subscription._id);

    // Generate JWT token
    const userData = {
      name: subscription.name,
      email: subscription.email,
      subscriptionId: subscription._id,
      hasActiveSubscription: true
    };

    const token = generateToken(userData);
    console.log('Generated JWT token for user');

    // Return subscription data with JWT token
    return NextResponse.json({
      success: true,
      message: 'Active subscription found',
      hasActiveSubscription: true,
      token,
      user: {
        name: subscription.name,
        email: subscription.email
      },
      subscription: {
        id: subscription._id,
        planName: subscription.planName,
        startDate: subscription.startDate,
        endDate: subscription.endDate
      }
    });
  } catch (error: any) {
    console.error('Error finding subscription:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to find subscription',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
