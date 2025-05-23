import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/uitlis/database';
import { generateToken } from '@/app/uitlis/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already in use' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user has an active subscription
    const subscription = await db.collection('subscriptions').findOne({ 
      email: email.toLowerCase(),
      status: 'active'
    });

    // Create new user
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      lastLogin: new Date(),
      hasActiveSubscription: !!subscription
    };

    // Insert user into database
    const result = await db.collection('users').insertOne(newUser);

    // Generate token
    const token = generateToken({
      id: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      type: 'regular'
    });

    // Return user data and token
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
