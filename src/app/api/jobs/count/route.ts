import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import JobModel from '@/app/uitlis/model/job';
import { verifyToken } from '@/app/uitlis/jwt';
import { jobPosts } from '@/data/jobPosts';

export async function GET(request: NextRequest) {
  console.log('GET request received at /api/jobs/count');

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

      // Get job counts from database
      const totalJobs = await JobModel.countDocuments();

      // Get active jobs (all jobs are considered active for now)
      const activeJobs = totalJobs;

      // Get jobs by type
      const fullTimeJobs = await JobModel.countDocuments({ jobType: 'Full-time' });
      const partTimeJobs = await JobModel.countDocuments({ jobType: 'Part-time' });
      const remoteJobs = await JobModel.countDocuments({ jobType: { $regex: /remote/i } });
      const contractJobs = await JobModel.countDocuments({ jobType: 'Contract' });
      const internshipJobs = await JobModel.countDocuments({ jobType: 'Internship' });

      // Get recent jobs (last 7 days)
      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const recentJobs = await JobModel.countDocuments({ createdAt: { $gte: lastWeekDate } });

      return NextResponse.json({
        success: true,
        totalJobs,
        activeJobs,
        fullTimeJobs,
        partTimeJobs,
        remoteJobs,
        contractJobs,
        internshipJobs,
        recentJobs,
        isAdmin,
        source: 'database'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);

      // Fallback to mock data
      return NextResponse.json({
        success: true,
        totalJobs: jobPosts.length,
        activeJobs: jobPosts.filter(job => job.status === 'active').length,
        fullTimeJobs: jobPosts.filter(job => job.type === 'Full-time').length,
        partTimeJobs: jobPosts.filter(job => job.type === 'Part-time').length,
        remoteJobs: jobPosts.filter(job => job.type.includes('Remote')).length,
        contractJobs: jobPosts.filter(job => job.type === 'Contract').length,
        internshipJobs: jobPosts.filter(job => job.type === 'Internship').length,
        recentJobs: Math.floor(jobPosts.length * 0.2), // Assume 20% are recent
        isAdmin,
        source: 'mock'
      });
    }
  } catch (error: any) {
    console.error('Error getting job counts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get job counts',
      details: error.message
    }, { status: 500 });
  }
}
