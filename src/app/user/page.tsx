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

export default function UserDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);

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
    }

    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Welcome back,</p>
            <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
            <p className="text-sm text-gray-500">{userData.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      <main className="p-6">
        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Status</h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Plan</p>
              <p className="text-lg font-medium text-gray-900">{subscriptionInfo?.subscriptionDetails?.planName || 'Premium'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-medium text-green-600">Active</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expires In</p>
              <p className="text-lg font-medium text-gray-900">{daysRemaining} days</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="w-full md:w-48 bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, (daysRemaining / 365) * 100)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{Math.round((daysRemaining / 365) * 100)}% remaining</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Applications"
            value="12"
            color="blue"
            linkText="View all applications"
            linkHref="/user/applications"
          />
          <DashboardCard
            title="Interviews"
            value="3"
            color="yellow"
            linkText="View interviews"
            linkHref="/user/applications"
          />
          <DashboardCard
            title="Offers"
            value="1"
            color="green"
            linkText="View offers"
            linkHref="/user/applications"
          />
          <DashboardCard
            title="Saved Jobs"
            value="8"
            color="purple"
            linkText="View saved jobs"
            linkHref="/user/saved-jobs"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
            <Link href="/user/applications">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <JobsTable jobs={recentApplications.map(app => ({
            ...app,
            status: app.status as 'applied' | 'interview' | 'offer' | 'rejected' | 'saved'
          }))} type="applications" />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recommended Jobs</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <p className="text-gray-500">Based on your profile and preferences</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Senior Frontend Developer</h3>
              <p className="text-sm text-gray-500">TechCorp • San Francisco, CA</p>
              <p className="text-sm text-gray-500 mt-2">$120,000 - $150,000</p>
              <div className="mt-4 flex justify-end">
                <Button variant="primary" size="sm">
                  Apply Now
                </Button>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">UI/UX Designer</h3>
              <p className="text-sm text-gray-500">Design Studio • Remote</p>
              <p className="text-sm text-gray-500 mt-2">$90,000 - $110,000</p>
              <div className="mt-4 flex justify-end">
                <Button variant="primary" size="sm">
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
