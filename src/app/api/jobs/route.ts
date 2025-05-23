import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import JobModel from '@/app/uitlis/model/job';
import { verifyToken } from '@/app/uitlis/jwt';
import { jobPosts } from '@/data/jobPosts';

export async function GET(request: NextRequest) {
  console.log('GET request received at /api/jobs');

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

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search');
    const type = url.searchParams.get('type');
    const company = url.searchParams.get('company');

    // Build query
    const query: any = {};

    if (type && type !== 'all') {
      query.jobType = type;
    }

    // If company name is provided, filter by exact company name
    if (company) {
      query.company = { $regex: new RegExp(`^${company}$`, 'i') };
    }
    // Otherwise use search parameter if provided
    else if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    try {
      // Connect to MongoDB
      await connectDB();

      // Get total count for pagination
      const total = await JobModel.countDocuments(query);

      // Get jobs with pagination
      const jobs = await JobModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Format jobs for response
      const formattedJobs = jobs.map(job => ({
        id: job._id.toString(),
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.jobType,
        salary: job.salary,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        benefits: job.benefits,
        postedDate: job.createdAt,
        updatedDate: job.updatedAt
      }));

      return NextResponse.json({
        success: true,
        jobs: formattedJobs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);

      // Fallback to mock data
      const filteredJobs = jobPosts.filter(job => {
        // Filter by job type
        if (type && type !== 'all' && job.type !== type) {
          return false;
        }

        // Filter by company name (exact match, case-insensitive)
        if (company) {
          return job.company.toLowerCase() === company.toLowerCase();
        }

        // Filter by search term
        if (search) {
          const query = search.toLowerCase();
          return (
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.location.toLowerCase().includes(query)
          );
        }

        return true;
      });

      // Paginate mock data
      const paginatedJobs = filteredJobs.slice((page - 1) * limit, page * limit);

      return NextResponse.json({
        success: true,
        jobs: paginatedJobs,
        pagination: {
          total: filteredJobs.length,
          page,
          limit,
          pages: Math.ceil(filteredJobs.length / limit)
        },
        source: 'mock'
      });
    }
  } catch (error: any) {
    console.error('Error getting jobs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get jobs',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('POST request received at /api/jobs');

  try {
    // Check for authentication
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded || !decoded.isAdmin) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized access'
        }, { status: 403 });
      }
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'company', 'location', 'jobType', 'category', 'salary', 'description', 'requirements', 'responsibilities'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `${field} is required`
        }, { status: 400 });
      }
    }

    try {
      // Connect to MongoDB
      await connectDB();

      // Create new job
      const newJob = new JobModel({
        title: body.title,
        company: body.company,
        location: body.location,
        jobType: body.jobType,
        category: body.category,
        salary: body.salary,
        logo: body.logo || '',
        description: body.description,
        requirements: body.requirements,
        responsibilities: body.responsibilities,
        benefits: body.benefits || []
      });

      // Save job to database
      await newJob.save();

      return NextResponse.json({
        success: true,
        job: {
          id: newJob._id.toString(),
          title: newJob.title,
          company: newJob.company,
          location: newJob.location,
          type: newJob.jobType,
          salary: newJob.salary,
          description: newJob.description,
          requirements: newJob.requirements,
          responsibilities: newJob.responsibilities,
          benefits: newJob.benefits,
          postedDate: newJob.createdAt,
          updatedDate: newJob.updatedAt
        }
      }, { status: 201 });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      console.error('Error message:', dbError.message);
      console.error('Error stack:', dbError.stack);

      // Check if it's a validation error
      if (dbError.name === 'ValidationError') {
        const validationErrors: Record<string, string> = {};

        // Extract validation error messages
        for (const field in dbError.errors) {
          validationErrors[field] = dbError.errors[field].message;
        }

        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          validationErrors
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to create job',
        details: dbError.message || 'Unknown database error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create job',
      details: error.message
    }, { status: 500 });
  }
}
