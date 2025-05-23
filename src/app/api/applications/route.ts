import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import ApplicationModel from '@/app/uitlis/model/application';
import JobModel from '@/app/uitlis/model/job';
import { verifyToken } from '@/app/uitlis/jwt';
import { addApplication, getApplicationsByJobId, jobApplications } from '@/data/applications'; // Keep for fallback
import { jobPosts } from '@/data/jobPosts'; // Import for fallback

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
    // Check for authentication (optional)
    const authHeader = request.headers.get('authorization');
    let isAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        isAdmin = decoded?.isAdmin === true;
      } catch (tokenError) {
        console.error('Token verification error:', tokenError);
        // Continue without admin privileges
      }
    }

    // Get query parameters
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // If jobId is provided, get applications for that job
    if (jobId) {
      console.log(`Fetching applications for job: ${jobId}`);

      try {
        // Connect to MongoDB
        await connectDB();

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

        // Return the response with proper headers
        return new NextResponse(
          JSON.stringify({
            success: true,
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

        // Return the response with proper headers
        return new NextResponse(
          JSON.stringify({
            success: true,
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
    }

    // If no jobId, get all applications (admin only)
    if (isAdmin) {
      // Build query
      const query: any = {};

      if (status && status !== 'all') {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      try {
        // Connect to MongoDB
        await connectDB();

        // Get total count for pagination
        const total = await ApplicationModel.countDocuments(query);

        // Get applications with pagination
        const applications = await ApplicationModel.find(query)
          .sort({ appliedDate: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        // Enrich with job data
        console.log(`Found ${applications.length} applications, enriching with job data`);

        const enrichedApplications = await Promise.all(applications.map(async (app) => {
          try {
            if (!app || !app.jobId) {
              console.error('Invalid application object:', app);
              return {
                id: app?._id?.toString() || 'unknown-id',
                jobId: app?.jobId || 'unknown-job',
                fullName: app?.fullName || 'Unknown Name',
                email: app?.email || 'unknown@example.com',
                phone: app?.phone || 'Unknown',
                resume: app?.resume || 'No Resume',
                coverLetter: app?.coverLetter || '',
                status: app?.status || 'pending',
                appliedDate: app?.appliedDate || new Date(),
                notes: app?.notes || '',
                jobTitle: 'Unknown Job',
                company: 'Unknown Company',
                location: 'Unknown Location'
              };
            }

            // Try to find the job by ID
            let job;
            try {
              job = await JobModel.findById(app.jobId).lean();
            } catch (jobError) {
              console.error('Error finding job by ID:', jobError);
              // Try to find by string ID if ObjectId fails
              try {
                job = await JobModel.findOne({ _id: app.jobId.toString() }).lean();
              } catch (secondError) {
                console.error('Second attempt to find job failed:', secondError);
                // Try one more approach - find by string comparison
                job = await JobModel.find().lean().then(jobs =>
                  jobs.find(j => j._id.toString() === app.jobId.toString())
                );
              }
            }

            if (job) {
              return {
                id: app._id.toString(),
                jobId: app.jobId,
                fullName: app.fullName || 'Unknown Name',
                email: app.email || 'unknown@example.com',
                phone: app.phone || 'Unknown',
                resume: app.resume || 'No Resume',
                coverLetter: app.coverLetter || '',
                status: app.status || 'pending',
                appliedDate: app.appliedDate || new Date(),
                notes: app.notes || '',
                jobTitle: job.title || 'Unknown Title',
                company: job.company || 'Unknown Company',
                location: job.location || 'Unknown Location'
              };
            } else {
              console.log('Job not found for application:', app._id.toString(), 'jobId:', app.jobId);
              // If job not found, return with unknown job
              return {
                id: app._id.toString(),
                jobId: app.jobId,
                fullName: app.fullName || 'Unknown Name',
                email: app.email || 'unknown@example.com',
                phone: app.phone || 'Unknown',
                resume: app.resume || 'No Resume',
                coverLetter: app.coverLetter || '',
                status: app.status || 'pending',
                appliedDate: app.appliedDate || new Date(),
                notes: app.notes || '',
                jobTitle: 'Unknown Job',
                company: 'Unknown Company',
                location: 'Unknown Location'
              };
            }
          } catch (error) {
            console.error('Error enriching application with job data:', error);
            return {
              id: app?._id?.toString() || 'unknown-id',
              jobId: app?.jobId || 'unknown-job',
              fullName: app?.fullName || 'Unknown Name',
              email: app?.email || 'unknown@example.com',
              phone: app?.phone || 'Unknown',
              resume: app?.resume || 'No Resume',
              coverLetter: app?.coverLetter || '',
              status: app?.status || 'pending',
              appliedDate: app?.appliedDate || new Date(),
              notes: app?.notes || '',
              jobTitle: 'Unknown Job',
              company: 'Unknown Company',
              location: 'Unknown Location'
            };
          }
        }));

        // Ensure we're returning valid data
        const safeApplications = enrichedApplications.filter(app => app !== null && app !== undefined);

        console.log(`Returning ${safeApplications.length} applications after filtering out null/undefined values`);

        // Return the response with proper headers
        return new NextResponse(
          JSON.stringify({
            success: true,
            applications: safeApplications,
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
      } catch (dbError) {
        console.error('Database error:', dbError);

        // Fallback to mock data
        const mockApplications = jobApplications.map(app => {
          const job = jobPosts.find(j => j.id === app.jobId);
          return {
            ...app,
            jobTitle: job?.title || 'Unknown Job',
            company: job?.company || 'Unknown Company',
            location: job?.location || 'Unknown Location'
          };
        });

        // Filter mock data
        const filteredApplications = mockApplications.filter(app => {
          if (status && status !== 'all' && app.status !== status) {
            return false;
          }

          if (search) {
            const query = search.toLowerCase();
            return (
              app.fullName.toLowerCase().includes(query) ||
              app.email.toLowerCase().includes(query)
            );
          }

          return true;
        });

        // Paginate mock data
        const paginatedApplications = filteredApplications.slice((page - 1) * limit, page * limit);

        // Return the response with proper headers
        return new NextResponse(
          JSON.stringify({
            success: true,
            applications: paginatedApplications,
            pagination: {
              total: filteredApplications.length,
              page,
              limit,
              pages: Math.ceil(filteredApplications.length / limit)
            },
            source: 'mock'
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    } else {
      // Return unauthorized response
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Unauthorized access. Admin privileges required to view all applications.'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    // Return error response
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch applications',
        details: error.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Update application status
export async function PATCH(request: NextRequest) {
  console.log('PATCH request received at /api/applications');

  try {
    // Check for authentication
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded || !decoded.isAdmin) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized access'
        }, { status: 403 });
      }
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.id || !body.status) {
      return NextResponse.json({
        success: false,
        error: 'Application ID and status are required'
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'interview', 'accepted', 'rejected'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    try {
      // Connect to MongoDB
      await connectDB();

      // Find and update application
      const application = await ApplicationModel.findById(body.id);

      if (!application) {
        return NextResponse.json({
          success: false,
          error: 'Application not found'
        }, { status: 404 });
      }

      // Update status and notes
      application.status = body.status;
      if (body.notes) {
        application.notes = body.notes;
      }

      // Save changes
      await application.save();

      return NextResponse.json({
        success: true,
        application: {
          id: application._id.toString(),
          jobId: application.jobId,
          fullName: application.fullName,
          email: application.email,
          status: application.status,
          notes: application.notes,
          appliedDate: application.appliedDate
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update application',
        details: dbError
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error updating application:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update application',
      details: error.message
    }, { status: 500 });
  }
}
