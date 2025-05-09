"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { jobPosts } from '@/data/jobPosts';
import { isValidObjectId } from '@/app/uitlis/helpers/jobConverter';

export default function ApplicationSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = params.id as string;
  const applicationId = searchParams.get('applicationId');
  const testMode = searchParams.get('testMode') === 'true';

  const [job, setJob] = useState<typeof jobPosts[0] | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      console.log(`Loading job with ID: ${jobId}`);

      // Check if this is a MongoDB ObjectId
      const isMongoId = isValidObjectId(jobId);
      console.log(`Is MongoDB ObjectId: ${isMongoId}`);

      // Try to fetch from API first
      try {
        console.log(`Fetching from API: /api/jobs/${jobId}`);
        const response = await fetch(`/api/jobs/${jobId}`, {
          cache: 'no-store' // Disable caching to always get fresh data
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Job data received:', data);

          if (data.job) {
            console.log(`Job found: ${data.job.title} (source: ${data.source})`);
            setJob(data.job);
            return; // Exit early if job is found
          }
        }
      } catch (error) {
        console.error('Error fetching job from API:', error);
      }

      // Fallback to static data
      console.log('Falling back to static data');
      const foundJob = jobPosts.find(j => j.id === jobId);
      if (foundJob) {
        console.log(`Job found in static data: ${foundJob.title}`);
        setJob(foundJob);
      } else {
        console.error(`Job with ID ${jobId} not found in any data source`);
      }
    };

    loadJob();
  }, [jobId]);

  if (!job) {
    const isMongoId = isValidObjectId(jobId);

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>

          {/* Debug information */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-700 mb-2"><strong>Debug Info:</strong></p>
            <p className="text-sm text-gray-700 mb-1">Job ID: {jobId}</p>
            <p className="text-sm text-gray-700 mb-1">Is MongoDB ID: {isMongoId ? 'Yes' : 'No'}</p>
            <p className="text-sm text-gray-700 mb-1">Application ID: {applicationId || 'Not provided'}</p>

            {isMongoId ? (
              <>
                <p className="text-sm text-gray-700 mb-1">This appears to be a MongoDB ObjectId.</p>
                <p className="text-sm text-gray-700 mb-1">Possible issues:</p>
                <ul className="text-sm text-gray-700 list-disc pl-5 mb-1">
                  <li>The job may have been deleted from the database</li>
                  <li>There might be a database connection issue</li>
                  <li>The job ID might be incorrect</li>
                </ul>
              </>
            ) : (
              <p className="text-sm text-gray-700 mb-1">Available IDs in static data: 1-8</p>
            )}

            <p className="text-sm text-gray-700">Make sure you&apos;re using a valid job ID from the home page.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/home">
              <Button variant="primary">Go to Home Page</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline">Browse All Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image
                className="dark:invert"
                src="/next.svg"
                alt="Job Portal Logo"
                width={120}
                height={30}
                priority
              />
            </Link>
            <nav className="ml-10 space-x-8 hidden md:flex">
              <Link href="/" className="text-gray-500 hover:text-gray-900">Home</Link>
              <Link href="/jobs" className="text-blue-600 font-medium">Browse Jobs</Link>
              <Link href="/companies" className="text-gray-500 hover:text-gray-900">Companies</Link>
              <Link href="/about" className="text-gray-500 hover:text-gray-900">About</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/user"
              className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              User Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Success Content */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>

            <p className="text-lg text-gray-700 mb-6">
              Thank you for applying to <span className="font-semibold">{job.title}</span> at <span className="font-semibold">{job.company}</span>.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-medium text-gray-900 mb-2">What happens next?</h2>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>Our team will review your application</li>
                <li>If your qualifications match our requirements, we&apos;ll contact you for an interview</li>
                <li>You can track the status of your application in your dashboard</li>
              </ol>
            </div>

            <div className="mb-8">
              <p className="text-sm text-gray-500">
                Application ID: {applicationId}
              </p>

              {testMode && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded text-sm text-yellow-700">
                  <p className="font-medium">Test Mode Application</p>
                  <p className="text-xs mt-1">This application was submitted in test mode and is not saved to a database.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/user/applications">
                <Button variant="primary">View My Applications</Button>
              </Link>
              <Link href="/jobs">
                <Button variant="outline">Browse More Jobs</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Job Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
