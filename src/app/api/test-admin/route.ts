import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/app/uitlis/jwt';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing admin login functionality...');

    const body = await request.json();
    const { email, password } = body;

    console.log('Test admin login with:', email, password);

    // Check credentials
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Admin credentials match!');

      // Test token generation
      const adminPayload = {
        id: 'admin-1',
        name: 'Admin User',
        email: email,
        isAdmin: true,
        role: 'admin'
      };

      console.log('Generating token with payload:', adminPayload);

      const token = generateToken(adminPayload, '24h');

      console.log('Token generated successfully:', !!token);
      console.log('Token length:', token?.length);

      return NextResponse.json({
        success: true,
        message: 'Test admin login successful',
        token,
        tokenLength: token?.length,
        user: {
          id: 'admin-1',
          name: 'Admin User',
          email: email,
          isAdmin: true,
          role: 'admin'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials for test'
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Test admin login failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
