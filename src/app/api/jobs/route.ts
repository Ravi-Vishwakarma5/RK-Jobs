import { NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import JobModel from '@/app/uitlis/model/job';
import { jobPosts } from '@/data/jobPosts'; // Import static job data for fallback

// Get All Jobs
export async function GET() {
  console.log('GET request received at /api/jobs');
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectDB(); // Connect to MongoDB
    console.log('MongoDB connection successful');

    console.log('Fetching jobs from database...');
    const jobs = await JobModel.find().sort({ createdAt: -1 }); // Fetch all jobs, latest first
    console.log(`Found ${jobs.length} jobs in database`);

    // If no jobs found in database, use static data
    if (jobs.length === 0) {
      console.log('No jobs found in database, using static data');
      return new NextResponse(
        JSON.stringify({ 
          jobs: jobPosts,
          source: 'static'
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ 
        jobs,
        source: 'database'
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    
    // Return static data as fallback
    console.log('Error occurred, using static data as fallback');
    return new NextResponse(
      JSON.stringify({ 
        jobs: jobPosts,
        source: 'static',
        error: error.message
      }),
      { 
        status: 200, // Still return 200 with fallback data
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
