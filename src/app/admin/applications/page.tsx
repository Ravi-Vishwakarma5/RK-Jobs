"use client";

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import PageLoading from '@/components/ui/PageLoading';
import Button from '@/components/ui/Button';
import { jobApplications } from '@/data/applications';
import { jobPosts } from '@/data/jobPosts';
import Link from 'next/link';

// Combine application data with job data
const getEnrichedApplications = () => {
  return jobApplications.map(app => {
    const job = jobPosts.find(j => j.id === app.jobId);
    return {
      ...app,
      jobTitle: job?.title || 'Unknown Job',
      company: job?.company || 'Unknown Company',
    };
  });
};

export default function AdminApplicationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<ReturnType<typeof getEnrichedApplications>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setApplications(getEnrichedApplications());
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter applications based on search query and status filter
  const filteredApplications = applications.filter(app => {
    // Filter by status
    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        app.fullName.toLowerCase().includes(query) ||
        app.email.toLowerCase().includes(query) ||
        app.jobTitle.toLowerCase().includes(query) ||
        app.company.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Handle status update
  const handleStatusUpdate = (applicationId: string, newStatus: string) => {
    setIsUpdating(true);

    // Simulate API call
    setTimeout(() => {
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? { ...app, status: newStatus as any }
            : app
        )
      );
      setIsUpdating(false);
    }, 1000);
  };

  if (isLoading) {
    return <PageLoading message="Loading applications..." />;
  }

  return (
    <div>
      <AdminHeader title="Manage Applications" />
      <main className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search applications..."
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

          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
            <Button
              variant={statusFilter === 'all' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'reviewed' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('reviewed')}
            >
              Reviewed
            </Button>
            <Button
              variant={statusFilter === 'interview' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('interview')}
            >
              Interview
            </Button>
            <Button
              variant={statusFilter === 'accepted' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('accepted')}
            >
              Accepted
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected
            </Button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{application.fullName}</div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.jobTitle}</div>
                        <div className="text-sm text-gray-500">{application.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <select
                            className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={application.status}
                            onChange={(e) => handleStatusUpdate(application.id, e.target.value)}
                            disabled={isUpdating}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="interview">Interview</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <Link href={`/admin/applications/${application.id}`} className="text-blue-600 hover:text-blue-900 text-sm">
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
              <p className="text-gray-500 mb-4">No applications found matching your criteria.</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
