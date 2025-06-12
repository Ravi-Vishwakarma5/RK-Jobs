"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import DashboardCard from '@/components/dashboard/DashboardCard';
import JobsTable from '@/components/dashboard/JobsTable';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { isAuthenticated, getAuthToken, logout } from '@/app/uitlis/auth';
import { verifyToken, decodeToken } from '@/app/uitlis/jwt';
import { fetchSavedJobs, SavedJob, saveJob } from '@/app/uitlis/savedJobs';

// Mock data for the dashboard
const recentApplications = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'Tech Solutions Inc.',
    location: 'New York, NY',
    status: 'applied',
    date: '2025-05-01',
  },
  {
    id: '2',
    title: 'UX Designer',
    company: 'Creative Designs',
    location: 'Remote',
    status: 'interview',
    date: '2025-04-28',
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Web Innovations',
    location: 'San Francisco, CA',
    status: 'rejected',
    date: '2025-04-15',
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

// Application interface
interface Application {
  id: string;
  title: string;
  company: string;
  location: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'saved';
  date: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(false);
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    interviews: 0,
    offers: 0
  });

  // Fetch user applications
  const fetchApplications = async () => {
    setIsLoadingApplications(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      try {
        console.log('Fetching applications...');
        const response = await fetch('/api/user/applications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          // Don't throw here, continue to fallback
          throw new Error(`Failed to fetch applications: ${response.status}`);
        }

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response received:', contentType);
          throw new Error('Server returned non-JSON response');
        }

      const data = await response.json();

      if (data.applications && Array.isArray(data.applications)) {
        const formattedApplications = data.applications.map((app: any) => ({
          id: app.id,
          title: app.jobTitle || 'Unknown Position',
          company: app.company || 'Unknown Company',
          location: app.location || 'Unknown Location',
          status: app.status || 'applied',
          date: new Date(app.appliedDate).toLocaleDateString()
        }));

        setApplications(formattedApplications);

        // Calculate stats
        const stats = {
          total: formattedApplications.length,
          interviews: formattedApplications.filter(app => app.status === 'interview').length,
          offers: formattedApplications.filter(app => app.status === 'offer').length
        };

        setApplicationStats(stats);
      } else {
        // If no applications or invalid format, use mock data
        setApplications(recentApplications);
        setApplicationStats({
          total: recentApplications.length,
          interviews: recentApplications.filter(app => app.status === 'interview').length,
          offers: recentApplications.filter(app => app.status === 'offer').length
        });
      }
      } catch (apiError) {
        console.error('API error:', apiError);
        // Continue with fallback data
        console.log('Using fallback data due to API error');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Show error in console with more details
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }

      // Log token information (without revealing the actual token)
      const token = getAuthToken();
      console.log('Token exists:', !!token);
      if (token) {
        try {
          const decoded = decodeToken(token);
          console.log('Token decoded successfully:', !!decoded);
          console.log('Token expiration:', decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No expiration');
        } catch (tokenError) {
          console.error('Token decode error:', tokenError);
        }
      }

      // Fallback to mock data
      console.log('Falling back to mock data');
      setApplications(recentApplications);
      setApplicationStats({
        total: recentApplications.length,
        interviews: recentApplications.filter(app => app.status === 'interview').length,
        offers: recentApplications.filter(app => app.status === 'offer').length
      });
    } finally {
      setIsLoadingApplications(false);
    }
  };

  // Fetch saved jobs
  const fetchUserSavedJobs = async () => {
    setIsLoadingSavedJobs(true);
    try {
      console.log('Fetching saved jobs...');
      const jobs = await fetchSavedJobs();
      console.log('Saved jobs fetched successfully:', jobs.length);
      setSavedJobs(jobs);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);

      // Show error in console with more details
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }

      // Log token information (without revealing the actual token)
      const token = getAuthToken();
      console.log('Token exists:', !!token);
      if (token) {
        try {
          const decoded = decodeToken(token);
          console.log('Token decoded successfully:', !!decoded);
          console.log('Token expiration:', decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No expiration');
        } catch (tokenError) {
          console.error('Token decode error:', tokenError);
        }
      }

      // Fallback to empty array
      console.log('Using empty array for saved jobs due to error');
      setSavedJobs([]);
    } finally {
      setIsLoadingSavedJobs(false);
    }
  };

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

      // Get subscription info from localStorage
      const userSubscription = localStorage.getItem('userSubscription');
      if (userSubscription) {
        try {
          const subscriptionData = JSON.parse(userSubscription);
          setSubscriptionInfo(subscriptionData);
        } catch (error) {
          console.error('Error parsing subscription data:', error);
        }
      }

      // Fetch applications and saved jobs
      fetchApplications();
      fetchUserSavedJobs();
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
       router.push('/');
    logout();

  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null; // Will redirect in useEffect
  }

  // Calculate subscription expiration
  const subscriptionEndDate = subscriptionInfo?.subscriptionDetails?.endDate
    ? new Date(subscriptionInfo.subscriptionDetails.endDate)
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const daysRemaining = Math.max(0, Math.floor((subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div>
      <Header title="Dashboard" />
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div>
            <p className="text-xs sm:text-sm text-gray-500">Welcome back,</p>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{userData.name}</h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[250px]">{userData.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      <main className="p-4 sm:p-6">
        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Subscription Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="mb-3 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-500">Plan</p>
              <p className="text-base sm:text-lg font-medium text-gray-900">{subscriptionInfo?.subscriptionDetails?.planName || 'Premium'}</p>
            </div>
            <div className="mb-3 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-500">Status</p>
              <p className="text-base sm:text-lg font-medium text-green-600">Active</p>
            </div>
            <div className="mb-3 sm:mb-0">
              <p className="text-xs sm:text-sm text-gray-500">Expires In</p>
              <p className="text-base sm:text-lg font-medium text-gray-900">{daysRemaining} days</p>
            </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Progress</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, (daysRemaining / 365) * 100)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{Math.round((daysRemaining / 365) * 100)}% remaining</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <DashboardCard
            title="Total Applications"
            value={applicationStats.total.toString()}
            color="blue"
            linkText="View all applications"
            linkHref="/user/applications"
            isLoading={isLoadingApplications}
          />
          <DashboardCard
            title="Interviews"
            value={applicationStats.interviews.toString()}
            color="yellow"
            linkText="View interviews"
            linkHref="/user/applications"
            isLoading={isLoadingApplications}
          />
          <DashboardCard
            title="Offers"
            value={applicationStats.offers.toString()}
            color="green"
            linkText="View offers"
            linkHref="/user/applications"
            isLoading={isLoadingApplications}
          />
          <DashboardCard
            title="Saved Jobs"
            value={savedJobs.length.toString()}
            color="purple"
            linkText="View saved jobs"
            linkHref="/user/saved-jobs"
            isLoading={isLoadingSavedJobs}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Applications</h2>
            <Link href="/user/applications">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                View All
              </Button>
            </Link>
          </div>

          {isLoadingApplications ? (
            <div className="py-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-3 sm:border-4 border-gray-300 border-t-blue-600 mb-2"></div>
              <p className="text-xs sm:text-sm text-gray-500">Loading applications...</p>
            </div>
          ) : applications.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                <JobsTable
                  jobs={applications.slice(0, 3)}
                  type="applications"
                />
              </div>
            </div>
          ) : (
            <div className="py-6 sm:py-8 text-center">
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">You haven't applied to any jobs yet.</p>
              <Link href="/jobs">
                <Button variant="primary" size="sm" className="text-xs sm:text-sm">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-medium text-gray-900">Recommended Jobs</h2>
            <Link href="/jobs">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                View All Jobs
              </Button>
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">Based on your profile and preferences</p>

          {isLoading ? (
            <div className="py-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-3 sm:border-4 border-gray-300 border-t-blue-600 mb-2"></div>
              <p className="text-xs sm:text-sm text-gray-500">Loading recommendations...</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Senior Frontend Developer</h3>
                <p className="text-xs sm:text-sm text-gray-500">TechCorp • San Francisco, CA</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">$120,000 - $150,000</p>
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs w-full sm:w-auto"
                    onClick={() => {
                      saveJob({
                        id: 'rec-1',
                        title: 'Senior Frontend Developer',
                        company: 'TechCorp',
                        location: 'San Francisco, CA',
                        date: new Date().toISOString()
                      });
                      fetchUserSavedJobs();
                    }}
                  >
                    Save
                  </Button>
                  <Link href="/jobs/rec-1" className="w-full sm:w-auto">
                    <Button variant="primary" size="sm" className="text-xs w-full">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">UI/UX Designer</h3>
                <p className="text-xs sm:text-sm text-gray-500">Design Studio • Remote</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">$90,000 - $110,000</p>
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs w-full sm:w-auto"
                    onClick={() => {
                      saveJob({
                        id: 'rec-2',
                        title: 'UI/UX Designer',
                        company: 'Design Studio',
                        location: 'Remote',
                        date: new Date().toISOString()
                      });
                      fetchUserSavedJobs();
                    }}
                  >
                    Save
                  </Button>
                  <Link href="/jobs/rec-2" className="w-full sm:w-auto">
                    <Button variant="primary" size="sm" className="text-xs w-full">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
