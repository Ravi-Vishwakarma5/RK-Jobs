"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import JobCard, { JobPost } from '@/components/ui/JobCard';
import Button from '@/components/ui/Button';
import PageLoading from '@/components/ui/PageLoading';
import { jobPosts } from '@/data/jobPosts';

// Define the job interface based on the MongoDB model
interface MongoJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  salary: string;
  logo?: string;
  description: string[];
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  createdAt: string;
  updatedAt: string;
}

// Convert MongoDB job to JobCard format
const convertToJobCardFormat = (job: MongoJob): JobPost => {
  return {
    id: job._id,
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    type: job.jobType as 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship',
    description: Array.isArray(job.description) ? job.description.join(' ') : String(job.description || ''),
    postedDate: new Date(job.createdAt).toLocaleDateString(),
    logo: job.logo || '/company-logos/default.png',
    tags: job.requirements.slice(0, 4) // Use requirements as tags (limit to 4)
  };
};

export default function JobsPage() {
  const [dbJobs, setDbJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching jobs from API...');

        // Add a timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const response = await fetch('/api/jobs', {
            signal: controller.signal,
            cache: 'no-store' // Disable caching to always get fresh data
          });

          clearTimeout(timeoutId);

          console.log('API response status:', response.status);

          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }

          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Non-JSON response received:', contentType);
            throw new Error('Server returned non-JSON response');
          }

          const data = await response.json();
          console.log('Jobs data received:', data.jobs ? `${data.jobs.length} jobs` : 'No jobs array found');
          console.log('Data source:', data.source || 'unknown');

          if (data.jobs && Array.isArray(data.jobs)) {
            // Convert MongoDB jobs to JobCard format if they're from the database
            const formattedJobs = data.source === 'database'
              ? data.jobs.map(convertToJobCardFormat)
              : data.jobs; // Static data is already in the right format

            setDbJobs(formattedJobs);
            console.log('Jobs processed successfully:', formattedJobs.length);
          } else {
            console.warn('No jobs array in response or empty jobs array');
            // Still set empty array to show fallback data
            setDbJobs([]);
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);

          // Try fallback endpoints if the first one fails
          if (fetchError.name !== 'AbortError') {
            console.log('Primary endpoint failed, trying first fallback endpoint...');
            try {
              const fallbackResponse = await fetch('/api/new', {
                cache: 'no-store'
              });

              if (!fallbackResponse.ok) {
                throw new Error(`First fallback server returned ${fallbackResponse.status}`);
              }

              const fallbackData = await fallbackResponse.json();

              if (fallbackData.jobs && Array.isArray(fallbackData.jobs)) {
                const formattedJobs = fallbackData.jobs.map(convertToJobCardFormat);
                setDbJobs(formattedJobs);
                console.log('Jobs fetched from first fallback endpoint:', formattedJobs.length);
              } else {
                throw new Error('No jobs found in first fallback response');
              }
            } catch (fallbackError: any) {
              console.error('First fallback endpoint failed:', fallbackError);

              // Try the static test endpoint as a last resort
              console.log('Trying static test endpoint as last resort...');
              try {
                const testResponse = await fetch('/api/test-jobs', {
                  cache: 'no-store'
                });

                if (!testResponse.ok) {
                  throw new Error(`Test endpoint returned ${testResponse.status}`);
                }

                const testData = await testResponse.json();

                if (testData.jobs && Array.isArray(testData.jobs)) {
                  // Static data is already in the right format
                  setDbJobs(testData.jobs);
                  console.log('Jobs fetched from test endpoint:', testData.jobs.length);
                } else {
                  throw new Error('No jobs found in test endpoint response');
                }
              } catch (testError: any) {
                console.error('All endpoints failed:', testError);
                throw testError;
              }
            }
          } else {
            console.error('Request timed out');
            throw new Error('Request timed out. Please try again later.');
          }
        }
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError(`Failed to load jobs: ${err.message || 'Unknown error'}`);
        // Still set empty array to show fallback data
        setDbJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);
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
            <Link
              href="/admin/login"
              className="rounded-full bg-gray-600 text-white px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-blue-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Location"
                className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button variant="primary" size="lg">
                Search Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Job Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Job Type</h3>
                  <div className="space-y-2">
                    {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map((type) => (
                      <div key={type} className="flex items-center">
                        <input
                          id={`job-type-${type}`}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`job-type-${type}`} className="ml-2 text-sm text-gray-700">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h3>
                  <div className="space-y-2">
                    {['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'].map((level) => (
                      <div key={level} className="flex items-center">
                        <input
                          id={`exp-level-${level}`}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`exp-level-${level}`} className="ml-2 text-sm text-gray-700">
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Salary Range</h3>
                  <div className="space-y-2">
                    {['$0 - $50,000', '$50,000 - $100,000', '$100,000 - $150,000', '$150,000+'].map((range) => (
                      <div key={range} className="flex items-center">
                        <input
                          id={`salary-${range}`}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`salary-${range}`} className="ml-2 text-sm text-gray-700">
                          {range}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Button variant="outline" className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Job Listings */}
            <div className="w-full lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">All Jobs</h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                  <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Most Relevant</option>
                    <option>Newest</option>
                    <option>Salary: High to Low</option>
                    <option>Salary: Low to High</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <PageLoading message="Loading job listings..." />
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              ) : (
                <div className="space-y-6">
                  {dbJobs.length > 0 ? (
                    dbJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))
                  ) : (
                    // Fallback to static data if no jobs are fetched
                    jobPosts.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))
                  )}
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <nav className="flex items-center">
                  <Button variant="outline" size="sm" className="mr-2">
                    Previous
                  </Button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      className={`px-3 py-1 mx-1 rounded-md ${
                        page === 1
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <Button variant="outline" size="sm" className="ml-2">
                    Next
                  </Button>
                </nav>
              </div>
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
