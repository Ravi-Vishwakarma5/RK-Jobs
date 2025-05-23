"use client";

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import PageLoading from '@/components/ui/PageLoading';
import Button from '@/components/ui/Button';
import { jobPosts } from '@/data/jobPosts';
import Link from 'next/link';
import { getAuthToken } from '@/app/uitlis/auth';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  updatedDate?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits?: string[];
}

export default function AdminJobsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get auth token
        let token = null;
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            token = localStorage.getItem('authToken');
          }
        } catch (tokenError) {
          console.error('Error getting auth token:', tokenError);
        }

        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }
        if (typeFilter && typeFilter !== 'all') {
          queryParams.append('type', typeFilter);
        }

        // Fetch jobs
        const response = await fetch(`/api/jobs?${queryParams.toString()}`, { headers });

        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);

          // Check if using mock data
          if (data.source === 'mock') {
            setError('Using mock data. Connect to MongoDB for real data.');
          }
        } else {
          console.error('Failed to fetch jobs');
          setError('Failed to fetch jobs. Using mock data instead.');
          setJobs(jobPosts);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Using mock data instead.');
        setJobs(jobPosts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [searchQuery, typeFilter]);

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  });

  // Handle job selection
  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job.id));
    }
  };

  // Handle delete selected jobs
  const handleDeleteSelected = async () => {
    if (selectedJobs.length === 0) return;

    setIsDeleting(true);

    try {
      // Get auth token
      let token = null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          token = localStorage.getItem('authToken');
        }
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError);
      }

      if (!token) {
        setError('Authentication required to delete jobs');
        setIsDeleting(false);
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      // Delete jobs one by one
      const deletePromises = selectedJobs.map(jobId =>
        fetch(`/api/jobs/${jobId}`, {
          method: 'DELETE',
          headers
        })
      );

      const results = await Promise.all(deletePromises);

      // Check if all deletions were successful
      const allSuccessful = results.every(res => res.ok);

      if (allSuccessful) {
        // Remove deleted jobs from state
        setJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)));
        setSelectedJobs([]);
      } else {
        setError('Failed to delete some jobs. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting jobs:', err);
      setError('Failed to delete jobs. Please try again.');

      // Fallback to client-side deletion for demo
      setJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)));
      setSelectedJobs([]);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <PageLoading message="Loading jobs..." />;
  }

  return (
    <div>
      <AdminHeader title="Manage Jobs" user={null} />
      <main className="p-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
        )}

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setSearchQuery('')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="flex gap-2 overflow-x-auto mb-3 sm:mb-0">
              <Button
                variant={typeFilter === 'all' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('all')}
              >
                All Types
              </Button>
              <Button
                variant={typeFilter === 'Full-time' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('Full-time')}
              >
                Full-time
              </Button>
              <Button
                variant={typeFilter === 'Part-time' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('Part-time')}
              >
                Part-time
              </Button>
              <Button
                variant={typeFilter === 'Contract' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('Contract')}
              >
                Contract
              </Button>
              <Button
                variant={typeFilter === 'Remote' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter('Remote')}
              >
                Remote
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={selectedJobs.length === 0 || isDeleting}
                isLoading={isDeleting}
                loadingText="Deleting..."
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Delete Selected
              </Button>
              <Link href="/admin/new">
                <Button variant="primary" size="sm">
                  Add New Job
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted Date
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className={selectedJobs.includes(job.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedJobs.includes(job.id)}
                          onChange={() => toggleJobSelection(job.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{job.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{job.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {job.type || 'Full-time'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.postedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/jobs/${job.id}`} className="text-blue-600 hover:text-blue-900">
                            Edit
                          </Link>
                          <Link href={`/jobs/${job.id}`} className="text-gray-600 hover:text-gray-900">
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No jobs found matching your search criteria.</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
