"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import PageLoading from '@/components/ui/PageLoading';
import Button from '@/components/ui/Button';
import AddJobModal from '@/components/forms/AddJobModal';
import { jobPosts } from '@/data/jobPosts';
import { isAdmin } from '@/app/uitlis/auth';

// Company interface
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

// Job interface
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  logo?: string;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Check if user is admin
  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  // Fetch company data
  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch company
        console.log(`Fetching company with ID: ${companyId}`);
        const response = await fetch(`/api/companies/${companyId}`);

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        console.log('Company data:', data);

        if (data.company) {
          setCompany(data.company);

          // Fetch jobs for this company
          try {
            const jobsResponse = await fetch(`/api/jobs?company=${data.company.name}`);
            if (jobsResponse.ok) {
              const jobsData = await jobsResponse.json();
              if (jobsData.jobs) {
                setCompanyJobs(jobsData.jobs);
              }
            }
          } catch (jobsError) {
            console.log('Error fetching company jobs:', jobsError);
            // Fallback to mock data
            const mockJobs = jobPosts.filter(job =>
              job.company.toLowerCase() === data.company.name.toLowerCase()
            );
            setCompanyJobs(mockJobs);
          }
        } else {
          setError('Company not found or invalid data format');
        }
      } catch (err: any) {
        console.log('Error fetching company:', err);
        setError('Failed to load company details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  // Function to refresh jobs after adding a new one
  const handleJobAdded = async () => {
    setShowAddJobModal(false);

    if (company) {
      try {
        // Fetch updated jobs for this company
        const jobsResponse = await fetch(`/api/jobs?company=${company.name}`);
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          if (jobsData.jobs) {
            setCompanyJobs(jobsData.jobs);
          }
        }
      } catch (jobsError) {
        console.log('Error fetching updated company jobs:', jobsError);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageLoading message="Loading company details..." />
        <Footer />
      </div>
    );
  }

  // If company not found, show error
  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Company Not Found</h2>
            <p className="mt-2 text-gray-600">The company you're looking for doesn't exist or has been removed.</p>
            <div className="mt-6">
              <Link href="/companies">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Back to Companies
                </button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center">
              {company.logo ? (
                <div className="h-24 w-24 relative mr-6">
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-lg"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center mr-6">
                  <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                    {company.industry}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {company.location}
                  </div>
                  {company.size && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      {company.size}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0">
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Visit Website
                </a>
              )}
              <Link href="/companies">
                <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Companies
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Company Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">About {company.name}</h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-700 whitespace-pre-line">{company.description || 'No description available.'}</p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200 flex flex-wrap justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Open Positions</h2>
                <div className="flex items-center space-x-4">
                  {isAdminUser && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAddJobModal(true)}
                    >
                      <span className="flex items-center">
                        <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Job Position
                      </span>
                    </Button>
                  )}
                  {companyJobs.length > 0 && (
                    <Link href={`/companies/${company._id}/jobs`}>
                      <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                        View All
                        <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="px-6 py-5">
                {companyJobs.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {/* Show only the first 3 jobs */}
                    {companyJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span>{job.type}</span>
                              <span className="mx-2">•</span>
                              <span>{job.location}</span>
                              <span className="mx-2">•</span>
                              <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Link href={`/jobs/${job.id}`}>
                            <button className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
                              View Job
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))}

                    {/* Show "View All Jobs" button if there are more than 3 jobs */}
                    {companyJobs.length > 3 && (
                      <div className="py-4 text-center">
                        <Link href={`/companies/${company._id}/jobs`}>
                          <button className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50">
                            View All {companyJobs.length} Jobs
                            <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No open positions</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There are currently no job openings at {company.name}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Company Information</h2>
              </div>
              <div className="px-6 py-5">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Industry</dt>
                    <dd className="mt-1 text-sm text-gray-900">{company.industry}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{company.location}</dd>
                  </div>
                  {company.size && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Company Size</dt>
                      <dd className="mt-1 text-sm text-gray-900">{company.size}</dd>
                    </div>
                  )}
                  {company.founded && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Founded</dt>
                      <dd className="mt-1 text-sm text-gray-900">{company.founded}</dd>
                    </div>
                  )}
                  {company.website && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Website</dt>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-sm text-blue-600 hover:text-blue-800 block truncate"
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Open Positions</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {companyJobs.length} {companyJobs.length === 1 ? 'job' : 'jobs'}
                      {companyJobs.length > 0 && (
                        <Link href={`/companies/${company._id}/jobs`} className="ml-2 text-blue-600 hover:text-blue-800">
                          View all
                        </Link>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Add Job Modal */}
      {showAddJobModal && company && (
        <AddJobModal
          companyId={company._id}
          companyName={company.name}
          companyLocation={company.location}
          companyIndustry={company.industry}
          companyLogo={company.logo}
          onClose={() => setShowAddJobModal(false)}
          onSuccess={handleJobAdded}
        />
      )}
    </div>
  );
}
