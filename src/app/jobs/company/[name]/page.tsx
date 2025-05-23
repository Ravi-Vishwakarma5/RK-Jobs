'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import PageLoading from '@/components/ui/PageLoading';
import Button from '@/components/ui/Button';
import { jobPosts } from '@/data/jobPosts';

interface Company {
  _id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  industry: string;
  location: string;
  size: string;
  founded: number;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  postedDate: string;
  logo?: string;
}

export default function CompanyJobsPage() {
  const params = useParams();
  const router = useRouter();
  const companyName = params.name as string;
  const decodedCompanyName = decodeURIComponent(companyName);
  
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [jobType, setJobType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Fetch company data and jobs
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch jobs for this company
        const jobsResponse = await fetch(`/api/jobs?company=${decodedCompanyName}`);
        if (!jobsResponse.ok) {
          throw new Error(`API returned status ${jobsResponse.status}`);
        }
        
        const jobsData = await jobsResponse.json();
        if (jobsData.jobs && jobsData.jobs.length > 0) {
          setCompanyJobs(jobsData.jobs);
          
          // Try to fetch company details
          try {
            // Search for company by name
            const companiesResponse = await fetch(`/api/companies?search=${decodedCompanyName}`);
            if (companiesResponse.ok) {
              const companiesData = await companiesResponse.json();
              if (companiesData.companies && companiesData.companies.length > 0) {
                // Find exact match or first match
                const exactMatch = companiesData.companies.find(
                  (c: Company) => c.name.toLowerCase() === decodedCompanyName.toLowerCase()
                );
                setCompany(exactMatch || companiesData.companies[0]);
              }
            }
          } catch (companyError) {
            console.log('Error fetching company details:', companyError);
            // Continue without company details
          }
        } else {
          // Try fallback to mock data
          const mockJobs = jobPosts.filter(job => 
            job.company.toLowerCase() === decodedCompanyName.toLowerCase()
          );
          
          if (mockJobs.length > 0) {
            setCompanyJobs(mockJobs);
          } else {
            setError(`No jobs found for company "${decodedCompanyName}"`);
          }
        }
      } catch (err: any) {
        console.log('Error fetching jobs:', err);
        setError(`Failed to load jobs for company "${decodedCompanyName}". Please try again.`);
        
        // Try fallback to mock data
        const mockJobs = jobPosts.filter(job => 
          job.company.toLowerCase() === decodedCompanyName.toLowerCase()
        );
        
        if (mockJobs.length > 0) {
          setCompanyJobs(mockJobs);
          setError(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (decodedCompanyName) {
      fetchData();
    }
  }, [decodedCompanyName]);

  // Filter jobs by type
  const filteredJobs = companyJobs.filter(job => {
    if (jobType === 'all') return true;
    return job.type.toLowerCase() === jobType.toLowerCase();
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
    } else if (sortBy === 'title-asc') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'title-desc') {
      return b.title.localeCompare(a.title);
    }
    return 0;
  });

  // Get unique job types for filter
  const jobTypes = ['all', ...new Set(companyJobs.map(job => job.type.toLowerCase()))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageLoading message={`Loading jobs for ${decodedCompanyName}...`} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Error message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              {company?.logo ? (
                <div className="h-16 w-16 relative mr-4">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-lg"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{decodedCompanyName}</h1>
                {company && (
                  <p className="text-gray-600">{company.industry} • {company.location}</p>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              {company && (
                <Link href={`/companies/${company._id}`}>
                  <Button variant="outline">Company Profile</Button>
                </Link>
              )}
              {company?.website && (
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">Visit Website</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Jobs at {decodedCompanyName}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'})
                </span>
              </h2>
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <select
                  className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Job Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="divide-y divide-gray-200">
            {sortedJobs.length > 0 ? (
              sortedJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1">
                        <span className="flex items-center">
                          <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Posted {new Date(job.postedDate).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {job.type}
                        </span>
                        {job.salary && (
                          <span className="flex items-center">
                            <svg className="mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            {job.salary}
                          </span>
                        )}
                      </div>
                      {job.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 md:mt-0 flex-shrink-0">
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="primary">View Job</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No open positions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {jobType !== 'all' 
                    ? `There are currently no ${jobType} positions at ${decodedCompanyName}.` 
                    : `There are currently no job openings at ${decodedCompanyName}.`}
                </p>
                {jobType !== 'all' && (
                  <div className="mt-4">
                    <button 
                      onClick={() => setJobType('all')} 
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all job types
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
