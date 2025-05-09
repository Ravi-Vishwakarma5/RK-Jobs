import { NextRequest, NextResponse } from 'next/server';

// Mock application data
interface MockApplication {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter?: string;
  appliedDate: string;
  status: 'pending';
}

// Test endpoint for application submission that always succeeds
export async function POST(request: NextRequest) {
  console.log('POST request received at /api/test-application');

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

    console.log('Processing test application for job:', body.jobId);

    // Log the entire request body for debugging
    console.log('Test API request body:', JSON.stringify(body, null, 2));

    // Add a default job ID if missing
    if (!body.jobId) {
      console.warn('jobId is missing, using default test job ID');
      body.jobId = 'test-job-1';
    }

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

    // Create a mock application
    const mockApplication: MockApplication = {
      id: `test-${Date.now()}`,
      jobId: body.jobId,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      resume: body.resume,
      coverLetter: body.coverLetter,
      appliedDate: new Date().toISOString(),
      status: 'pending'
    };

    console.log('Test application created successfully with ID:', mockApplication.id);

    // Simulate a delay to mimic database operation
    await new Promise(resolve => setTimeout(resolve, 500));

    return new NextResponse(
      JSON.stringify({
        success: true,
        application: mockApplication,
        message: 'This is a test application that is not saved to the database'
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Unexpected error in test application creation:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to create test application',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
