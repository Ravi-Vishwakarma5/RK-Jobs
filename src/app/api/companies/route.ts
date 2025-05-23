import { NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import CompanyModel from '@/app/uitlis/model/company';

// Create a new company
export async function POST(request: Request) {
  console.log('POST request received at /api/companies');

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
      name,
      description,
      logo,
      website,
      industry,
      location,
      size,
      founded
    } = body;

    // Validate required fields
    console.log('Validating required fields...');
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!description) missingFields.push('description');
    // Logo is optional
    if (!industry) missingFields.push('industry');
    if (!location) missingFields.push('location');

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

    // Create a new company
    console.log('Creating new company model...');
    try {
      const newCompany = new CompanyModel({
        name: name.trim(),
        description: description.trim(),
        logo: logo.trim(),
        website: website ? website.trim() : '',
        industry: industry.trim(),
        location: location.trim(),
        size: size ? size.trim() : '',
        founded: founded || null,
      });

      // Validate the model before saving
      const validationError = newCompany.validateSync();
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

      // Save the company to the database
      console.log('Saving company to database...');
      await newCompany.save();
      console.log('Company saved successfully with ID:', newCompany._id);

      return new NextResponse(
        JSON.stringify({
          message: 'Company created successfully',
          company: newCompany
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
          message: 'Error creating or saving company',
          error: modelError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in company creation:', error);
    return new NextResponse(
      JSON.stringify({
        message: 'Error creating company',
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Get all companies or search by name
export async function GET(request: Request) {
  console.log('GET request received at /api/companies');

  try {
    // Get search parameters
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    console.log('Search parameter:', search);

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
      // Return empty companies array instead of error
      return new NextResponse(
        JSON.stringify({
          companies: [],
          message: 'Database connection failed, returning empty companies array',
          error: dbError.message
        }),
        {
          status: 200, // Still return 200 to avoid breaking the UI
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      console.log('Fetching companies from database...');

      // Build query based on search parameter
      let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { industry: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } }
          ]
        };
      }

      const companies = await CompanyModel.find(query).sort({ createdAt: -1 }); // Fetch companies, latest first
      console.log(`Found ${companies.length} companies`);

      return new NextResponse(
        JSON.stringify({
          companies,
          count: companies.length
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (fetchError: any) {
      console.error('Error fetching companies:', fetchError);
      // Return empty companies array instead of error
      return new NextResponse(
        JSON.stringify({
          companies: [],
          message: 'Error fetching companies, returning empty companies array',
          error: fetchError.message
        }),
        {
          status: 200, // Still return 200 to avoid breaking the UI
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in company fetching:', error);
    // Return empty companies array instead of error
    return new NextResponse(
      JSON.stringify({
        companies: [],
        message: 'Unexpected error, returning empty companies array',
        error: error.message
      }),
      {
        status: 200, // Still return 200 to avoid breaking the UI
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
