import { NextRequest, NextResponse } from 'next/server';
import { addApplication, getApplicationsByJobId } from '@/data/applications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['jobId', 'fullName', 'email', 'phone', 'resume'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Add the application
    const newApplication = addApplication({
      jobId: body.jobId,
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      resume: body.resume,
      coverLetter: body.coverLetter
    });
    
    return NextResponse.json(
      { success: true, application: newApplication },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    const applications = getApplicationsByJobId(jobId);
    
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
