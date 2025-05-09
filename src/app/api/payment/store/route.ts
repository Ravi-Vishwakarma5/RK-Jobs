import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// This endpoint stores payment details in MongoDB
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/payment/store');
  
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed successfully:', body);
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
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'paymentId', 'amount'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return new NextResponse(
        JSON.stringify({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
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
    const collection = database.collection('payments');
    
    // Create payment document
    const payment = {
      name: body.name,
      email: body.email,
      amount: body.amount,
      paymentId: body.paymentId,
      orderId: body.orderId || `order_${Date.now()}`,
      currency: body.currency || 'INR',
      status: 'success',
      paymentDate: new Date(),
      createdAt: new Date()
    };
    
    // Insert payment
    const result = await collection.insertOne(payment);
    console.log('Payment saved to MongoDB:', result.insertedId);
    
    // Close connection
    await client.close();
    console.log('MongoDB connection closed');
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Payment details stored successfully',
        paymentId: result.insertedId,
        payment
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error storing payment details:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to store payment details',
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
