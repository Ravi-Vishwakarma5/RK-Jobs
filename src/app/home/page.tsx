"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import JobCard, { JobPost } from "@/components/ui/JobCard";
import { jobPosts } from "@/data/jobPosts";
import Button from "@/components/ui/Button";
import PageLoading from "@/components/ui/PageLoading";

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

export default function Home() {
  const [newJobs, setNewJobs] = useState<JobPost[]>([]);
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

          if (data.jobs && Array.isArray(data.jobs)) {
            // Convert MongoDB jobs to JobCard format if they're from the database
            const formattedJobs = data.source === 'database'
              ? data.jobs.map(convertToJobCardFormat)
              : data.jobs; // Static data is already in the right format

            setNewJobs(formattedJobs);
            console.log('Jobs processed successfully:', formattedJobs.length);
            console.log('Data source:', data.source || 'unknown');
          } else {
            console.warn('No jobs array in response or empty jobs array');
            // Still set empty array to show fallback data
            setNewJobs([]);
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
                setNewJobs(formattedJobs);
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
                  setNewJobs(testData.jobs);
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
        setNewJobs([]);
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
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Job Portal Logo"
              width={120}
              height={30}
              priority
            />
            <nav className="ml-10 space-x-8 hidden md:flex">
              <Link href="/" className="text-blue-600 font-medium">Home</Link>
              <Link href="/jobs" className="text-gray-500 hover:text-gray-900">Browse Jobs</Link>
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

      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Find Your Dream Job Today</h1>
            <p className="text-xl mb-8">Browse thousands of job listings and find the perfect match for your skills and experience.</p>

            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <Button variant="primary" size="lg">
                  Search Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Latest Job Postings</h2>
            <Link href="/jobs" className="text-blue-600 hover:text-blue-800 font-medium">
              View all jobs →
            </Link>
          </div>

          {isLoading ? (
            <PageLoading message="Loading job listings..." />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newJobs.length > 0 ? (
                newJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              ) : (
                // Fallback to static data if no jobs are fetched
                jobPosts.slice(0, 6).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              )}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button
              variant="outline"
              size="lg"
              isLoading={isLoading}
              loadingText="Loading Jobs..."
            >
              Load More Jobs
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse Jobs by Category</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {['Technology', 'Design', 'Marketing', 'Sales', 'Customer Service', 'Finance', 'Healthcare', 'Education'].map((category) => (
              <div key={category} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <h3 className="font-medium text-lg mb-2">{category}</h3>
                <p className="text-gray-500 text-sm">{Math.floor(Math.random() * 100) + 20} jobs available</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Job Portal</h3>
              <p className="text-gray-400">Find your dream job or hire the perfect candidate with our comprehensive job portal.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">Browse Jobs</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Create Resume</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Job Alerts</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Career Advice</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white">Post a Job</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Browse Resumes</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Recruiting Solutions</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Pricing Plans</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: info@jobportal.com</li>
                <li className="text-gray-400">Phone: (123) 456-7890</li>
                <li className="text-gray-400">Address: 123 Main St, City, Country</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 Job Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
