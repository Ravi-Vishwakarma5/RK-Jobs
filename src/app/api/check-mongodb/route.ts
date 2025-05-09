import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// This endpoint checks if MongoDB is running and accessible
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/check-mongodb');
  
  try {
    // MongoDB connection string
    const uri = process.env.MONGODB_URI || 'mongodb+srv://agraharishivam6388:nWdPqJrockPp5VzI@job-portal.c4i1dn9.mongodb.net/job-portal?retryWrites=true&w=majority&appName=job-portal';
    console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    
    // Get database info
    const adminDb = client.db('admin');
    const serverInfo = await adminDb.command({ serverStatus: 1 });
    
    // Get database list
    const databaseList = await client.db().admin().listDatabases();
    
    // Get collections in the job-portal database
    const db = client.db('job-portal');
    const collections = await db.listCollections().toArray();
    
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'MongoDB is running and accessible',
        version: serverInfo.version,
        uptime: serverInfo.uptime,
        databases: databaseList.databases.map(db => db.name),
        collections: collections.map(col => col.name)
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error checking MongoDB:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to connect to MongoDB',
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
