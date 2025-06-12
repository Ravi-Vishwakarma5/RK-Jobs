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
      fullName: String,
      email: String,
      paymentId: String,
      amount: Number,
      plan: String,
      status: String,
      startDate: Date,
      endDate: Date,
      createdAt: Date
    });

    // Define the user schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      createdAt: Date,
      lastLogin: Date,
      hasActiveSubscription: Boolean
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

    // Create or get the user model
    let UserModel;
    try {
      UserModel = mongoose.model('User');
      console.log('Using existing User model');
    } catch (e) {
      UserModel = mongoose.model('User', userSchema);
      console.log('Created new User model');
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

      // For testing purposes, create a test subscription for specific test emails
      const testEmails = ['test@example.com', 'user@example.com', 'demo@example.com'];

      if (testEmails.includes(email.toLowerCase())) {
        console.log('Creating test subscription for:', email);

        // Create a test subscription
        const testSubscription = new (SubscriptionModel as any)({
          fullName: 'Test User',
          email: email,
          paymentId: `test_pay_${Date.now()}`,
          amount: 699,
          plan: 'premium',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          createdAt: new Date()
        });

        await testSubscription.save();
        console.log('Test subscription created:', testSubscription._id);

        // Create or update user
        let testUser = await (UserModel as any).findOne({ email: email });
        if (!testUser) {
          testUser = new (UserModel as any)({
            name: 'Test User',
            email: email,
            role: 'user',
            createdAt: new Date(),
            lastLogin: new Date(),
            hasActiveSubscription: true
          });
          await testUser.save();
        } else {
          testUser.lastLogin = new Date();
          testUser.hasActiveSubscription = true;
          await testUser.save();
        }

        // Generate JWT token for test user
        const userData = {
          id: testUser._id,
          name: testUser.name,
          email: testUser.email,
          role: 'user',
          subscriptionId: testSubscription._id,
          hasActiveSubscription: true
        };

        const token = generateToken(userData);

        return NextResponse.json({
          success: true,
          message: 'Test subscription found',
          hasActiveSubscription: true,
          token,
          user: {
            id: testUser._id,
            name: testUser.name,
            email: testUser.email,
            role: 'user'
          },
          subscription: {
            id: testSubscription._id,
            plan: testSubscription.plan,
            planName: 'Premium',
            startDate: testSubscription.startDate,
            endDate: testSubscription.endDate,
            status: testSubscription.status
          }
        });
      }

      return NextResponse.json({
        success: false,
        message: 'No active subscription found for this email. Try using one of these test emails: test@example.com, user@example.com, or demo@example.com',
        hasActiveSubscription: false
      });
    }

    console.log('Active subscription found:', subscription._id);

    // Check if user exists in the users collection
    let user = await (UserModel as any).findOne({ email: email });

    // If user doesn't exist, create a basic user record
    if (!user) {
      console.log('User not found in users collection, creating new user record');
      const newUser = {
        name: subscription.fullName || subscription.name,
        email: email,
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date(),
        hasActiveSubscription: true,
        // No password - user will need to register to set a password
      };

      user = new (UserModel as any)(newUser);
      await user.save();
      console.log('Created new user record:', user._id);
    } else {
      // Update last login time and subscription status
      console.log('User found in users collection, updating last login time');
      user.lastLogin = new Date();
      user.hasActiveSubscription = true;
      await user.save();
    }

    // Generate JWT token
    const userData = {
      id: user._id,
      name: user.name || subscription.fullName || subscription.name,
      email: user.email,
      role: user.role || 'user',
      subscriptionId: subscription._id,
      hasActiveSubscription: true
    };

    const token = generateToken(userData);
    console.log('Generated JWT token for user');

    // Get plan name with proper capitalization
    const planName = subscription.plan
      ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
      : subscription.planName;

    // Return subscription data with JWT token
    return NextResponse.json({
      success: true,
      message: 'Active subscription found',
      hasActiveSubscription: true,
      token,
      user: {
        id: user._id,
        name: user.name || subscription.fullName || subscription.name,
        email: user.email,
        role: user.role || 'user'
      },
      subscription: {
        id: subscription._id,
        plan: subscription.plan,
        planName: planName,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status
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
