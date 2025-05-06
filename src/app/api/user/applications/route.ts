import { NextResponse } from 'next/server';
import { jobApplications } from '@/data/applications';
import { jobPosts } from '@/data/jobPosts';

// This is a mock API endpoint that would normally fetch data from a database
// and would include authentication to ensure users can only see their own applications
export async function GET() {
  try {
    // In a real application, you would get the user ID from the session
    // and filter applications by user ID

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

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
