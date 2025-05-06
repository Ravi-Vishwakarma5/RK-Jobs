"use client";

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import PageLoading from '@/components/ui/PageLoading';
import Button from '@/components/ui/Button';
import { jobPosts } from '@/data/jobPosts';
import Link from 'next/link';

export default function AdminJobsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState(jobPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  const handleDeleteSelected = () => {
    if (selectedJobs.length === 0) return;
    
    setIsDeleting(true);
    
    // Simulate API call
    setTimeout(() => {
      setJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)));
      setSelectedJobs([]);
      setIsDeleting(false);
    }, 1000);
  };
  
  if (isLoading) {
    return <PageLoading message="Loading jobs..." />;
  }
  
  return (
    <div>
      <AdminHeader title="Manage Jobs" />
      <main className="p-6">
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
          
          <div className="flex gap-3 w-full sm:w-auto">
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
            <Link href="/admin/jobs/new">
              <Button variant="primary" size="sm">
                Add New Job
              </Button>
            </Link>
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
