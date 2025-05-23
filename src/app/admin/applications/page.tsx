"use client";

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import PageLoading from '@/components/ui/PageLoading';
import TableLoader from '@/components/ui/TableLoader';
import Button from '@/components/ui/Button';
import { jobApplications } from '@/data/applications';
import { jobPosts } from '@/data/jobPosts';
import Link from 'next/link';
import { getAuthToken } from '@/app/uitlis/auth';
import Footer from '@/components/ui/Footer';

interface Application {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
  appliedDate: string;
  notes?: string;
  jobTitle: string;
  company: string;
  location: string;
}

export default function AdminApplicationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
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
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', '20');

        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }

        if (statusFilter && statusFilter !== 'all') {
          queryParams.append('status', statusFilter);
        }

        // Create a function to generate mock data to avoid repetition
        const generateMockData = () => {
          return jobApplications.map(app => {
            const job = jobPosts.find(j => j.id === app.jobId);
            return {
              ...app,
              jobTitle: job?.title || 'Unknown Job',
              company: job?.company || 'Unknown Company',
              location: job?.location || 'Unknown Location'
            };
          });
        };

        try {
          // Fetch applications
          console.log('Fetching applications with params:', queryParams.toString());
          const response = await fetch(`/api/applications?${queryParams.toString()}`, { headers });

          let data = null;
          try {
            const text = await response.text();
            try {
              data = JSON.parse(text);
            } catch (jsonError) {
              console.error('Failed to parse response as JSON:', text);
              throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
            }
          } catch (parseError) {
            console.error('Error getting response text:', parseError);
            throw new Error('Failed to get API response text');
          }

          if (!data) {
            throw new Error('No data returned from API');
          }

          if (response.ok && data.success === true) {
            console.log('Successfully fetched applications:', data.applications?.length || 0);

            // Ensure applications is an array
            if (!Array.isArray(data.applications)) {
              console.error('API returned non-array applications:', data.applications);
              throw new Error('Invalid applications data format');
            }

            setApplications(data.applications || []);

            // Update pagination
            if (data.pagination) {
              setTotalPages(data.pagination.pages || 1);
            }

            // Check if using mock data
            if (data.source === 'mock') {
              setError('Using mock data. Connect to MongoDB for real data.');
            }
          } else {
            // Handle API error
            let errorMsg = 'Unknown error';
            if (data && typeof data === 'object') {
              errorMsg = data.error || 'API returned error without details';
            }

            console.warn('API returned error or unsuccessful response:', errorMsg);
            setError(`${errorMsg}. Using mock data instead.`);

            // Fallback to mock data
            setApplications(generateMockData());
          }
        } catch (fetchError) {
          // Handle any errors in the fetch process
          const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
          console.warn('Error during fetch operation:', errorMessage);
          setError(`Network error: ${errorMessage}. Using mock data instead.`);

          // Fallback to mock data
          setApplications(generateMockData());
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Using mock data instead.');

        // Fallback to mock data
        const mockData = jobApplications.map(app => {
          const job = jobPosts.find(j => j.id === app.jobId);
          return {
            ...app,
            jobTitle: job?.title || 'Unknown Job',
            company: job?.company || 'Unknown Company',
            location: job?.location || 'Unknown Location'
          };
        });
        setApplications(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [searchQuery, statusFilter, currentPage]);

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
        (app.fullName?.toLowerCase() || '').includes(query) ||
        (app.email?.toLowerCase() || '').includes(query) ||
        (app.jobTitle?.toLowerCase() || '').includes(query) ||
        (app.company?.toLowerCase() || '').includes(query)
      );
    }

    return true;
  });

  // Handle status update
  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setIsUpdating(true);

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
        setError('Authentication required to update application status');
        setIsUpdating(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Update application status
      const response = await fetch('/api/applications', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          id: applicationId,
          status: newStatus
        })
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          // Update application in state
          setApplications(prev =>
            prev.map(app =>
              app.id === applicationId
                ? { ...app, status: newStatus as any }
                : app
            )
          );
        } else {
          console.error('API returned error:', data.error);
          setError(data.error || 'Failed to update application status');
        }
      } else {
        console.error('Failed to update application status');
        setError('Failed to update application status. Please try again.');

        // Fallback to client-side update for demo
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId
              ? { ...app, status: newStatus as any }
              : app
          )
        );
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');

      // Fallback to client-side update for demo
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: newStatus as any }
            : app
        )
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AdminHeader title="Manage Applications" user={null} />
        <div className="flex-grow p-6">
          <TableLoader rows={8} columns={5} message="Loading applications..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader title="Manage Applications" user={null} />
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
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {application.status
                            ? application.status.charAt(0).toUpperCase() + application.status.slice(1)
                            : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <select
                            className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={application.status || 'pending'}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md mr-2 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ml-2 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
