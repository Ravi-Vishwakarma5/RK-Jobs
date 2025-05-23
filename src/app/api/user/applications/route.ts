import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import ApplicationModel from '@/app/uitlis/model/application';
import JobModel from '@/app/uitlis/model/job';
import { jobApplications } from '@/data/applications';
import { jobPosts } from '@/data/jobPosts';
import { isValidObjectId, convertMongoJobToFrontend } from '@/app/uitlis/helpers/jobConverter';
import { verifyToken } from '@/app/uitlis/jwt';

// This API endpoint fetches applications for the current user
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/user/applications');

  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract and verify the token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.email) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's email from the token
    const userEmail = decoded.email;
    console.log(`Fetching applications for user: ${userEmail}`);

    try {
      // Try to fetch from MongoDB first
      console.log('Attempting to connect to MongoDB...');
      await connectDB();
      console.log('MongoDB connection successful');

      // Query applications from MongoDB for the current user
      const mongoApplications = await ApplicationModel.find({ email: userEmail }).sort({ appliedDate: -1 });
      console.log(`Found ${mongoApplications.length} applications for user: ${userEmail}`);

      // Get all job IDs from applications
      const jobIds = [...new Set(mongoApplications.map(app => app.jobId))];
      console.log(`Found ${jobIds.length} unique job IDs`);

      // Fetch job details for each job ID
      const jobDetails = new Map();

      // First, try to get jobs from MongoDB
      for (const jobId of jobIds) {
        if (isValidObjectId(jobId)) {
          try {
            const job = await JobModel.findById(jobId);
            if (job) {
              const frontendJob = convertMongoJobToFrontend(job);
              if (frontendJob) {
                jobDetails.set(jobId, {
                  title: frontendJob.title || 'Unknown Title',
                  company: frontendJob.company || 'Unknown Company',
                  location: frontendJob.location || 'Unknown Location',
                  type: frontendJob.type || 'Unknown Type',
                  logo: frontendJob.logo || ''
                });
              }
              continue; // Skip to next job ID if found
            }
          } catch (err) {
            console.warn(`Error fetching job ${jobId} from MongoDB:`, err);
          }
        }

        // If not found in MongoDB, try static data
        const staticJob = jobPosts.find(j => j.id === jobId);
        if (staticJob) {
          jobDetails.set(jobId, {
            title: staticJob.title,
            company: staticJob.company,
            location: staticJob.location,
            type: staticJob.type,
            logo: staticJob.logo
          });
        } else {
          // If not found anywhere, use placeholder
          jobDetails.set(jobId, {
            title: 'Unknown Job',
            company: 'Unknown Company',
            location: 'Unknown Location',
            type: 'Unknown',
            logo: ''
          });
        }
      }

      // Format the applications for the response
      const formattedApplications = mongoApplications.map(app => {
        // Convert Mongoose document to plain object if needed
        const appObj = app.toObject ? app.toObject() : app;

        // Use type assertion to handle MongoDB document properties
        const applicationData = appObj as {
          _id: { toString: () => string };
          jobId: string;
          fullName: string;
          email: string;
          phone: string;
          resume: string;
          coverLetter?: string;
          appliedDate: Date | string;
          status: string;
        };

        return {
          id: applicationData._id.toString(),
          jobId: applicationData.jobId,
          fullName: applicationData.fullName,
          email: applicationData.email,
          phone: applicationData.phone,
          resume: applicationData.resume,
          coverLetter: applicationData.coverLetter,
          appliedDate: new Date(applicationData.appliedDate).toISOString(),
          status: applicationData.status as 'pending' | 'reviewed' | 'interview' | 'rejected' | 'accepted',
          job: jobDetails.get(applicationData.jobId) || null
        };
      });

      return NextResponse.json({
        applications: formattedApplications,
        source: 'mongodb'
      });
    } catch (dbError) {
      console.error('Error fetching from MongoDB:', dbError);

      // Fallback to in-memory store
      console.log('Falling back to in-memory store');

      // Filter applications by user email
      const userApplications = jobApplications.filter(app => app.email === userEmail);
      console.log(`Found ${userApplications.length} applications for user: ${userEmail} in memory`);

      // Add job details to each application
      const applications = userApplications.map(application => {
        const job = jobPosts.find(job => job.id === application.jobId);
        return {
          ...application,
          job: job ? {
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            logo: job.logo
          } : null
        };
      });

      return NextResponse.json({
        applications,
        source: 'memory',
        note: 'Using in-memory store due to database error'
      });
    }
  } catch (error: any) {
    console.error('Error fetching user applications:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch applications',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('POST request received at /api/user/applications');

  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract and verify the token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.email) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('Request body:', body);

    // Validate required fields
    if (!body.jobId) {
      return new NextResponse(
        JSON.stringify({ error: 'Job ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Connect to the database
    await connectDB();

    // Get job details if available
    let jobTitle = body.jobTitle || 'Unknown Position';
    let company = body.company || 'Unknown Company';
    let location = body.location || 'Unknown Location';

    if (isValidObjectId(body.jobId)) {
      try {
        const job = await JobModel.findById(body.jobId);
        if (job) {
          const frontendJob = convertMongoJobToFrontend(job);
          if (frontendJob) {
            jobTitle = frontendJob.title || jobTitle;
            company = frontendJob.company || company;
            location = frontendJob.location || location;
          }
        }
      } catch (err) {
        console.warn(`Error fetching job ${body.jobId} from MongoDB:`, err);
      }
    }

    // Create a new application
    const application = new ApplicationModel({
      jobId: body.jobId,
      jobTitle: jobTitle,
      company: company,
      location: location,
      email: decoded.email,
      fullName: body.fullName || decoded.name || 'Anonymous User',
      phone: body.phone || 'Not provided',
      resume: body.resume || 'Not provided',
      coverLetter: body.coverLetter || '',
      appliedDate: new Date(),
      status: 'applied'
    });

    // Save the application
    await application.save();
    console.log(`Application saved with ID: ${application._id}`);

    return new NextResponse(
      JSON.stringify({
        success: true,
        application: {
          id: application._id.toString(),
          jobId: application.jobId,
          jobTitle: application.jobTitle,
          company: application.company,
          location: application.location,
          appliedDate: application.appliedDate,
          status: application.status
        }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating application:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to create application',
        details: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
