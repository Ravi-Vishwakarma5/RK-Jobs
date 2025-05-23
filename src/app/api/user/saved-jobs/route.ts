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
  console.log('GET request received at /api/user/saved-jobs');

  try {
    // Get the token from the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Missing or invalid token'
      }, { status: 401 });
    }

    // Extract and verify the token
    const token = authHeader.split(' ')[1];
    console.log('Token received, verifying...');

    let decoded;
    try {
      decoded = verifyToken(token);
      console.log('Token verified successfully');
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Invalid token',
        details: tokenError instanceof Error ? tokenError.message : String(tokenError)
      }, { status: 401 });
    }

    if (!decoded || !decoded.email) {
      console.error('Token missing email claim');
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Invalid token format'
      }, { status: 401 });
    }

    // Connect to MongoDB
    try {
      console.log('Connecting to MongoDB...');
      await connectDB();
      console.log('MongoDB connection successful');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection error',
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500 });
    }

    // Find saved jobs for the user
    try {
      console.log(`Finding saved jobs for user: ${decoded.email}`);

      // First try with userId field
      let savedJobs = await SavedJobModel.find({ userId: decoded.email })
        .sort({ date: -1 })
        .lean();

      console.log(`Found ${savedJobs.length} saved jobs with userId field`);

      // If no jobs found, try with email field
      if (savedJobs.length === 0) {
        console.log('No jobs found with userId, trying with email field');
        savedJobs = await SavedJobModel.find({ email: decoded.email })
          .sort({ date: -1 })
          .lean();

        console.log(`Found ${savedJobs.length} saved jobs with email field`);
      }

      // Combine results if needed (in case we have jobs with both fields)
      if (savedJobs.length === 0) {
        console.log('Trying to find jobs with either userId or email field');
        savedJobs = await SavedJobModel.find({
          $or: [
            { userId: decoded.email },
            { email: decoded.email }
          ]
        })
          .sort({ date: -1 })
          .lean();

        console.log(`Found ${savedJobs.length} saved jobs with combined query`);
      }

      // Format the saved jobs for the response
      const formattedJobs = savedJobs.map(job => ({
        jobId: job.jobId,
        title: job.title || 'Unknown Position',
        company: job.company || 'Unknown Company',
        location: job.location || 'Unknown Location',
        date: job.date ? new Date(job.date).toISOString() : new Date().toISOString()
      }));

      return NextResponse.json({
        success: true,
        savedJobs: formattedJobs
      });
    } catch (queryError) {
      console.error('Error querying saved jobs:', queryError);
      return NextResponse.json({
        success: false,
        error: 'Failed to query saved jobs',
        details: queryError instanceof Error ? queryError.message : String(queryError)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error retrieving saved jobs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve saved jobs',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

// POST endpoint to save a job
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/user/saved-jobs');

  try {
    // Get the token from the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Missing or invalid token'
      }, { status: 401 });
    }

    // Extract and verify the token
    const token = authHeader.split(' ')[1];
    console.log('Token received, verifying...');

    let decoded;
    try {
      decoded = verifyToken(token);
      console.log('Token verified successfully');
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Invalid token',
        details: tokenError instanceof Error ? tokenError.message : String(tokenError)
      }, { status: 401 });
    }

    if (!decoded || !decoded.email) {
      console.error('Token missing email claim');
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Invalid token format'
      }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid request body',
        details: parseError instanceof Error ? parseError.message : String(parseError)
      }, { status: 400 });
    }

    const { jobId, title, company, location } = body;

    // Validate required fields
    if (!jobId) {
      console.error('Missing jobId in request');
      return NextResponse.json({
        success: false,
        error: 'Job ID is required'
      }, { status: 400 });
    }

    // Connect to MongoDB
    try {
      console.log('Connecting to MongoDB...');
      await connectDB();
      console.log('MongoDB connection successful');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection error',
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500 });
    }

    // Check if job is already saved (try both userId and email fields)
    try {
      console.log(`Checking if job ${jobId} is already saved for user ${decoded.email}`);

      let existingSavedJob = await SavedJobModel.findOne({
        userId: decoded.email,
        jobId
      });

      if (!existingSavedJob) {
        existingSavedJob = await SavedJobModel.findOne({
          email: decoded.email,
          jobId
        });
      }

      if (existingSavedJob) {
        console.log('Job already saved');
        return NextResponse.json({
          success: true,
          message: 'Job already saved',
          savedJob: {
            jobId: existingSavedJob.jobId,
            title: existingSavedJob.title,
            company: existingSavedJob.company,
            location: existingSavedJob.location,
            date: existingSavedJob.date ? new Date(existingSavedJob.date).toISOString() : new Date().toISOString()
          }
        });
      }

      // Create new saved job
      console.log('Creating new saved job');
      const savedJob = new SavedJobModel({
        userId: decoded.email,
        email: decoded.email, // Store both for compatibility
        jobId,
        title: title || 'Unknown Position',
        company: company || 'Unknown Company',
        location: location || 'Unknown Location',
        date: new Date()
      });

      await savedJob.save();
      console.log('Job saved successfully');

      return NextResponse.json({
        success: true,
        message: 'Job saved successfully',
        savedJob: {
          jobId: savedJob.jobId,
          title: savedJob.title,
          company: savedJob.company,
          location: savedJob.location,
          date: savedJob.date ? new Date(savedJob.date).toISOString() : new Date().toISOString()
        }
      });
    } catch (dbOperationError) {
      console.error('Error in database operation:', dbOperationError);
      return NextResponse.json({
        success: false,
        error: 'Failed to save job',
        details: dbOperationError instanceof Error ? dbOperationError.message : String(dbOperationError)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error saving job:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save job',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE endpoint to remove a saved job
export async function DELETE(request: NextRequest) {
  console.log('DELETE request received at /api/user/saved-jobs');

  try {
    // Get the token from the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Missing or invalid token'
      }, { status: 401 });
    }

    // Extract and verify the token
    const token = authHeader.split(' ')[1];
    console.log('Token received, verifying...');

    let decoded;
    try {
      decoded = verifyToken(token);
      console.log('Token verified successfully');
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Invalid token',
        details: tokenError instanceof Error ? tokenError.message : String(tokenError)
      }, { status: 401 });
    }

    if (!decoded || !decoded.email) {
      console.error('Token missing email claim');
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Invalid token format'
      }, { status: 401 });
    }

    // Try to get jobId from URL first
    const url = new URL(request.url);
    let jobId = url.searchParams.get('jobId');

    // If not in URL, try to get from request body
    if (!jobId) {
      try {
        const body = await request.json();
        console.log('Request body:', body);
        jobId = body.jobId;
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        // Continue with null jobId, will be checked below
      }
    }

    if (!jobId) {
      console.error('Missing jobId in request');
      return NextResponse.json({
        success: false,
        error: 'Job ID is required'
      }, { status: 400 });
    }

    // Connect to MongoDB
    try {
      console.log('Connecting to MongoDB...');
      await connectDB();
      console.log('MongoDB connection successful');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection error',
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500 });
    }

    // Delete the saved job
    try {
      console.log(`Removing saved job with ID ${jobId} for user ${decoded.email}`);

      // Try with userId field first
      let result = await SavedJobModel.deleteOne({
        userId: decoded.email,
        jobId
      });

      // If not found, try with email field
      if (result.deletedCount === 0) {
        console.log('Job not found with userId, trying with email field');
        result = await SavedJobModel.deleteOne({
          email: decoded.email,
          jobId
        });
      }

      if (result.deletedCount === 0) {
        console.log('Job not found or already removed');
        return NextResponse.json({
          success: false,
          message: 'Job not found or already removed'
        }, { status: 404 });
      }

      console.log('Job successfully removed from saved jobs');
      return NextResponse.json({
        success: true,
        message: 'Job removed from saved jobs'
      });
    } catch (deleteError) {
      console.error('Error deleting saved job:', deleteError);
      return NextResponse.json({
        success: false,
        error: 'Failed to remove saved job',
        details: deleteError instanceof Error ? deleteError.message : String(deleteError)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error removing saved job:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove saved job',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
