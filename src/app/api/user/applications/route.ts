import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import ApplicationModel from '@/app/uitlis/model/application';
import JobModel from '@/app/uitlis/model/job';
import { jobApplications } from '@/data/applications';
import { jobPosts } from '@/data/jobPosts';
import { isValidObjectId, convertMongoJobToFrontend } from '@/app/uitlis/helpers/jobConverter';

// This API endpoint fetches applications for the current user
// In a real app, you would get the user ID from the session
export async function GET(request: NextRequest) {
  console.log('GET request received at /api/user/applications');

  try {
    // In a real application, you would get the user ID from the session
    // const userId = session.user.id;
    // For now, we'll just return all applications

    try {
      // Try to fetch from MongoDB first
      console.log('Attempting to connect to MongoDB...');
      await connectDB();
      console.log('MongoDB connection successful');

      // Query applications from MongoDB
      const mongoApplications = await ApplicationModel.find().sort({ appliedDate: -1 });
      console.log(`Found ${mongoApplications.length} applications in MongoDB`);

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

      // For this example, we'll just return all applications with job details
      const applications = jobApplications.map(application => {
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
