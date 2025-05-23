"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/dashboard/Header';
import JobsTable from '@/components/dashboard/JobsTable';
import Button from '@/components/ui/Button';
import { isAuthenticated, getAuthToken, logout } from '@/app/uitlis/auth';
import { decodeToken } from '@/app/uitlis/jwt';
import { fetchSavedJobs, removeSavedJob, SavedJob as SavedJobType } from '@/app/uitlis/savedJobs';

// Mock data for saved jobs
const savedJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    date: '2025-05-03',
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    company: 'Design Studio',
    location: 'Remote',
    date: '2025-05-02',
  },
  {
    id: '3',
    title: 'React Developer',
    company: 'Startup Inc.',
    location: 'New York, NY',
    date: '2025-04-30',
  },
  {
    id: '4',
    title: 'Frontend Engineer',
    company: 'Big Tech Co.',
    location: 'Seattle, WA',
    date: '2025-04-28',
  },
  {
    id: '5',
    title: 'JavaScript Developer',
    company: 'Web Solutions',
    location: 'Austin, TX',
    date: '2025-04-25',
  },
];

interface UserData {
  name: string;
  email: string;
  subscriptionId: string;
  hasActiveSubscription: boolean;
  iat: number;
  exp: number;
}

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
}

export default function SavedJobsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSavedJobs, setUserSavedJobs] = useState<SavedJob[]>(savedJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Get and decode the JWT token
    const token = getAuthToken();
    if (token) {
      const decoded = decodeToken(token) as UserData;
      setUserData(decoded);

      // Fetch saved jobs from the API
      const getSavedJobs = async () => {
        try {
          const jobs = await fetchSavedJobs();
          setUserSavedJobs(jobs);
        } catch (error) {
          console.error('Error fetching saved jobs:', error);
          // Fallback to mock data if API fails
          console.log('Using mock data as fallback');
        } finally {
          setIsLoading(false);
        }
      };

      getSavedJobs();
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // State to track which job is being removed
  const [removingJobId, setRemovingJobId] = useState<string | null>(null);

  // Function to handle removing a saved job
  const handleRemoveJob = async (jobId: string) => {
    try {
      console.log(`Removing job with ID: ${jobId}`);
      setRemovingJobId(jobId);

      const success = await removeSavedJob(jobId);
      console.log(`Remove job result: ${success}`);

      if (success) {
        // Update the local state to remove the job
        setUserSavedJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        console.error('Failed to remove job, but no error was thrown');
      }
    } catch (error) {
      console.error('Error removing saved job:', error);
    } finally {
      setRemovingJobId(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
  };

  // Filter jobs based on search term and active filter
  const filteredJobs = userSavedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'recent') {
      // Filter for jobs saved in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return matchesSearch && new Date(job.date) >= sevenDaysAgo;
    }
    if (activeFilter === 'remote') {
      return matchesSearch && job.location.toLowerCase().includes('remote');
    }

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading saved jobs...</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Saved Jobs" />
      <main className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-medium text-gray-900">All Saved Jobs</h2>
            <p className="text-gray-500">Jobs you&apos;ve saved for later</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
            <Link href="/jobs">
              <Button variant="primary">Browse Jobs</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <Button
                  variant={activeFilter === 'all' ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={activeFilter === 'recent' ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleFilter('recent')}
                >
                  Recent
                </Button>
                <Button
                  variant={activeFilter === 'remote' ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleFilter('remote')}
                >
                  Remote
                </Button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search saved jobs..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
                <svg className="h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No saved jobs found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? `No jobs match your search "${searchTerm}"`
                  : activeFilter !== 'all'
                    ? `No jobs match the "${activeFilter}" filter`
                    : "You haven't saved any jobs yet"}
              </p>
              <Link href="/jobs">
                <Button variant="primary">Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            <JobsTable
              jobs={filteredJobs}
              type="saved"
              onRemove={handleRemoveJob}
              removingJobId={removingJobId}
            />
          )}
        </div>
      </main>
    </div>
  );
}
