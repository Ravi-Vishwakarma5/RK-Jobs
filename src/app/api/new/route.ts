import { NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import JobModel from '@/app/uitlis/model/job';

export async function POST(request: Request) {
  console.log('POST request received at /api/new');

  try {
    // Connect to the database
    try {
      console.log('Attempting to connect to MongoDB...');
      const mongoose = await connectDB();
      console.log('MongoDB connection successful');

      // Check if the connection is actually established
      if (!mongoose.connection.readyState) {
        throw new Error('MongoDB connection not established');
      }
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return new NextResponse(
        JSON.stringify({
          message: 'Database connection failed',
          error: dbError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

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

    // Validate array fields
    console.log('Validating array fields...');
    const missingArrays = [];
    if (!description || !Array.isArray(description) || description.length === 0) missingArrays.push('description');
    if (!requirements || !Array.isArray(requirements) || requirements.length === 0) missingArrays.push('requirements');
    if (!responsibilities || !Array.isArray(responsibilities) || responsibilities.length === 0) missingArrays.push('responsibilities');
    if (!benefits || !Array.isArray(benefits) || benefits.length === 0) missingArrays.push('benefits');

    if (missingArrays.length > 0) {
      console.error('Missing or invalid array fields:', missingArrays);
      return new NextResponse(
        JSON.stringify({
          message: 'Missing or invalid array fields',
          error: `The following array fields are required and must not be empty: ${missingArrays.join(', ')}`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Ensure arrays are properly formatted
    console.log('Formatting arrays...');
    const ensureArray = (field: any) => Array.isArray(field) ? field.filter(Boolean) : [field].filter(Boolean);

    // Create a new job listing
    console.log('Creating new job model...');
    try {
      const newJob = new JobModel({
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        jobType: jobType.trim(),
        salary: salary.trim(),
        logo: logo ? logo.trim() : '',
        description: ensureArray(description),
        requirements: ensureArray(requirements),
        responsibilities: ensureArray(responsibilities),
        benefits: ensureArray(benefits),
      });

      // Validate the model before saving
      const validationError = newJob.validateSync();
      if (validationError) {
        console.error('Validation error:', validationError);
        return new NextResponse(
          JSON.stringify({
            message: 'Validation error',
            error: validationError.message,
            details: validationError.errors
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Save the job listing to the database
      console.log('Saving job to database...');
      await newJob.save();
      console.log('Job saved successfully with ID:', newJob._id);

      return new NextResponse(
        JSON.stringify({
          message: 'Job created successfully',
          job: newJob
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (modelError: any) {
      console.error('Model creation or save error:', modelError);
      return new NextResponse(
        JSON.stringify({
          message: 'Error creating or saving job',
          error: modelError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in job creation:', error);
    return new NextResponse(
      JSON.stringify({
        message: 'Error creating job',
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Get All Jobs


export async function GET() {
  console.log('GET request received at /api/new');

  try {
    // Connect to the database
    try {
      console.log('Attempting to connect to MongoDB...');
      const mongoose = await connectDB();
      console.log('MongoDB connection successful');

      // Check if the connection is actually established
      if (!mongoose.connection.readyState) {
        throw new Error('MongoDB connection not established');
      }
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      // Return empty jobs array instead of error
      return new NextResponse(
        JSON.stringify({
          jobs: [],
          message: 'Database connection failed, returning empty jobs array',
          error: dbError.message
        }),
        {
          status: 200, // Still return 200 to avoid breaking the UI
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      console.log('Fetching jobs from database...');
      const jobs = await JobModel.find().sort({ createdAt: -1 }); // Fetch all jobs, latest first
      console.log(`Found ${jobs.length} jobs`);

      return new NextResponse(
        JSON.stringify({
          jobs,
          count: jobs.length
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (fetchError: any) {
      console.error('Error fetching jobs:', fetchError);
      // Return empty jobs array instead of error
      return new NextResponse(
        JSON.stringify({
          jobs: [],
          message: 'Error fetching jobs, returning empty jobs array',
          error: fetchError.message
        }),
        {
          status: 200, // Still return 200 to avoid breaking the UI
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in job fetching:', error);
    // Return empty jobs array instead of error
    return new NextResponse(
      JSON.stringify({
        jobs: [],
        message: 'Unexpected error, returning empty jobs array',
        error: error.message
      }),
      {
        status: 200, // Still return 200 to avoid breaking the UI
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}