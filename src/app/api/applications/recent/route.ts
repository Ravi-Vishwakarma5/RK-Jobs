import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import ApplicationModel from '@/app/uitlis/model/application';
import JobModel from '@/app/uitlis/model/job';
import { verifyToken } from '@/app/uitlis/jwt';
import { jobApplications } from '@/data/applications';
import { jobPosts } from '@/data/jobPosts';

export async function GET(request: NextRequest) {
  console.log('GET request received at /api/applications/recent');

  try {
    // Check for authentication (optional)
    const authHeader = request.headers.get('authorization');
    let isAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        isAdmin = decoded?.isAdmin === true;

        // Only admins can access this endpoint
        if (!isAdmin) {
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
    } else {
      // For demo purposes, allow access without token
      console.log('No auth token provided, using mock data');

      // Return mock data
      const recentApplications = jobApplications.slice(0, 5).map(app => {
        const job = jobPosts.find(j => j.id === app.jobId);
        return {
          ...app,
          jobTitle: job?.title || 'Unknown Job',
          company: job?.company || 'Unknown Company',
        };
      });

      return NextResponse.json({
        success: true,
        applications: recentApplications,
        source: 'mock'
      });
    }

    try {
      // Connect to MongoDB
      await connectDB();

      // Get recent applications from database
      const applications = await ApplicationModel.find()
        .sort({ appliedDate: -1 })
        .limit(5)
        .lean();

      if (!applications || applications.length === 0) {
        console.log('No applications found in database, using mock data');

        // Return mock data if no applications found
        const recentApplications = jobApplications.slice(0, 5).map(app => {
          const job = jobPosts.find(j => j.id === app.jobId);
          return {
            ...app,
            jobTitle: job?.title || 'Unknown Job',
            company: job?.company || 'Unknown Company',
          };
        });

        return NextResponse.json({
          success: true,
          applications: recentApplications,
          source: 'mock'
        });
      }

      // Enrich with job data
      const enrichedApplications = await Promise.all(applications.map(async (app) => {
        try {
          // Try to find the job by ID
          const job = await JobModel.findById(app.jobId).lean();

          if (job) {
            return {
              id: app._id.toString(),
              jobId: app.jobId,
              fullName: app.fullName,
              email: app.email,
              phone: app.phone,
              status: app.status,
              appliedDate: app.appliedDate,
              jobTitle: job.title,
              company: job.company,
              location: job.location
            };
          } else {
            // If job not found, try to find by string ID
            const jobByStringId = await JobModel.findOne({ _id: app.jobId }).lean();

            if (jobByStringId) {
              return {
                id: app._id.toString(),
                jobId: app.jobId,
                fullName: app.fullName,
                email: app.email,
                phone: app.phone,
                status: app.status,
                appliedDate: app.appliedDate,
                jobTitle: jobByStringId.title,
                company: jobByStringId.company,
                location: jobByStringId.location
              };
            } else {
              // If still not found, return with unknown job
              return {
                id: app._id.toString(),
                jobId: app.jobId,
                fullName: app.fullName,
                email: app.email,
                phone: app.phone,
                status: app.status,
                appliedDate: app.appliedDate,
                jobTitle: 'Unknown Job',
                company: 'Unknown Company',
                location: 'Unknown Location'
              };
            }
          }
        } catch (error) {
          console.error('Error enriching application with job data:', error);
          return {
            id: app._id.toString(),
            jobId: app.jobId,
            fullName: app.fullName,
            email: app.email,
            phone: app.phone,
            status: app.status,
            appliedDate: app.appliedDate,
            jobTitle: 'Unknown Job',
            company: 'Unknown Company',
            location: 'Unknown Location'
          };
        }
      }));

      return NextResponse.json({
        success: true,
        applications: enrichedApplications,
        source: 'database'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);

      // Fallback to mock data
      const recentApplications = jobApplications.slice(0, 5).map(app => {
        const job = jobPosts.find(j => j.id === app.jobId);
        return {
          ...app,
          jobTitle: job?.title || 'Unknown Job',
          company: job?.company || 'Unknown Company',
        };
      });

      return NextResponse.json({
        success: true,
        applications: recentApplications,
        source: 'mock'
      });
    }
  } catch (error: any) {
    console.error('Error getting recent applications:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get recent applications',
      details: error.message
    }, { status: 500 });
  }
}
