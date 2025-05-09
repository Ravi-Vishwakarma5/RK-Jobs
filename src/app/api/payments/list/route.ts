import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import SimplePaymentModel from '@/app/uitlis/model/simple-payment';

// This endpoint retrieves all payments from MongoDB
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/payments/list');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-portal';
    
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    } else {
      console.log('Already connected to MongoDB');
    }
    
    // Get all payments
    console.log('Fetching payments...');
    const payments = await SimplePaymentModel.find().sort({ date: -1 });
    console.log(`Found ${payments.length} payments`);
    
    // Return payments
    return NextResponse.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({
      error: 'Failed to fetch payments',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
