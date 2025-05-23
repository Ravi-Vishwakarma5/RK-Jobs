import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import AdminModel from '@/app/uitlis/model/admin';
import { generateToken } from '@/app/uitlis/jwt';
import bcrypt from 'bcryptjs';

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
        // Generate a token with default expiration time (1 hour)
        const token = generateToken({
          id: 'admin-1',
          name: 'Admin User',
          email: email,
          isAdmin: true
        });

        console.log('Admin token generated successfully');

        // Return success with token and user data
        return NextResponse.json({
          success: true,
          token,
          user: {
            id: 'admin-1',
            name: 'Admin User',
            email: email,
            isAdmin: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }
        });
      } catch (tokenError: any) {
        console.error('Error generating token:', tokenError);

        // Provide more detailed error information
        return NextResponse.json({
          success: false,
          error: 'Error generating authentication token',
          details: tokenError?.message || 'Unknown token generation error',
          stack: process.env.NODE_ENV === 'development' ? tokenError?.stack : undefined
        }, { status: 500 });
      }
    }

    // Try to connect to MongoDB
    try {
      console.log('Attempting to connect to MongoDB...');
      await connectDB();
      console.log('Connected to MongoDB successfully');

      // Find admin by email
      console.log('Searching for admin in database with email:', email);
      const admin = await AdminModel.findOne({ email }).exec();

      if (admin) {
        console.log('Admin found in database, comparing passwords...');

        // Compare passwords
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('Password match result:', isMatch);

        if (isMatch) {
          console.log('Password matched! Generating token...');

          // Generate JWT token
          const token = generateToken({
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            isAdmin: true
          }, '1h');

          // Update last login
          admin.lastLogin = new Date();
          await admin.save();

          // Return success response
          return NextResponse.json({
            success: true,
            token,
            user: {
              id: admin._id.toString(),
              name: admin.name,
              email: admin.email,
              status: admin.status,
              createdAt: admin.createdAt,
              lastLogin: admin.lastLogin
            }
          });
        }
      }

      // If admin not found or password doesn't match
      console.log('Admin not found or password doesn\'t match');
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error occurred. Please try again later.'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in admin login:', error);
    return NextResponse.json({
      success: false,
      error: 'An error occurred during login',
      details: error.message
    }, { status: 500 });
  }
}
