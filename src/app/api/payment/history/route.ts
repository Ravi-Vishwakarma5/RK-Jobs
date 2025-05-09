import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// This endpoint retrieves payment history
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/payment/history');
  
  try {
    // Get query parameters
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    
    // Connect directly to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-portal';
    console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected directly to MongoDB');
    
    // Get database and collection
    const database = client.db();
    const collection = database.collection('payments');
    
    // Build query
    const query: any = {};
    if (email) query.email = email;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await collection.countDocuments(query);
    
    // Get payments
    const payments = await collection.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    console.log(`Found ${payments.length} payments`);
    
    // Close connection
    await client.close();
    console.log('MongoDB connection closed');
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        payments,
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
    console.error('Error retrieving payment history:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to retrieve payment history',
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
