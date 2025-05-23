import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import ApplicationModel from '@/app/uitlis/model/application';
import { verifyToken } from '@/app/uitlis/jwt';
import { jobApplications } from '@/data/applications';

export async function GET(request: NextRequest) {
  console.log('GET request received at /api/applications/count');

  try {
    // Check for authentication (optional)
    const authHeader = request.headers.get('authorization');
    let isAdmin = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        isAdmin = decoded?.isAdmin === true;
      } catch (tokenError) {
        console.error('Token verification error:', tokenError);
        // Continue without admin privileges
      }
    }

    try {
      // Connect to MongoDB
      await connectDB();

      // Get application counts from database
      const totalApplications = await ApplicationModel.countDocuments();
      const pendingApplications = await ApplicationModel.countDocuments({ status: 'pending' });
      const reviewedApplications = await ApplicationModel.countDocuments({ status: 'reviewed' });
      const interviewApplications = await ApplicationModel.countDocuments({ status: 'interview' });
      const acceptedApplications = await ApplicationModel.countDocuments({ status: 'accepted' });
      const rejectedApplications = await ApplicationModel.countDocuments({ status: 'rejected' });

      // Get recent applications (last 7 days)
      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const recentApplications = await ApplicationModel.countDocuments({
        appliedDate: { $gte: lastWeekDate }
      });

      // Get applications by day for the last 7 days
      const applicationsByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = await ApplicationModel.countDocuments({
          appliedDate: { $gte: date, $lt: nextDate }
        });

        applicationsByDay.push({
          date: date.toISOString().split('T')[0],
          count
        });
      }

      return NextResponse.json({
        success: true,
        totalApplications,
        pendingApplications,
        reviewedApplications,
        interviewApplications,
        acceptedApplications,
        rejectedApplications,
        recentApplications,
        applicationsByDay,
        isAdmin,
        source: 'database'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);

      // Fallback to mock data
      const mockApplicationsByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Generate random count between 1 and 10
        const count = Math.floor(Math.random() * 10) + 1;

        mockApplicationsByDay.push({
          date: date.toISOString().split('T')[0],
          count
        });
      }

      return NextResponse.json({
        success: true,
        totalApplications: jobApplications.length,
        pendingApplications: jobApplications.filter(app => app.status === 'pending').length,
        reviewedApplications: jobApplications.filter(app => app.status === 'reviewed').length,
        interviewApplications: jobApplications.filter(app => app.status === 'interview').length,
        acceptedApplications: jobApplications.filter(app => app.status === 'accepted').length,
        rejectedApplications: jobApplications.filter(app => app.status === 'rejected').length,
        recentApplications: Math.floor(jobApplications.length * 0.3), // Assume 30% are recent
        applicationsByDay: mockApplicationsByDay,
        isAdmin,
        source: 'mock'
      });
    }
  } catch (error: any) {
    console.error('Error getting application counts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get application counts',
      details: error.message
    }, { status: 500 });
  }
}
