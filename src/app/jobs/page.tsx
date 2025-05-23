"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import JobCard, { JobPost } from '@/components/ui/JobCard';
import Button from '@/components/ui/Button';
import PageLoading from '@/components/ui/PageLoading';
import { jobPosts } from '@/data/jobPosts';
import Header from '@/components/ui/Header';

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
  const [filteredJobs, setFilteredJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<string[]>([]);
  const [salaryRanges, setSalaryRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevant');

  // Filter and sort jobs based on search, filters, and sort options
  useEffect(() => {
    if (dbJobs.length > 0) {
      let filtered = [...dbJobs];

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

      // Filter by job type
      if (jobTypes.length > 0) {
        filtered = filtered.filter(job =>
          job.type && jobTypes.includes(job.type)
        );
      }

      // Filter by experience level (assuming job title contains experience level)
      if (experienceLevels.length > 0) {
        filtered = filtered.filter(job =>
          typeof job.title === 'string' && experienceLevels.some(level =>
            level && job.title.toLowerCase().includes(level.toLowerCase())
          )
        );
      }

      // Filter by salary range
      if (salaryRanges.length > 0) {
        filtered = filtered.filter(job => {
          if (!job.salary || typeof job.salary !== 'string') return false;

          try {
            // Extract numeric salary value
            const salaryValue = parseInt(job.salary.replace(/[^0-9]/g, ''));

            if (isNaN(salaryValue)) return false;

            return salaryRanges.some(range => {
              if (range === '$0 - $50,000') return salaryValue <= 50000;
              if (range === '$50,000 - $100,000') return salaryValue > 50000 && salaryValue <= 100000;
              if (range === '$100,000 - $150,000') return salaryValue > 100000 && salaryValue <= 150000;
              if (range === '$150,000+') return salaryValue > 150000;
              return false;
            });
          } catch (error) {
            return false; // Handle any parsing errors
          }
        });
      }

      // Sort jobs
      if (sortBy === 'newest') {
        filtered.sort((a, b) => {
          try {
            const dateA = a.postedDate ? new Date(a.postedDate).getTime() : 0;
            const dateB = b.postedDate ? new Date(b.postedDate).getTime() : 0;
            return dateB - dateA;
          } catch (error) {
            return 0; // Handle any parsing errors
          }
        });
      } else if (sortBy === 'salary-high-low') {
        filtered.sort((a, b) => {
          try {
            const salaryA = typeof a.salary === 'string' ? parseInt(a.salary.replace(/[^0-9]/g, '')) : 0;
            const salaryB = typeof b.salary === 'string' ? parseInt(b.salary.replace(/[^0-9]/g, '')) : 0;
            return (isNaN(salaryB) ? 0 : salaryB) - (isNaN(salaryA) ? 0 : salaryA);
          } catch (error) {
            return 0; // Handle any parsing errors
          }
        });
      } else if (sortBy === 'salary-low-high') {
        filtered.sort((a, b) => {
          try {
            const salaryA = typeof a.salary === 'string' ? parseInt(a.salary.replace(/[^0-9]/g, '')) : 0;
            const salaryB = typeof b.salary === 'string' ? parseInt(b.salary.replace(/[^0-9]/g, '')) : 0;
            return (isNaN(salaryA) ? 0 : salaryA) - (isNaN(salaryB) ? 0 : salaryB);
          } catch (error) {
            return 0; // Handle any parsing errors
          }
        });
      }

      setFilteredJobs(filtered);
    }
  }, [dbJobs, searchTerm, locationFilter, jobTypes, experienceLevels, salaryRanges, sortBy]);

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
            setFilteredJobs(formattedJobs);
            console.log('Jobs processed successfully:', formattedJobs.length);
          } else {
            console.warn('No jobs array in response or empty jobs array');
            // Still set empty array to show fallback data
            setDbJobs([]);
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
                setDbJobs(formattedJobs);
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
                  setDbJobs(testData.jobs);
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
        setDbJobs([]);
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
      <Header/>
      {/* Search Section */}
      <section className="bg-blue-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <input
                type="text"
                placeholder="Location"
                className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              <Button
                variant="primary"
                size="lg"
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
                          checked={jobTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setJobTypes([...jobTypes, type]);
                            } else {
                              setJobTypes(jobTypes.filter(t => t !== type));
                            }
                          }}
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
                          checked={experienceLevels.includes(level)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExperienceLevels([...experienceLevels, level]);
                            } else {
                              setExperienceLevels(experienceLevels.filter(l => l !== level));
                            }
                          }}
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
                          checked={salaryRanges.includes(range)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSalaryRanges([...salaryRanges, range]);
                            } else {
                              setSalaryRanges(salaryRanges.filter(r => r !== range));
                            }
                          }}
                        />
                        <label htmlFor={`salary-${range}`} className="ml-2 text-sm text-gray-700">
                          {range}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchTerm('');
                      setLocationFilter('');
                      setJobTypes([]);
                      setExperienceLevels([]);
                      setSalaryRanges([]);
                      setSortBy('relevant');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Job Listings */}
            <div className="w-full lg:w-3/4">
              <div className="flex justify-between items-center mb-6" id="job-listings">
                <h2 className="text-xl font-bold text-gray-900">
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
                </h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                  <select
                    className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevant">Most Relevant</option>
                    <option value="newest">Newest</option>
                    <option value="salary-high-low">Salary: High to Low</option>
                    <option value="salary-low-high">Salary: Low to High</option>
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
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))
                  ) : dbJobs.length > 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                      <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
                        <svg className="h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs match your filters</h3>
                      <p className="text-gray-500 mb-4">
                        Try adjusting your search criteria or clearing filters
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setSearchTerm('');
                          setLocationFilter('');
                          setJobTypes([]);
                          setExperienceLevels([]);
                          setSalaryRanges([]);
                          setSortBy('relevant');
                        }}
                      >
                        Clear All Filters
                      </Button>
                    </div>
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
