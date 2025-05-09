import { NextResponse } from 'next/server';
import { jobPosts } from '@/data/jobPosts'; // Import static job data

// Simple test endpoint that always returns static job data
export async function GET() {
  console.log('GET request received at /api/test-jobs');
  
  return new NextResponse(
    JSON.stringify({ 
      jobs: jobPosts,
      source: 'static',
      message: 'This is static test data that does not require MongoDB'
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
