import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// This endpoint checks if MongoDB is running and accessible
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/check-db');

  try {
    // Connection URL
    const url = 'mongodb://127.0.0.1:27017';
    console.log(`Attempting to connect to MongoDB at: ${url}`);

    const client = new MongoClient(url);
    await client.connect();
    console.log('Successfully connected to MongoDB!');

    // Get the list of databases
    const adminDb = client.db('admin');
    const result = await adminDb.command({ listDatabases: 1 });

    const databases = result.databases.map((db: any) => db.name);
    console.log('Available databases:', databases);

    // Check if job-portal database exists
    const jobPortalExists = databases.includes('job-portal');

    let collections: string[] = [];
    let testInsert = null;

    if (jobPortalExists) {
      // Check collections in job-portal database
      const db = client.db('job-portal');
      const collectionsResult = await db.listCollections().toArray();
      collections = collectionsResult.map(col => col.name);

      // Insert a test document
      const paymentsCollection = db.collection('payments');
      const testPayment = {
        name: 'API Test User',
        email: 'apitest@example.com',
        paymentId: 'api_test_' + Date.now(),
        amount: 699,
        date: new Date(),
        status: 'success'
      };

      const insertResult = await paymentsCollection.insertOne(testPayment);
      testInsert = {
        id: insertResult.insertedId,
        success: true
      };
    }

    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');

    return NextResponse.json({
      success: true,
      message: 'MongoDB is running and accessible',
      databases,
      jobPortalExists,
      collections,
      testInsert
    });
  } catch (error: any) {
    console.error('Error connecting to MongoDB:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to MongoDB',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
