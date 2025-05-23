import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import AdminModel from '@/app/uitlis/model/admin';
import { generateToken } from '@/app/uitlis/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  console.log('POST request received at /api/admin/register');

  try {
    // Parse request body
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 });
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters'
      }, { status: 400 });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'Passwords do not match'
      }, { status: 400 });
    }

    try {
      // Connect to MongoDB
      await connectDB();

      // Check if admin with this email already exists
      const existingAdmin = await AdminModel.findOne({ email });

      if (existingAdmin) {
        return NextResponse.json({
          success: false,
          error: 'An admin with this email already exists'
        }, { status: 409 });
      }

      try {
        // Hash the password manually instead of relying on pre-save hook
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const admin = new AdminModel({
          name,
          email,
          password: hashedPassword,
          status: 'active',
          createdAt: new Date()
        });

        // Save admin to database
        const savedAdmin = await admin.save();
        console.log('New admin created:', savedAdmin.email);

        // Get the ID as string
        const adminId = savedAdmin._id ? savedAdmin._id.toString() : `admin-${Date.now()}`;

        // Return success response
        return NextResponse.json({
          success: true,
          message: 'Admin account created successfully',
          user: {
            id: adminId,
            name: savedAdmin.name,
            email: savedAdmin.email,
            status: savedAdmin.status,
            createdAt: savedAdmin.createdAt
          }
        }, { status: 201 });
      } catch (saveError: any) {
        console.error('Error saving admin to database:', saveError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create admin account',
          details: saveError.message || 'Unknown error'
        }, { status: 500 });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database error occurred. Please try again later.'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in admin registration:', error);
    return NextResponse.json({
      success: false,
      error: 'An error occurred during registration',
      details: error.message
    }, { status: 500 });
  }
}
