import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/uitlis/database';
import { generateToken } from '@/app/uitlis/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Check if user exists in the regular users collection
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user) {
      // If user not found in regular users, check subscriptions collection
      const subscription = await db.collection('subscriptions').findOne({ 
        email: email.toLowerCase(),
        status: 'active'
      });

      if (subscription) {
        // Generate token for subscription user
        const token = generateToken({
          id: subscription._id.toString(),
          email: subscription.email,
          name: subscription.fullName,
          type: 'subscription'
        });

        return NextResponse.json({
          success: true,
          message: 'Logged in with subscription',
          token,
          user: {
            id: subscription._id.toString(),
            email: subscription.email,
            name: subscription.fullName,
          },
          hasActiveSubscription: true,
          subscription: {
            id: subscription._id.toString(),
            plan: subscription.plan,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            status: subscription.status,
            planName: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
          }
        });
      }

      // No user found in either collection
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password for regular user
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has an active subscription
    const subscription = await db.collection('subscriptions').findOne({ 
      email: email.toLowerCase(),
      status: 'active'
    });

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      type: 'regular'
    });

    // Return user data and token
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      hasActiveSubscription: !!subscription,
      subscription: subscription ? {
        id: subscription._id.toString(),
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: subscription.status,
        planName: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
      } : null
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
