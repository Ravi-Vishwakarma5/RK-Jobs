import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// This endpoint directly saves a payment to MongoDB
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/direct-payment');
  
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError: any) {
      console.error('Request parsing error:', parseError);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid request format', 
          details: parseError.message 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Connect directly to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-portal';
    console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected directly to MongoDB');
    
    // Get database and collection
    const database = client.db();
    const collection = database.collection('direct_payments');
    
    // Create payment document
    const payment = {
      email: body.email || 'test@example.com',
      fullName: body.fullName || 'Test User',
      amount: body.amount || 699,
      currency: body.currency || 'INR',
      paymentId: body.paymentId || 'pay_' + Date.now(),
      orderId: body.orderId || 'order_' + Date.now(),
      status: 'success',
      createdAt: new Date()
    };
    
    // Insert payment
    const result = await collection.insertOne(payment);
    console.log('Payment saved directly to MongoDB:', result.insertedId);
    
    // Close connection
    await client.close();
    console.log('MongoDB connection closed');
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Payment saved successfully',
        paymentId: result.insertedId,
        payment
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error saving payment:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to save payment',
        details: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
