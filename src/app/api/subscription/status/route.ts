import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import SubscriptionModel from '@/app/uitlis/model/subscription';
import UserModel from '@/app/uitlis/model/user';

// This endpoint checks a user's subscription status
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/subscription/status');
  
  try {
    // Get user ID or email from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    
    if (!userId && !email) {
      console.error('Missing userId or email parameter');
      return new NextResponse(
        JSON.stringify({ 
          error: 'User ID or email is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    // Find the user
    let user;
    if (userId) {
      user = await UserModel.findById(userId);
    } else if (email) {
      user = await UserModel.findOne({ email });
    }
    
    if (!user) {
      console.error('User not found');
      return new NextResponse(
        JSON.stringify({ 
          error: 'User not found',
          hasActiveSubscription: false
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('Found user with ID:', user._id);
    
    // If user has no subscription, return inactive status
    if (!user.hasActiveSubscription || !user.subscriptionId) {
      return new NextResponse(
        JSON.stringify({
          hasActiveSubscription: false,
          message: 'User has no active subscription'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Find the subscription
    const subscription = await SubscriptionModel.findById(user.subscriptionId);
    
    if (!subscription) {
      console.error('Subscription not found for user:', user._id);
      
      // Update user record since subscription wasn't found
      user.hasActiveSubscription = false;
      user.subscriptionId = undefined;
      await user.save();
      
      return new NextResponse(
        JSON.stringify({
          hasActiveSubscription: false,
          message: 'Subscription record not found'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if subscription is active and not expired
    const isActive = subscription.status === 'active' && new Date(subscription.endDate) > new Date();
    
    // If subscription has expired, update user and subscription records
    if (!isActive && subscription.status === 'active') {
      subscription.status = 'expired';
      await subscription.save();
      
      user.hasActiveSubscription = false;
      await user.save();
      
      console.log('Subscription has expired, records updated');
    }
    
    // Calculate days remaining
    let daysRemaining = 0;
    if (isActive) {
      const now = new Date();
      const end = new Date(subscription.endDate);
      const diffTime = Math.abs(end.getTime() - now.getTime());
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return new NextResponse(
      JSON.stringify({
        hasActiveSubscription: isActive,
        subscription: {
          id: subscription._id,
          plan: subscription.plan,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          features: subscription.features,
          daysRemaining
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error checking subscription status:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to check subscription status',
        details: error.message,
        hasActiveSubscription: false
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
