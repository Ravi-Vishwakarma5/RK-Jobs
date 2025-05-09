import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// This endpoint tests MongoDB connection and saving
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/test-mongodb');
  
  try {
    // MongoDB connection string
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-portal';
    console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully!');
    
    // Define a simple test schema
    const testSchema = new mongoose.Schema({
      name: String,
      email: String,
      amount: Number,
      paymentId: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    // Create or get the model
    let TestModel;
    try {
      TestModel = mongoose.model('TestPayment');
    } catch (e) {
      TestModel = mongoose.model('TestPayment', testSchema);
    }
    
    // Create a test document
    const testDoc = new TestModel({
      name: 'Test User',
      email: 'test@example.com',
      amount: 699,
      paymentId: 'test_' + Date.now()
    });
    
    // Save the document
    const savedDoc = await testDoc.save();
    console.log('Document saved successfully!');
    
    // Find all documents
    const allDocs = await TestModel.find();
    console.log(`Total documents in collection: ${allDocs.length}`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'MongoDB test successful',
        savedDocument: savedDoc,
        totalDocuments: allDocs.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error testing MongoDB:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to test MongoDB',
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
