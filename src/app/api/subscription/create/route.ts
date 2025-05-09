import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import SubscriptionModel from '@/app/uitlis/model/subscription';
import UserModel from '@/app/uitlis/model/user';
import crypto from 'crypto';

// This endpoint creates a new subscription order
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/subscription/create');

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError: any) {
      console.error('Request parsing error:', parseError);
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid request format',
          details: parseError.message
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate required fields
    const requiredFields = ['email', 'fullName'];
    const missingFields = [];

    for (const field of requiredFields) {
      if (!body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return new NextResponse(
        JSON.stringify({
          error: `Missing required fields: ${missingFields.join(', ')}`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    try {
      const mongoose = await connectDB();
      console.log('MongoDB connection state:', mongoose.connection.readyState);

      // Check if the connection is actually established
      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB connection not established');
      }

      console.log('MongoDB connected successfully');
    } catch (dbError: any) {
      console.error('MongoDB connection error:', dbError);
      throw new Error(`Failed to connect to MongoDB: ${dbError.message}`);
    }

    // Generate a unique user ID if not provided
    // In a real app, this would come from authentication
    const userId = body.userId || `user_${crypto.randomBytes(8).toString('hex')}`;

    // Check if user exists, create if not
    let user = await UserModel.findOne({ email: body.email });

    if (!user) {
      console.log('User not found, creating new user');
      user = new UserModel({
        email: body.email,
        fullName: body.fullName,
        role: 'user',
        isActive: true,
        hasActiveSubscription: false
      });

      // Set a temporary password if not provided
      if (!body.password) {
        const tempPassword = crypto.randomBytes(8).toString('hex');
        user.setPassword(tempPassword);
        console.log('Temporary password generated:', tempPassword);
      } else {
        user.setPassword(body.password);
      }

      await user.save();
      console.log('New user created with ID:', user._id);
    } else {
      console.log('User found with ID:', user._id);
    }

    // Create a new subscription with pending status
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    console.log('Creating new subscription...');

    // Declare subscription variable outside the try block so it's accessible later
    let subscription;

    try {
      const subscriptionData = {
        userId: user._id,
        email: body.email,
        fullName: body.fullName,
        plan: 'standard',
        amount: 699, // 699 INR as per requirements
        currency: 'INR',
        paymentId: `pay_${crypto.randomBytes(8).toString('hex')}`,
        paymentMethod: 'razorpay',
        status: 'pending',
        features: ['unlimited_jobs', 'referrals', 'interview_review', 'cv_review'],
        startDate: new Date(),
        endDate: oneYearFromNow
      };

      console.log('Subscription data:', JSON.stringify(subscriptionData, null, 2));

      subscription = new SubscriptionModel(subscriptionData);

      // Save the subscription to the database
      console.log('Saving subscription to database...');
      await subscription.save();
      console.log('New subscription created with ID:', subscription._id);

      // Double-check that the subscription was saved
      const savedSubscription = await SubscriptionModel.findById(subscription._id);
      if (!savedSubscription) {
        throw new Error('Subscription was not saved to the database');
      }
      console.log('Verified subscription was saved with ID:', savedSubscription._id);
    } catch (saveError: any) {
      console.error('Error saving subscription:', saveError);
      throw new Error(`Failed to save subscription: ${saveError.message}`);
    }

    if (!subscription || !subscription._id) {
      throw new Error('Failed to create subscription: subscription object is invalid');
    }

    // In a real implementation, you would integrate with Razorpay here
    // For now, we'll simulate creating an order
    const razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    // Update the subscription with the order ID
    subscription.razorpayOrderId = razorpayOrderId;
    await subscription.save();

    return new NextResponse(
      JSON.stringify({
        success: true,
        orderId: razorpayOrderId,
        subscriptionId: subscription._id,
        amount: subscription.amount,
        currency: subscription.currency,
        userId: user._id,
        // Include other details needed for the payment form
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_yourkeyhere',
        // In a real implementation, you would include the actual Razorpay order details
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to create subscription',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
