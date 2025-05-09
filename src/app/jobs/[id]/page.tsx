"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { jobPosts } from '@/data/jobPosts';
import ApplicationForm from '@/components/forms/ApplicationForm';
import PageLoading from '@/components/ui/PageLoading';
import { isValidObjectId } from '@/app/uitlis/helpers/jobConverter';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [job, setJob] = useState<typeof jobPosts[0] | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Log the job ID for debugging
  console.log('Job Detail Page - Job ID from params:', jobId);
  console.log('Job Detail Page - Full params:', params);

  // Load job data
  useEffect(() => {
    const loadJob = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching job with ID: ${jobId}`);

        // Check if this is a MongoDB ObjectId
        const isMongoId = isValidObjectId(jobId);
        console.log(`Is MongoDB ObjectId: ${isMongoId}`);

        // Try to fetch from main API first
        try {
          console.log(`Fetching from API: /api/jobs/${jobId}`);
          const response = await fetch(`/api/jobs/${jobId}`, {
            cache: 'no-store' // Disable caching to always get fresh data
          });

          console.log('API response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('Job data received:', data);

            if (data.job) {
              console.log(`Job found: ${data.job.title} (source: ${data.source})`);
              console.log('Job ID:', data.job.id);

              // Ensure the job has an ID
              if (!data.job.id) {
                console.warn('Job is missing ID, adding jobId from URL params');
                data.job.id = jobId;
              }

              // For MongoDB jobs, ensure all required fields are present
              if (isMongoId || data.source === 'database') {
                // Make sure the job has all the fields needed by the UI
                if (!data.job.tags && Array.isArray(data.job.requirements)) {
                  // Create tags from requirements if missing
                  data.job.tags = data.job.requirements.slice(0, 4).map((req: string) => {
                    // Extract first few words for tags
                    return req.split(' ').slice(0, 3).join(' ');
                  });
                }

                // Ensure description is a string
                if (Array.isArray(data.job.description)) {
                  data.job.description = data.job.description.join(' ');
                }
              }

              setJob(data.job);
              return; // Exit early if job is found
            }
          } else {
            console.error('API error:', response.status);
            // Continue to fallback
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError);
          // Continue to fallback
        }

        // Try the test API endpoint as a second fallback
        try {
          console.log('Trying test API endpoint...');
          const testResponse = await fetch(`/api/test-job/${jobId}`, {
            cache: 'no-store'
          });

          console.log('Test API response status:', testResponse.status);

          if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log('Test job data received:', testData);

            if (testData.job) {
              console.log(`Job found in test API: ${testData.job.title}`);
              console.log('Test job ID:', testData.job.id);

              // Ensure the job has an ID
              if (!testData.job.id) {
                console.warn('Test job is missing ID, adding jobId from URL params');
                testData.job.id = jobId;
              }

              setJob(testData.job);
              return; // Exit early if job is found
            }
          } else {
            console.error('Test API error:', testResponse.status);
            // Continue to final fallback
          }
        } catch (testApiError) {
          console.error('Test API fetch error:', testApiError);
          // Continue to final fallback
        }

        // Fallback to static data if API fails
        console.log('Falling back to static data');
        const foundJob = jobPosts.find(j => j.id === jobId);

        if (foundJob) {
          console.log(`Job found in static data: ${foundJob.title}`);
          console.log('Static job ID:', foundJob.id);

          // Ensure the job has an ID
          if (!foundJob.id) {
            console.warn('Static job is missing ID, adding jobId from URL params');
            foundJob.id = jobId;
          }

          setJob(foundJob);
        } else {
          console.error(`Job with ID ${jobId} not found in any data source`);

          // Create a minimal job object with the ID from the URL
          console.warn('Creating minimal job object with ID from URL');
          const minimalJob = {
            id: jobId,
            title: 'Job Details',
            company: 'Unknown Company',
            location: 'Unknown Location',
            description: 'No description available',
            postedDate: new Date().toLocaleDateString()
          };

          setJob(minimalJob as any);
        }
      } catch (error) {
        console.error('Error loading job:', error);
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  // Handle successful application submission
  const handleApplicationSuccess = (applicationId: string) => {
    setApplicationSubmitted(true);
    // Redirect to success page
    router.push(`/jobs/${jobId}/application-success?applicationId=${applicationId}`);
  };

  // Show loading state
  if (isLoading) {
    return <PageLoading message="Loading job details..." />;
  }

  // If job not found, show a message
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

      {/* Job Detail */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Job Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="mr-4">{job.company}</span>
                    <span className="mr-4">{job.location}</span>
                    {job.type && <span className="mr-4">{job.type}</span>}
                    {job.salary && <span>{job.salary}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.tags && job.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {job.logo && (
                  <div className="ml-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                      <Image src={job.logo} alt={`${job.company} logo`} className="max-w-full max-h-full" width={80} height={80} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Actions */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  onClick={() => setShowApplicationForm(!showApplicationForm)}
                  isLoading={applicationSubmitted}
                  loadingText="Processing..."
                >
                  {showApplicationForm ? 'Hide Application Form' : 'Apply Now'}
                </Button>
                <Button variant="outline">Save Job</Button>
                <Button variant="outline">Share</Button>
              </div>
            </div>

            {/* Job Description */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 mb-6">{job.description}</p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-2">
                <li>5+ years of experience in frontend development</li>
                <li>Strong proficiency in JavaScript, HTML, and CSS</li>
                <li>Experience with React and modern frontend frameworks</li>
                <li>Understanding of responsive design principles</li>
                <li>Knowledge of version control systems (Git)</li>
                <li>Excellent problem-solving skills</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
              <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-2">
                <li>Develop and maintain user interfaces for web applications</li>
                <li>Collaborate with designers to implement visual elements</li>
                <li>Ensure cross-browser compatibility and responsive design</li>
                <li>Optimize applications for maximum speed and scalability</li>
                <li>Participate in code reviews and team discussions</li>
                <li>Stay up-to-date with emerging trends and technologies</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
              <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-2">
                <li>Competitive salary and equity options</li>
                <li>Health, dental, and vision insurance</li>
                <li>Flexible work hours and remote work options</li>
                <li>Professional development budget</li>
                <li>Paid time off and parental leave</li>
                <li>Modern office with snacks and beverages</li>
              </ul>
            </div>

            {/* Application Form */}
            {showApplicationForm && (
              <div className="p-6 bg-blue-50 border-t border-blue-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for this position</h2>
                <p className="text-gray-700 mb-6">
                  Please fill out the form below to apply for this position.
                </p>
                <ApplicationForm job={job} onSuccess={handleApplicationSuccess} />
              </div>
            )}

            {/* Apply Section - shown only when form is hidden */}
            {!showApplicationForm && (
              <div className="p-6 bg-blue-50 border-t border-blue-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for this position</h2>
                <p className="text-gray-700 mb-6">
                  Ready to apply for this position? Click the button below to submit your application.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowApplicationForm(true)}
                  isLoading={applicationSubmitted}
                  loadingText="Processing..."
                >
                  Apply Now
                </Button>
              </div>
            )}
          </div>

          {/* Similar Jobs */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Similar Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobPosts
                .filter(j => j.id !== job.id)
                .slice(0, 2)
                .map(similarJob => (
                  <div key={similarJob.id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{similarJob.title}</h3>
                    <p className="text-gray-600 mb-2">{similarJob.company}</p>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <span className="mr-3">{similarJob.location}</span>
                      {similarJob.type && <span>{similarJob.type}</span>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log(`Navigating to similar job: /jobs/${similarJob.id}`);
                        window.location.href = `/jobs/${similarJob.id}`;
                      }}
                    >
                      View Job
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Job Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
