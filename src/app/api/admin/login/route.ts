import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/app/uitlis/jwt';

export async function POST(request: NextRequest) {
  console.log('POST request received at /api/admin/login');

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid request format'
      }, { status: 400 });
    }

    const { email, password } = body;
    console.log('Admin login attempt for email:', email);

    // Validate required fields
    if (!email || !password) {
      console.log('Missing required fields:', { email: !!email, password: !!password });
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // DIRECT HARDCODED CHECK - This will always work for development
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Hardcoded admin credentials match!');

      try {
        // Create a simple payload for the admin token
        const adminPayload = {
          id: 'admin-1',
          name: 'Admin User',
          email: email,
          isAdmin: true,
          role: 'admin'
        };

        console.log('Creating admin token with payload:', adminPayload);

        // Generate token using the JWT utility
        const token = generateToken(adminPayload, '24h'); // 24 hour expiration

        if (!token) {
          throw new Error('Token generation returned null or undefined');
        }

        console.log('Admin token generated successfully, length:', token.length);

        // Create admin user data
        const adminUser = {
          id: 'admin-1',
          name: 'Admin User',
          email: email,
          isAdmin: true,
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        console.log('Returning admin login success response');

        // Return success with token and user data
        return NextResponse.json({
          success: true,
          token,
          user: adminUser,
          message: 'Admin login successful'
        });
      } catch (tokenError: any) {
        console.error('Error generating admin token:', tokenError);
        console.error('Token error stack:', tokenError?.stack);

        // Provide more detailed error information
        return NextResponse.json({
          success: false,
          error: 'Error generating authentication token',
          details: tokenError?.message || 'Unknown token generation error',
          tokenErrorType: tokenError?.name || 'Unknown error type'
        }, { status: 500 });
      }
    }

    // If hardcoded admin credentials don't match, return error immediately
    console.log('Hardcoded admin credentials do not match');
    return NextResponse.json({
      success: false,
      error: 'Invalid email or password'
    }, { status: 401 });

  } catch (error: any) {
    console.error('Error in admin login:', error);
    return NextResponse.json({
      success: false,
      error: 'An error occurred during login',
      details: error.message
    }, { status: 500 });
  }
}
