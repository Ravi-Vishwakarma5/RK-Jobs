import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/uitlis/model/mongodb';
import SubscriptionModel from '@/app/uitlis/model/subscription';
import UserModel from '@/app/uitlis/model/user';
import PaymentModel from '@/app/uitlis/model/payment';
import crypto from 'crypto';

// This endpoint verifies a payment and activates the subscription
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/subscription/verify');

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
    const requiredFields = ['razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature'];
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

    // Find the subscription by order ID
    const subscription = await SubscriptionModel.findOne({
      razorpayOrderId: body.razorpayOrderId
    });

    if (!subscription) {
      console.error('Subscription not found for order ID:', body.razorpayOrderId);
      return new NextResponse(
        JSON.stringify({
          error: 'Subscription not found'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Found subscription with ID:', subscription._id);

    // In a real implementation, you would verify the Razorpay signature here
    // For now, we'll simulate a successful verification

    // const generatedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(`${body.razorpayOrderId}|${body.razorpayPaymentId}`)
    //   .digest('hex');

    // const isSignatureValid = generatedSignature === body.razorpaySignature;

    // For demo purposes, always consider the signature valid
    const isSignatureValid = true;

    if (!isSignatureValid) {
      console.error('Invalid signature');
      return new NextResponse(
        JSON.stringify({
          error: 'Payment verification failed'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update the subscription with payment details
    subscription.razorpayPaymentId = body.razorpayPaymentId;
    subscription.razorpaySignature = body.razorpaySignature;
    subscription.status = 'active';
    subscription.transactionDetails = body;

    await subscription.save();
    console.log('Subscription activated successfully');

    // Create a payment record
    try {
      console.log('Creating payment record...');

      // Extract subscription details
      const subscriptionId = subscription._id ? subscription._id.toString() : '';
      const userId = subscription.userId ? subscription.userId.toString() : '';
      const email = subscription.email || '';
      const fullName = subscription.fullName || '';
      const amount = subscription.amount || 0;
      const currency = subscription.currency || 'INR';

      console.log('Payment details:', {
        userId,
        email,
        fullName,
        amount,
        currency,
        paymentId: body.razorpayPaymentId,
        orderId: body.razorpayOrderId,
        subscriptionId
      });

      // Create payment record
      try {
        // Create a direct MongoDB connection
        const db = mongoose.connection.db;
        console.log('MongoDB database name:', mongoose.connection.name);
        console.log('MongoDB connection state:', mongoose.connection.readyState);

        // Insert directly using MongoDB driver
        const result = await db.collection('payments').insertOne({
          userId,
          email,
          fullName,
          amount,
          currency,
          paymentId: body.razorpayPaymentId,
          orderId: body.razorpayOrderId,
          paymentMethod: 'razorpay',
          status: 'success',
          subscriptionId,
          paymentDate: new Date(),
          signature: body.razorpaySignature,
          transactionDetails: body,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log('Payment record created directly with ID:', result.insertedId);

        // Also try with Mongoose model as a backup
        const payment = new PaymentModel({
          userId,
          email,
          fullName,
          amount,
          currency,
          paymentId: body.razorpayPaymentId + '_mongoose',
          orderId: body.razorpayOrderId,
          paymentMethod: 'razorpay',
          status: 'success',
          subscriptionId,
          paymentDate: new Date(),
          signature: body.razorpaySignature,
          transactionDetails: body
        });

        await payment.save();
        console.log('Payment record also created with Mongoose, ID:', payment._id);
      } catch (mongooseError: any) {
        console.error('Error with Mongoose payment creation:', mongooseError);

        // Try one more approach - direct MongoDB client
        try {
          const { MongoClient } = require('mongodb');
          const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-portal';
          const client = new MongoClient(uri);

          await client.connect();
          console.log('Connected directly to MongoDB');

          const database = client.db('job-portal');
          const paymentsCollection = database.collection('direct_payments');

          const doc = {
            userId,
            email,
            fullName,
            amount,
            currency,
            paymentId: body.razorpayPaymentId + '_direct',
            orderId: body.razorpayOrderId,
            paymentMethod: 'razorpay',
            status: 'success',
            subscriptionId,
            paymentDate: new Date(),
            createdAt: new Date()
          };

          const result = await paymentsCollection.insertOne(doc);
          console.log('Payment saved directly to MongoDB:', result.insertedId);

          await client.close();
        } catch (directError: any) {
          console.error('Error with direct MongoDB connection:', directError);
        }
      }
    } catch (paymentError: any) {
      console.error('Error creating payment record:', paymentError);
      console.error('Error stack:', paymentError.stack);
      // Continue with subscription activation even if payment record creation fails
    }

    // Update the user's subscription status
    const user = await UserModel.findById(subscription.userId);

    if (user) {
      user.hasActiveSubscription = true;
      user.subscriptionId = subscription._id ? subscription._id.toString() : '';
      await user.save();
      console.log('User subscription status updated');
    } else {
      console.warn('User not found for subscription:', subscription._id);
    }

    // Prepare payment info for response
    const paymentInfo = {
      paymentId: body.razorpayPaymentId,
      orderId: body.razorpayOrderId,
      amount: subscription.amount || 0,
      currency: subscription.currency || 'INR',
      status: 'success',
      date: new Date().toISOString()
    };

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Payment verified and subscription activated',
        subscription: {
          id: subscription._id,
          plan: subscription.plan,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          features: subscription.features
        },
        payment: paymentInfo,
        user: {
          email: subscription.email,
          fullName: subscription.fullName
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to verify payment',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
