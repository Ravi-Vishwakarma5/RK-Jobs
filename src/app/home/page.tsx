"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import JobCard, { JobPost } from "@/components/ui/JobCard";
import { jobPosts } from "@/data/jobPosts";
import Button from "@/components/ui/Button";
import PageLoading from "@/components/ui/PageLoading";
import CardLoader from "@/components/ui/CardLoader";
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

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
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter jobs based on search term, location, and category
  useEffect(() => {
    if (newJobs.length > 0) {
      let filtered = [...newJobs];

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(job =>
          (typeof job.title === 'string' ? job.title.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
          (typeof job.company === 'string' ? job.company.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
          (typeof job.description === 'string' ? job.description.toLowerCase().includes(searchTerm.toLowerCase()) : false)
        );
      }

      // Filter by location
      if (locationFilter) {
        filtered = filtered.filter(job =>
          typeof job.location === 'string' ? job.location.toLowerCase().includes(locationFilter.toLowerCase()) : false
        );
      }

      // Filter by category
      if (activeCategory !== 'All') {
        filtered = filtered.filter(job => {
          // Check if job has tags and if any tag matches the category
          if (job.tags && Array.isArray(job.tags) && job.tags.length > 0) {
            return job.tags.some(tag =>
              typeof tag === 'string' && tag.toLowerCase().includes(activeCategory.toLowerCase())
            );
          }
          // If no tags, check job title or type
          return (typeof job.title === 'string' && job.title.toLowerCase().includes(activeCategory.toLowerCase())) ||
                 (typeof job.type === 'string' && job.type.toLowerCase().includes(activeCategory.toLowerCase()));
        });
      }

      setFilteredJobs(filtered);
    } else {
      setFilteredJobs([]);
    }
  }, [newJobs, searchTerm, locationFilter, activeCategory]);

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
            setFilteredJobs(formattedJobs);
            console.log('Jobs processed successfully:', formattedJobs.length);
            console.log('Data source:', data.source || 'unknown');
          } else {
            console.warn('No jobs array in response or empty jobs array');
            // Still set empty array to show fallback data
            setNewJobs([]);
            setFilteredJobs([]);
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
                setFilteredJobs(formattedJobs);
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
                  setFilteredJobs(testData.jobs);
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
        setFilteredJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

         <Header />
      {/* Hero Section */}
      <section className="bg-blue-700 text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Find Your Dream Job Today</h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">Browse thousands of job listings and find the perfect match for your skills and experience.</p>

            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-lg">
              <div className="flex flex-col gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    // Scroll to job listings section
                    document.getElementById('job-listings')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Search Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section id="job-listings" className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Latest Job Postings</h2>
            <Link href="/jobs" className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base">
              View all jobs →
            </Link>
          </div>

          {/* Category filters */}
          <div className="mb-6 sm:mb-8 overflow-x-auto">
            <div className="flex space-x-2 pb-2 min-w-max">
              <Button
                variant={activeCategory === 'All' ? 'secondary' : 'outline'}
                size="sm"
                className="text-xs sm:text-sm whitespace-nowrap"
                onClick={() => setActiveCategory('All')}
              >
                All
              </Button>
              {['Technology', 'Design', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Remote'].map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? 'secondary' : 'outline'}
                  size="sm"
                  className="text-xs sm:text-sm whitespace-nowrap"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <CardLoader count={6} message="Loading job listings..." />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 sm:mb-6 text-sm">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              ) : searchTerm || locationFilter || activeCategory !== 'All' ? (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 py-6 sm:py-8 text-center">
                  <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">No jobs found matching your search criteria.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                    onClick={() => {
                      setSearchTerm('');
                      setLocationFilter('');
                      setActiveCategory('All');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : newJobs.length > 0 ? (
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

          <div className="mt-8 sm:mt-12 text-center">
            <Button
              variant="outline"
              size="md"
              className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
              isLoading={isLoading}
              loadingText="Loading Jobs..."
              onClick={() => {
                // Scroll to top of job listings
                document.getElementById('job-listings')?.scrollIntoView({ behavior: 'smooth' });

                // Clear filters to show all jobs
                setSearchTerm('');
                setLocationFilter('');
                setActiveCategory('All');
              }}
            >
              {searchTerm || locationFilter || activeCategory !== 'All'
                ? 'Clear Filters'
                : 'Load More Jobs'}
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 sm:py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">Browse Jobs by Category</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {['Technology', 'Design', 'Marketing', 'Sales', 'Customer Service', 'Finance', 'Healthcare', 'Education'].map((category) => (
              <div
                key={category}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setActiveCategory(category);
                  document.getElementById('job-listings')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2">{category}</h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {newJobs.filter(job =>
                    (typeof job.title === 'string' && job.title.toLowerCase().includes(category.toLowerCase())) ||
                    (job.tags && Array.isArray(job.tags) && job.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(category.toLowerCase())))
                  ).length || Math.floor(Math.random() * 100) + 20} jobs available
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
