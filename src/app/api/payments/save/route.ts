import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import SimplePaymentModel from '@/app/uitlis/model/simple-payment';

// This endpoint saves payment details to MongoDB
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/payments/save');
  
  try {
    // Parse request body
    const body = await request.json();
    console.log('Request body:', body);
    
    // Extract payment details
    const { name, email, paymentId, amount } = body;
    
    // Validate required fields
    if (!name || !email || !paymentId || !amount) {
      console.error('Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields. Need name, email, paymentId, and amount.' 
      }, { status: 400 });
    }
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-portal';
    
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    } else {
      console.log('Already connected to MongoDB');
    }
    
    // Create payment document
    console.log('Creating payment document...');
    const payment = new SimplePaymentModel({
      name,
      email,
      paymentId,
      amount: Number(amount),
      date: new Date(),
      status: 'success'
    });
    
    // Save payment document
    console.log('Saving payment document...');
    const savedPayment = await payment.save();
    console.log('Payment saved to MongoDB:', savedPayment._id);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Payment details saved successfully',
      paymentId: savedPayment._id,
      payment: savedPayment
    });
  } catch (error: any) {
    console.error('Error saving payment details:', error);
    return NextResponse.json({
      error: 'Failed to save payment details',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
