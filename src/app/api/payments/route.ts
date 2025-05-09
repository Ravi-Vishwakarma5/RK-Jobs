import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import PaymentModel from '@/app/uitlis/model/payment';

// This endpoint retrieves payment history
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/payments');
  
  try {
    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const email = url.searchParams.get('email');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    try {
      const mongoose = await connectDB();
      console.log('MongoDB connection state:', mongoose.connection.readyState);
      
      // Check if the connection is actually established
      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB connection not established');
      }
      
      console.log('MongoDB connected successfully');
    } catch (dbError: any) {
      console.error('MongoDB connection error:', dbError);
      throw new Error(`Failed to connect to MongoDB: ${dbError.message}`);
    }
    
    // Build query
    const query: any = { status: 'success' };
    if (userId) query.userId = userId;
    if (email) query.email = email;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await PaymentModel.countDocuments(query);
    
    // Get payments
    const payments = await PaymentModel.find(query)
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log(`Found ${payments.length} payments`);
    
    // Format payments for response
    const formattedPayments = payments.map(payment => ({
      id: payment._id,
      userId: payment.userId,
      email: payment.email,
      fullName: payment.fullName,
      amount: payment.amount,
      currency: payment.currency,
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      subscriptionId: payment.subscriptionId,
      paymentDate: payment.paymentDate,
      createdAt: payment.createdAt
    }));
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        payments: formattedPayments,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error retrieving payments:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to retrieve payments',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
