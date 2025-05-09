import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import ApplicationModel from '@/app/uitlis/model/application';
import JobModel from '@/app/uitlis/model/job';
import { addApplication, getApplicationsByJobId } from '@/data/applications'; // Keep for fallback

export async function POST(request: NextRequest) {
  console.log('POST request received at /api/applications');

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

    console.log('Processing application for job:', body.jobId);

    // Log the entire request body for debugging
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    const requiredFields = ['jobId', 'fullName', 'email', 'phone', 'resume'];
    const missingFields = [];

    for (const field of requiredFields) {
      if (!body[field]) {
        missingFields.push(field);
        console.error(`Missing required field: ${field}`);
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

    // Add a default job ID if missing
    if (!body.jobId) {
      console.warn('jobId is missing, using default job ID');
      body.jobId = 'default-job-1';
    }

    // Add the application to MongoDB
    try {
      console.log('Attempting to connect to MongoDB...');
      await connectDB();
      console.log('MongoDB connection successful');

      // Create a new application document
      const applicationData = {
        jobId: body.jobId,
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        resume: body.resume,
        coverLetter: body.coverLetter,
        appliedDate: new Date(),
        status: 'pending'
      };

      console.log('Creating new application in MongoDB:', applicationData);
      const mongoApplication = new ApplicationModel(applicationData);
      await mongoApplication.save();

      console.log('Application saved to MongoDB with ID:', mongoApplication._id);

      // Also save to in-memory store as fallback
      let inMemoryApplication;
      try {
        inMemoryApplication = addApplication({
          jobId: body.jobId,
          fullName: body.fullName,
          email: body.email,
          phone: body.phone,
          resume: body.resume,
          coverLetter: body.coverLetter
        });
        console.log('Application also saved to in-memory store with ID:', inMemoryApplication.id);
      } catch (memoryError) {
        console.warn('Failed to save to in-memory store, continuing with MongoDB only:', memoryError);
      }

      // Format the response
      const responseApplication = {
        id: (mongoApplication._id as any).toString(),
        jobId: mongoApplication.jobId,
        fullName: mongoApplication.fullName,
        email: mongoApplication.email,
        phone: mongoApplication.phone,
        resume: mongoApplication.resume,
        coverLetter: mongoApplication.coverLetter,
        appliedDate: mongoApplication.appliedDate.toISOString(),
        status: mongoApplication.status
      };

      return new NextResponse(
        JSON.stringify({
          success: true,
          application: responseApplication,
          source: 'mongodb'
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError: any) {
      console.error('Error saving application to MongoDB:', dbError);

      // Try fallback to in-memory store
      try {
        console.log('Attempting fallback to in-memory store');
        const fallbackApplication = addApplication({
          jobId: body.jobId,
          fullName: body.fullName,
          email: body.email,
          phone: body.phone,
          resume: body.resume,
          coverLetter: body.coverLetter
        });

        console.log('Application saved to in-memory store with ID:', fallbackApplication.id);

        return new NextResponse(
          JSON.stringify({
            success: true,
            application: fallbackApplication,
            source: 'memory',
            note: 'Saved to in-memory store due to database error'
          }),
          {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } catch (fallbackError: any) {
        console.error('Fallback also failed:', fallbackError);
        return new NextResponse(
          JSON.stringify({
            error: 'Error creating application',
            details: dbError.message,
            fallbackError: fallbackError.message
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
  } catch (error: any) {
    console.error('Unexpected error in application creation:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to create application',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('GET request received at /api/applications');

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      console.error('Missing jobId parameter');
      return new NextResponse(
        JSON.stringify({
          error: 'Job ID is required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Fetching applications for job: ${jobId}`);

    try {
      // Try to fetch from MongoDB first
      console.log('Attempting to connect to MongoDB...');
      await connectDB();
      console.log('MongoDB connection successful');

      // Query applications from MongoDB
      const mongoApplications = await ApplicationModel.find({ jobId }).sort({ appliedDate: -1 });
      console.log(`Found ${mongoApplications.length} applications in MongoDB`);

      // Format the applications for the response
      const formattedApplications = mongoApplications.map(app => ({
        id: (app._id as any).toString(),
        jobId: app.jobId,
        fullName: app.fullName,
        email: app.email,
        phone: app.phone,
        resume: app.resume,
        coverLetter: app.coverLetter,
        appliedDate: app.appliedDate.toISOString(),
        status: app.status
      }));

      return new NextResponse(
        JSON.stringify({
          applications: formattedApplications,
          source: 'mongodb'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      console.error('Error fetching from MongoDB:', dbError);

      // Fallback to in-memory store
      console.log('Falling back to in-memory store');
      const memoryApplications = getApplicationsByJobId(jobId);
      console.log(`Found ${memoryApplications.length} applications in memory`);

      return new NextResponse(
        JSON.stringify({
          applications: memoryApplications,
          source: 'memory',
          note: 'Using in-memory store due to database error'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to fetch applications',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
