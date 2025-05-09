import { NextResponse } from 'next/server';
import { jobPosts } from '@/data/jobPosts'; // Import static job data

// Mock API endpoint for testing job creation without MongoDB
export async function POST(request: Request) {
  console.log('POST request received at /api/mock-job');
  
  try {
    // Parse request body
    let body;
    try {
      console.log('Parsing request body...');
      body = await request.json();
      console.log('Request body parsed successfully:', JSON.stringify(body).substring(0, 200) + '...');
    } catch (parseError: any) {
      console.error('Request parsing error:', parseError);
      return new NextResponse(
        JSON.stringify({
          message: 'Invalid request format',
          error: parseError.message
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Extract fields from body
    console.log('Extracting fields from body...');
    const {
      title,
      company,
      location,
      jobType,
      salary,
      logo,
      description,
      requirements,
      responsibilities,
      benefits
    } = body;
    
    // Validate required fields
    console.log('Validating required fields...');
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!company) missingFields.push('company');
    if (!location) missingFields.push('location');
    if (!jobType) missingFields.push('jobType');
    if (!salary) missingFields.push('salary');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return new NextResponse(
        JSON.stringify({
          message: 'Missing required fields',
          error: `The following fields are required: ${missingFields.join(', ')}`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Create a mock job with an ID
    const mockJob = {
      _id: `mock_${Date.now()}`,
      title,
      company,
      location,
      jobType,
      salary,
      logo: logo || '',
      description: Array.isArray(description) ? description : [description].filter(Boolean),
      requirements: Array.isArray(requirements) ? requirements : [requirements].filter(Boolean),
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [responsibilities].filter(Boolean),
      benefits: Array.isArray(benefits) ? benefits : [benefits].filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Simulate a delay to mimic database operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return new NextResponse(
      JSON.stringify({
        message: 'Job created successfully (mock)',
        job: mockJob
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Unexpected error in mock job creation:', error);
    return new NextResponse(
      JSON.stringify({
        message: 'Error creating mock job',
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
