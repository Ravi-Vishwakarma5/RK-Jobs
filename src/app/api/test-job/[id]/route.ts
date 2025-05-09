import { NextRequest, NextResponse } from 'next/server';
import { jobPosts } from '@/data/jobPosts';

// Simple test endpoint that always returns static job data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`GET request received at /api/test-job/${params.id}`);
  
  // Find the job in static data
  const job = jobPosts.find(j => j.id === params.id);
  
  if (!job) {
    console.log(`Job with ID ${params.id} not found in static data`);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Job not found',
        message: 'The job you are looking for does not exist in static data.',
        availableIds: jobPosts.map(j => j.id)
      }),
      { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  console.log(`Job found: ${job.title}`);
  return new NextResponse(
    JSON.stringify({ 
      job,
      source: 'static-test',
      message: 'This is static test data that does not require MongoDB'
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
