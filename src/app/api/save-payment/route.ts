import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// This is a simplified API endpoint to directly save payment details to MongoDB
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/save-payment');
  
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
    
    // Connect directly to MongoDB using MongoClient
    const uri = 'mongodb://127.0.0.1:27017';
    console.log(`Connecting to MongoDB at: ${uri}`);
    
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get database and collection
    const db = client.db('job-portal');
    const collection = db.collection('payments');
    
    // Create payment document
    const payment = {
      name,
      email,
      paymentId,
      amount: Number(amount),
      date: new Date(),
      status: 'success'
    };
    
    // Insert payment document
    const result = await collection.insertOne(payment);
    console.log('Payment saved to MongoDB:', result.insertedId);
    
    // Close connection
    await client.close();
    console.log('MongoDB connection closed');
    
    return NextResponse.json({
      success: true,
      message: 'Payment details saved successfully',
      paymentId: result.insertedId
    });
  } catch (error: any) {
    console.error('Error saving payment details:', error);
    return NextResponse.json({
      error: 'Failed to save payment details',
      details: error.message
    }, { status: 500 });
  }
}
