import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/uitlis/model/mongodb';
import { verifyToken } from '@/app/uitlis/jwt';

// Define the saved job schema
const savedJobSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  jobId: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// Create or get the model
let SavedJobModel: mongoose.Model<any>;
try {
  SavedJobModel = mongoose.model('SavedJob');
} catch (e) {
  SavedJobModel = mongoose.model('SavedJob', savedJobSchema);
}

// GET endpoint to retrieve saved jobs for a user
export async function GET(request: NextRequest) {
  try {
    // Get the token from the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to MongoDB
    await connectDB();

    // Find saved jobs for the user
    const savedJobs = await SavedJobModel.find({ userId: decoded.email })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ success: true, savedJobs });
  } catch (error: any) {
    console.error('Error retrieving saved jobs:', error);
    return NextResponse.json({
      error: 'Failed to retrieve saved jobs',
      details: error.message
    }, { status: 500 });
  }
}

// POST endpoint to save a job
export async function POST(request: NextRequest) {
  try {
    // Get the token from the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { jobId, title, company, location } = body;

    // Validate required fields
    if (!jobId || !title || !company) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Connect to MongoDB
    await connectDB();

    // Check if job is already saved
    const existingSavedJob = await SavedJobModel.findOne({
      userId: decoded.email,
      jobId
    });

    if (existingSavedJob) {
      return NextResponse.json({
        success: true,
        message: 'Job already saved',
        savedJob: existingSavedJob
      });
    }

    // Create new saved job
    const savedJob = new SavedJobModel({
      userId: decoded.email,
      jobId,
      title,
      company,
      location,
      date: new Date()
    });

    await savedJob.save();

    return NextResponse.json({
      success: true,
      message: 'Job saved successfully',
      savedJob
    });
  } catch (error: any) {
    console.error('Error saving job:', error);
    return NextResponse.json({
      error: 'Failed to save job',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE endpoint to remove a saved job
export async function DELETE(request: NextRequest) {
  try {
    // Get the token from the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get the job ID from the URL
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({
        error: 'Job ID is required'
      }, { status: 400 });
    }

    // Connect to MongoDB
    await connectDB();

    // Delete the saved job
    const result = await SavedJobModel.deleteOne({
      userId: decoded.email,
      jobId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Job not found or already removed'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Job removed from saved jobs'
    });
  } catch (error: any) {
    console.error('Error removing saved job:', error);
    return NextResponse.json({
      error: 'Failed to remove saved job',
      details: error.message
    }, { status: 500 });
  }
}
