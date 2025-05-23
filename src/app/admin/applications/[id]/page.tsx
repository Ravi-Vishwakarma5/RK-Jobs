"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import PageLoading from '@/components/ui/PageLoading';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { jobApplications } from '@/data/applications';
import { jobPosts } from '@/data/jobPosts';
import { getAuthToken } from '@/app/uitlis/auth';

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
  jobTitle?: string;
  company?: string;
  location?: string;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [job, setJob] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<string>('');

  // Fetch application data
  useEffect(() => {
    const fetchApplicationData = async () => {
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

        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Try to fetch from API
        try {
          const response = await fetch(`/api/applications/${applicationId}`, { headers });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.application) {
              setApplication(data.application);
              setNotes(data.application.notes || '');
              setStatus(data.application.status || 'pending');
              
              // Fetch job details if jobId is available
              if (data.application.jobId) {
                try {
                  const jobResponse = await fetch(`/api/jobs/${data.application.jobId}`, { headers });
                  
                  if (jobResponse.ok) {
                    const jobData = await jobResponse.json();
                    if (jobData.success && jobData.job) {
                      setJob(jobData.job);
                    }
                  }
                } catch (jobError) {
                  console.error('Error fetching job details:', jobError);
                }
              }
              
              return; // Exit early if application is found
            }
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError);
        }
        
        // Fallback to mock data
        console.log('Falling back to mock data');
        const mockApplication = jobApplications.find(app => app.id === applicationId);
        
        if (mockApplication) {
          const mockJob = jobPosts.find(j => j.id === mockApplication.jobId);
          
          setApplication({
            ...mockApplication,
            jobTitle: mockJob?.title || 'Unknown Job',
            company: mockJob?.company || 'Unknown Company',
            location: mockJob?.location || 'Unknown Location'
          });
          
          setNotes(mockApplication.notes || '');
          setStatus(mockApplication.status || 'pending');
          setJob(mockJob || null);
        } else {
          setError('Application not found');
        }
      } catch (err) {
        console.error('Error fetching application:', err);
        setError('Failed to load application details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationData();
  }, [applicationId]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!application) return;
    
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

      // Update application status and notes
      const response = await fetch('/api/applications', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          id: applicationId,
          status,
          notes
        })
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          // Update application in state
          setApplication(prev => prev ? { ...prev, status: status as any, notes } : null);
          alert('Application updated successfully');
        } else {
          console.error('API returned error:', data.error);
          setError(data.error || 'Failed to update application');
          
          // Still update the UI for demo purposes
          setApplication(prev => prev ? { ...prev, status: status as any, notes } : null);
        }
      } else {
        console.error('Failed to update application');
        setError('Failed to update application. Please try again.');
        
        // Still update the UI for demo purposes
        setApplication(prev => prev ? { ...prev, status: status as any, notes } : null);
      }
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application. Please try again.');
      
      // Still update the UI for demo purposes
      setApplication(prev => prev ? { ...prev, status: status as any, notes } : null);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <PageLoading message="Loading application details..." />;
  }

  if (!application) {
    return (
      <div>
        <AdminHeader title="Application Not Found" user={null} />
        <main className="p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Not Found</h2>
            <p className="text-gray-600 mb-6">The application you're looking for doesn't exist or has been removed.</p>
            <Link href="/admin/applications">
              <Button variant="primary">Back to Applications</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Application Details" user={null} />
      <main className="p-4 sm:p-6">
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

        <div className="max-w-5xl mx-auto">
          {/* Application Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{application.jobTitle || 'Unknown Position'}</h2>
                <p className="text-gray-600">{application.company || 'Unknown Company'}</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                  application.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                  application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Applicant</h3>
                <p className="text-base font-medium text-gray-900">{application.fullName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                <p className="text-base text-gray-900">{application.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                <p className="text-base text-gray-900">{application.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Applied Date</h3>
                <p className="text-base text-gray-900">{new Date(application.appliedDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Application Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Resume */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resume</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Resume.pdf</p>
                        <p className="text-xs text-gray-500">PDF, 2.4 MB</p>
                      </div>
                    </div>
                    <a
                      href={application.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {application.coverLetter && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{application.coverLetter}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Update Status */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Application Status
                    </label>
                    <select
                      id="status"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={4}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add notes about this application..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleStatusUpdate}
                    isLoading={isUpdating}
                    loadingText="Updating..."
                  >
                    Update Application
                  </Button>
                </div>
              </div>

              {/* Job Details */}
              {job && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Position</h4>
                      <p className="text-gray-900">{job.title}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Company</h4>
                      <p className="text-gray-900">{job.company}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Location</h4>
                      <p className="text-gray-900">{job.location}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Type</h4>
                      <p className="text-gray-900">{job.type || 'Not specified'}</p>
                    </div>
                    <div className="pt-3">
                      <Link href={`/admin/jobs/${job.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Job Posting
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/admin/applications">
              <Button variant="outline">
                Back to Applications
              </Button>
            </Link>
            <Button
              variant={application.status === 'rejected' ? 'danger' : 'primary'}
              onClick={() => {
                setStatus(application.status === 'rejected' ? 'pending' : 'rejected');
                setTimeout(() => handleStatusUpdate(), 100);
              }}
            >
              {application.status === 'rejected' ? 'Restore Application' : 'Reject Application'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
