import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/app/uitlis/model/mongodb';
import JobModel from '@/app/uitlis/model/job';
import { jobPosts } from '@/data/jobPosts'; // Import static job data for fallback
import { convertMongoJobToFrontend, isValidObjectId } from '@/app/uitlis/helpers/jobConverter';

// Get a single job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`GET request received at /api/jobs/${params.id}`);

  try {
    const jobId = params.id;
    console.log(`Looking for job with ID: ${jobId}`);

    // Check if this is a MongoDB ObjectId
    const isMongoId = isValidObjectId(jobId);
    console.log(`Is MongoDB ObjectId: ${isMongoId}`);

    // First check if the job exists in static data (only if not a MongoDB ID)
    if (!isMongoId) {
      const staticJob = jobPosts.find(job => job.id === jobId);

      if (staticJob) {
        console.log(`Job found in static data: ${staticJob.title}`);
        return new NextResponse(
          JSON.stringify({
            job: staticJob,
            source: 'static'
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // If not found in static data or is a MongoDB ID, try the database
    console.log('Checking database for job...');
    console.log('Attempting to connect to MongoDB...');

    try {
      const mongoose = await connectDB(); // Connect to MongoDB
      console.log('MongoDB connection successful');

      // Check if the connection is actually established
      if (!mongoose.connection.readyState) {
        throw new Error('MongoDB connection not established');
      }

      console.log(`Fetching job with ID: ${jobId} from database...`);

      let job;
      if (isMongoId) {
        // If it's a valid MongoDB ObjectId, use findById
        job = await JobModel.findById(jobId);
      } else {
        // Otherwise, try to find by other fields
        job = await JobModel.findOne({
          $or: [
            { id: jobId },
            { title: new RegExp(jobId, 'i') } // Try to match by title as fallback
          ]
        });
      }

      if (!job) {
        console.log('Job not found in database');
        return new NextResponse(
          JSON.stringify({
            error: 'Job not found',
            message: 'The job you are looking for does not exist or has been removed.',
            requestedId: jobId,
            isMongoId: isMongoId
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`Job found in database: ${job.title}`);

      // Convert MongoDB job to frontend format
      const frontendJob = convertMongoJobToFrontend(job);

      if (!frontendJob) {
        console.error('Failed to convert job to frontend format');
        return new NextResponse(
          JSON.stringify({
            error: 'Data conversion error',
            message: 'Failed to convert job data to the required format.',
            requestedId: jobId
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Converted job for frontend:', frontendJob.id);

      return new NextResponse(
        JSON.stringify({
          job: frontendJob,
          source: 'database',
          originalId: jobId
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError: any) {
      console.error('Database error:', dbError);

      // If not a MongoDB ID, try static data as fallback
      if (!isMongoId) {
        const staticJob = jobPosts.find(job => job.id === jobId);

        if (staticJob) {
          console.log('Returning static job data as fallback');
          return new NextResponse(
            JSON.stringify({
              job: staticJob,
              source: 'static',
              note: 'Database error occurred, using static data'
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // Otherwise, return an error
      return new NextResponse(
        JSON.stringify({
          error: 'Database error',
          message: 'An error occurred while fetching the job from the database.',
          details: dbError.message,
          requestedId: jobId,
          isMongoId: isMongoId
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
        error: 'Unexpected error',
        message: 'An unexpected error occurred while processing your request.',
        details: error.message,
        requestedId: params.id
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
        }
    );
  }
}
