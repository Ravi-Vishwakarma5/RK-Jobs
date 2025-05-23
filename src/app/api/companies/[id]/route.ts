import { NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import CompanyModel from '@/app/uitlis/model/company';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkzupc7jr',
  api_key: process.env.CLOUDINARY_API_KEY || '485433287949582',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'UE7vHfJ5-_0nd8FQZdNkOvAYMnY',
  secure: true,
});

// Get a single company by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`GET request received at /api/companies/${id}`);

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

    try {
      console.log(`Fetching company with ID: ${id}`);
      const company = await CompanyModel.findById(id);
      
      if (!company) {
        console.log(`Company with ID ${id} not found`);
        return new NextResponse(
          JSON.stringify({
            message: 'Company not found'
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Company found:', company.name);
      return new NextResponse(
        JSON.stringify({
          company
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (fetchError: any) {
      console.error('Error fetching company:', fetchError);
      return new NextResponse(
        JSON.stringify({
          message: 'Error fetching company',
          error: fetchError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new NextResponse(
      JSON.stringify({
        message: 'Unexpected error',
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Delete a company by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`DELETE request received at /api/companies/${id}`);

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

    try {
      // First, find the company to get the logo URL
      const company = await CompanyModel.findById(id);
      
      if (!company) {
        console.log(`Company with ID ${id} not found`);
        return new NextResponse(
          JSON.stringify({
            message: 'Company not found'
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Delete the company from the database
      console.log(`Deleting company with ID: ${id}`);
      const result = await CompanyModel.findByIdAndDelete(id);
      
      if (!result) {
        throw new Error('Failed to delete company');
      }

      // Try to delete the logo from Cloudinary if it exists
      if (company.logo && company.logo.includes('cloudinary')) {
        try {
          // Extract public_id from the URL
          // Example URL: https://res.cloudinary.com/demo/image/upload/v1631234567/job-portal/companies/abcdef123456
          const urlParts = company.logo.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const folderPath = urlParts[urlParts.length - 2];
          const publicId = `${folderPath}/${fileName}`;
          
          console.log(`Attempting to delete image with public_id: ${publicId}`);
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error('Error deleting image from Cloudinary:', cloudinaryError);
          // Continue with the response even if image deletion fails
        }
      }

      console.log('Company deleted successfully');
      return new NextResponse(
        JSON.stringify({
          message: 'Company deleted successfully'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (deleteError: any) {
      console.error('Error deleting company:', deleteError);
      return new NextResponse(
        JSON.stringify({
          message: 'Error deleting company',
          error: deleteError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new NextResponse(
      JSON.stringify({
        message: 'Unexpected error',
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
