import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/uitlis/model/mongodb';

// This endpoint retrieves all subscriptions from MongoDB
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/subscriptions');

  try {
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

    // Create or get the model
    let SubscriptionModel;
    try {
      SubscriptionModel = mongoose.model('Subscription');
      console.log('Using existing Subscription model');
    } catch (e) {
      SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);
      console.log('Created new Subscription model');
    }

    // Get all subscriptions
    console.log('Fetching subscriptions...');
    const subscriptions = await (SubscriptionModel as any).find().sort({ createdAt: -1 });
    console.log(`Found ${subscriptions.length} subscriptions`);

    // Return subscriptions
    return NextResponse.json({
      success: true,
      count: subscriptions.length,
      subscriptions
    });
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({
      error: 'Failed to fetch subscriptions',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
