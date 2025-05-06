import { NextRequest, NextResponse } from 'next/server';
import { getApplicationById, updateApplicationStatus } from '@/data/applications';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const application = getApplicationById(id);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const updatedApplication = updateApplicationStatus(id, body.status);

    if (!updatedApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
