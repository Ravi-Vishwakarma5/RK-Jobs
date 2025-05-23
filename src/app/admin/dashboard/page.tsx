"use client";

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import PageLoading from '@/components/ui/PageLoading';
import TableLoader from '@/components/ui/TableLoader';
import CardLoader from '@/components/ui/CardLoader';
import DashboardChart from '@/components/admin/DashboardChart';
import { jobPosts } from '@/data/jobPosts';
import { jobApplications } from '@/data/applications';
import Link from 'next/link';
import { getAuthToken } from '@/app/uitlis/auth';
import withAdminAuth from '@/components/auth/withAdminAuth';
import Footer from '@/components/ui/Footer';

// Dashboard stat card component
const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
    <div className="flex items-center">
      <div className={`p-2 sm:p-3 rounded-full ${color} text-white mr-3 sm:mr-4 flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    // Job stats
    totalJobs: 0,
    activeJobs: 0,
    fullTimeJobs: 0,
    partTimeJobs: 0,
    remoteJobs: 0,
    contractJobs: 0,
    internshipJobs: 0,
    recentJobs: 0,

    // Application stats
    totalApplications: 0,
    pendingApplications: 0,
    reviewedApplications: 0,
    interviewApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    recentApplications: 0,

    // User stats
    totalUsers: 0,
    activeUsers: 0,
    subscribedUsers: 0,
    recentUsers: 0,

    // Subscription stats
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    recentSubscriptions: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // State for chart data
  const [applicationsByDay, setApplicationsByDay] = useState<any[]>([]);
  const [usersByDay, setUsersByDay] = useState<any[]>([]);
  const [subscriptionsByDay, setSubscriptionsByDay] = useState<any[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get auth token
        let token = null;
        try {
          // Check if we're in a browser environment
          if (typeof window !== 'undefined' && window.localStorage) {
            token = localStorage.getItem('authToken');
            console.log('Auth token from localStorage:', token ? 'Found' : 'Not found');
          } else {
            console.log('Not in browser environment, cannot get token');
          }
        } catch (tokenError) {
          console.error('Error getting auth token:', tokenError);
        }

        // Create headers with proper typing
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        console.log('Using auth headers:', headers);

        // Fetch all data in parallel
        const [
          jobsResponse,
          applicationsResponse,
          recentApplicationsResponse,
          usersResponse,
          subscriptionsResponse
        ] = await Promise.all([
          fetch('/api/jobs/count', { headers }),
          fetch('/api/applications/count', { headers }),
          fetch('/api/applications/recent', { headers }),
          fetch('/api/users/count', { headers }),
          fetch('/api/subscriptions/count', { headers })
        ]);

        // Process responses
        const jobsData = jobsResponse.ok ? await jobsResponse.json() : null;
        const applicationsData = applicationsResponse.ok ? await applicationsResponse.json() : null;
        const recentApplicationsData = recentApplicationsResponse.ok ? await recentApplicationsResponse.json() : null;
        const usersData = usersResponse.ok ? await usersResponse.json() : null;
        const subscriptionsData = subscriptionsResponse.ok ? await subscriptionsResponse.json() : null;

        // Combine all data
        const combinedStats = {
          // Job stats (default to 0 if data not available)
          totalJobs: jobsData?.totalJobs || 0,
          activeJobs: jobsData?.activeJobs || 0,
          fullTimeJobs: jobsData?.fullTimeJobs || 0,
          partTimeJobs: jobsData?.partTimeJobs || 0,
          remoteJobs: jobsData?.remoteJobs || 0,
          contractJobs: jobsData?.contractJobs || 0,
          internshipJobs: jobsData?.internshipJobs || 0,
          recentJobs: jobsData?.recentJobs || 0,

          // Application stats
          totalApplications: applicationsData?.totalApplications || 0,
          pendingApplications: applicationsData?.pendingApplications || 0,
          reviewedApplications: applicationsData?.reviewedApplications || 0,
          interviewApplications: applicationsData?.interviewApplications || 0,
          acceptedApplications: applicationsData?.acceptedApplications || 0,
          rejectedApplications: applicationsData?.rejectedApplications || 0,
          recentApplications: applicationsData?.recentApplications || 0,

          // User stats
          totalUsers: usersData?.totalUsers || 0,
          activeUsers: usersData?.activeUsers || 0,
          subscribedUsers: subscriptionsData?.totalSubscriptions || 0, // Use the total number of subscriptions
          recentUsers: usersData?.recentUsers || 0,

          // Subscription stats
          totalSubscriptions: subscriptionsData?.totalSubscriptions || 0,
          activeSubscriptions: subscriptionsData?.activeSubscriptions || 0,
          totalRevenue: subscriptionsData?.totalRevenue || 0,
          recentSubscriptions: subscriptionsData?.recentSubscriptions || 0,
        };

        // Update state with combined data
        setStats(combinedStats);

        // Update chart data
        if (applicationsData?.applicationsByDay) {
          setApplicationsByDay(applicationsData.applicationsByDay);
        }

        if (usersData?.usersByDay) {
          setUsersByDay(usersData.usersByDay);
        }

        if (subscriptionsData?.subscriptionsByDay) {
          setSubscriptionsByDay(subscriptionsData.subscriptionsByDay);
        }

        // Update recent applications
        if (recentApplicationsData?.applications) {
          setRecentApplications(recentApplicationsData.applications);
        } else {
          // Fallback to mock data for recent applications
          setRecentApplications(jobApplications.slice(0, 5).map(app => {
            const job = jobPosts.find(j => j.id === app.jobId);
            return {
              ...app,
              jobTitle: job?.title || 'Unknown Job',
              company: job?.company || 'Unknown Company',
            };
          }));
        }

        // Check if any data source is using mock data
        const usingMockData =
          (jobsData?.source === 'mock') ||
          (applicationsData?.source === 'mock') ||
          (recentApplicationsData?.source === 'mock') ||
          (usersData?.source === 'mock') ||
          (subscriptionsData?.source === 'mock');

        if (usingMockData) {
          setError('Some data is being loaded from mock sources. Connect to MongoDB for real data.');
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Using mock data instead.');

        // Fallback to mock data
        setStats({
          // Job stats
          totalJobs: jobPosts.length,
          activeJobs: jobPosts.length,
          fullTimeJobs: jobPosts.filter(job => job.type === 'Full-time').length,
          partTimeJobs: jobPosts.filter(job => job.type === 'Part-time').length,
          remoteJobs: jobPosts.filter(job => job.type && job.type.includes('Remote')).length,
          contractJobs: jobPosts.filter(job => job.type === 'Contract').length,
          internshipJobs: jobPosts.filter(job => job.type === 'Internship').length,
          recentJobs: Math.floor(jobPosts.length * 0.2), // Assume 20% are recent

          // Application stats
          totalApplications: jobApplications.length,
          pendingApplications: jobApplications.filter(app => app.status === 'pending').length,
          reviewedApplications: jobApplications.filter(app => app.status === 'reviewed').length,
          interviewApplications: jobApplications.filter(app => app.status === 'interview').length,
          acceptedApplications: jobApplications.filter(app => app.status === 'accepted').length,
          rejectedApplications: jobApplications.filter(app => app.status === 'rejected').length,
          recentApplications: Math.floor(jobApplications.length * 0.3), // Assume 30% are recent

          // User stats
          totalUsers: 120,
          activeUsers: 105,
          subscribedUsers: 25, // Total number of subscriptions
          recentUsers: 18,

          // Subscription stats
          totalSubscriptions: 25,
          activeSubscriptions: 18,
          totalRevenue: 12582,
          recentSubscriptions: 7,
        });

        // Generate mock subscriptions
        const mockSubscriptions = [];
        for (let i = 0; i < 10; i++) {
          const createdDate = new Date();
          createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));

          const endDate = new Date(createdDate);
          endDate.setFullYear(endDate.getFullYear() + 1);

          mockSubscriptions.push({
            id: `mock-${i}`,
            email: `user${i}@example.com`,
            fullName: `Test User ${i}`,
            plan: ['basic', 'professional', 'premium'][Math.floor(Math.random() * 3)],
            amount: [499, 599, 699][Math.floor(Math.random() * 3)],
            currency: 'INR',
            status: ['active', 'expired', 'pending'][Math.floor(Math.random() * 3)],
            startDate: createdDate.toISOString(),
            endDate: endDate.toISOString(),
            createdAt: createdDate.toISOString(),
            paymentId: `mock-payment-${i}`
          });
        }

        // Update subscribedUsers with the length of mockSubscriptions
        setStats(prevStats => ({
          ...prevStats,
          subscribedUsers: mockSubscriptions.length
        }));

        // Mock chart data
        const mockChartData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);

          mockChartData.push({
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 10) + 1
          });
        }

        setApplicationsByDay(mockChartData);
        setUsersByDay(mockChartData.map(item => ({ ...item, count: Math.floor(Math.random() * 8) + 1 })));
        setSubscriptionsByDay(mockChartData.map(item => ({ ...item, count: Math.floor(Math.random() * 5) + 1 })));

        setRecentApplications(jobApplications.slice(0, 5).map(app => {
          const job = jobPosts.find(j => j.id === app.jobId);
          return {
            ...app,
            jobTitle: job?.title || 'Unknown Job',
            company: job?.company || 'Unknown Company',
          };
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AdminHeader title="Dashboard" user={null} />
        <div className="flex-grow p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Statistics</h2>
          <CardLoader count={4} grid={true} message="Loading statistics..." />

          <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">Recent Applications</h2>
          <TableLoader rows={5} columns={5} message="Loading applications..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader title="Dashboard" user={null} />
      <main className="p-4 sm:p-6">
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 sm:ml-3 flex-1">
                <p className="text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Stats Cards - Jobs */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            color="bg-blue-500"
          />
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-green-500"
          />
          <StatCard
            title="Full-time Jobs"
            value={stats.fullTimeJobs}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-indigo-500"
          />
          <StatCard
            title="Remote Jobs"
            value={stats.remoteJobs}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
            color="bg-teal-500"
          />
        </div>

        {/* Stats Cards - Applications */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6 sm:mt-8">Application Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            color="bg-purple-500"
          />
          <StatCard
            title="Pending Applications"
            value={stats.pendingApplications}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-yellow-500"
          />
          <StatCard
            title="Interview Stage"
            value={stats.interviewApplications}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="bg-blue-500"
          />
          <StatCard
            title="Accepted Applications"
            value={stats.acceptedApplications}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-green-500"
          />
        </div>

        {/* Stats Cards - Users & Subscriptions */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6 sm:mt-8">User & Subscription Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Total Subscriptions"
            value={stats.subscribedUsers}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            }
            color="bg-pink-500"
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-green-500"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-yellow-500"
          />
        </div>

        {/* Charts */}
        {/* <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">Activity Charts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <DashboardChart
            title="Applications (Last 7 Days)"
            data={applicationsByDay}
            color="bg-purple-500"
          />
          <DashboardChart
            title="New Users (Last 7 Days)"
            data={usersByDay}
            color="bg-indigo-500"
          />
          <DashboardChart
            title="Subscriptions (Last 7 Days)"
            data={subscriptionsByDay}
            color="bg-pink-500"
          />
        </div> */}

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
            <Link href="/admin/applications" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Date
                  </th>
                  <th scope="col" className="relative px-3 sm:px-6 py-2 sm:py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentApplications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">{application.fullName}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[100px] sm:max-w-none">{application.email}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900 truncate max-w-[80px] sm:max-w-none">{application.jobTitle}</div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-none">{application.company}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className={`px-1.5 sm:px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <Link href={`/admin/applications/${application.id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/new" className="bg-blue-50 hover:bg-blue-100 p-3 sm:p-4 rounded-lg flex items-center">
              <div className="p-2 bg-blue-500 rounded-full text-white mr-3 sm:mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Post New Job</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Create a new job listing</p>
              </div>
            </Link>
            <Link href="/admin/generate-jobs" className="bg-amber-50 hover:bg-amber-100 p-3 sm:p-4 rounded-lg flex items-center">
              <div className="p-2 bg-amber-500 rounded-full text-white mr-3 sm:mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Post Jobs</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Create job positions for companies</p>
              </div>
            </Link>
            <Link href="/admin/applications" className="bg-purple-50 hover:bg-purple-100 p-3 sm:p-4 rounded-lg flex items-center">
              <div className="p-2 bg-purple-500 rounded-full text-white mr-3 sm:mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Review Applications</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Review pending applications</p>
              </div>
            </Link>
            <Link href="/admin/users" className="bg-green-50 hover:bg-green-100 p-3 sm:p-4 rounded-lg flex items-center">
              <div className="p-2 bg-green-500 rounded-full text-white mr-3 sm:mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Manage Users</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">View and manage users</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Export the component wrapped with admin authentication
export default withAdminAuth(AdminDashboard);
