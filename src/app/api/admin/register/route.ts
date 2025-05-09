import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/data/users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;
    
    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }
    
    // In a real application, you would create a new user in the database
    // and use proper password hashing
    
    // For demo purposes, we'll create a mock user
    const newUser = {
      id: `admin-${Date.now()}`,
      name,
      email,
      role: 'admin' as const,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    
    // In a real app, this would be saved to a database
    // For demo purposes, we'll just return the new user
    
    return NextResponse.json({
      success: true,
      user: newUser
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
