'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SubscriptionStatus from '@/components/user/SubscriptionStatus';

// Mock user data - in a real app, this would come from authentication
const mockUser = {
  id: 'user_123456',
  email: 'user@example.com',
  fullName: 'John Doe',
};

export default function UserDashboardPage() {
  const [recentApplications, setRecentApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch recent applications
        const response = await fetch('/api/user/applications');

        if (response.ok) {
          const data = await response.json();
          setRecentApplications(data.applications.slice(0, 3)); // Get only the first 3
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - User info and subscription */}
          <div className="md:col-span-1 space-y-6">
            {/* User profile card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {mockUser.fullName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{mockUser.fullName}</h2>
                  <p className="text-gray-600">{mockUser.email}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <Link href="/user/profile" className="text-blue-600 hover:underline text-sm">
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Subscription status */}
            <SubscriptionStatus userId={mockUser.id} email={mockUser.email} />

            {/* Quick links */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
              <ul className="space-y-2">
                <li>
                  <Link href="/user/applications" className="text-blue-600 hover:underline">
                    My Applications
                  </Link>
                </li>
                <li>
                  <Link href="/user/saved-jobs" className="text-blue-600 hover:underline">
                    Saved Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/user/referrals" className="text-blue-600 hover:underline">
                    Referrals
                  </Link>
                </li>
                <li>
                  <Link href="/user/resume-review" className="text-blue-600 hover:underline">
                    Resume Review
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Right column - Applications and stats */}
          <div className="md:col-span-2 space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm">Applications</h3>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm">Interviews</h3>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-gray-500 mt-1">Scheduled</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm">Saved Jobs</h3>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-gray-500 mt-1">Active listings</p>
              </div>
            </div>

            {/* Recent applications */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Applications</h2>
                <Link href="/user/applications" className="text-sm text-blue-600 hover:underline">
                  View All
                </Link>
              </div>

              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((application: any) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <h3 className="font-medium">{application.job?.title || 'Unknown Job'}</h3>
                      <p className="text-gray-600 text-sm">{application.job?.company || 'Unknown Company'}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          Applied on {new Date(application.appliedDate).toLocaleDateString()}
                        </span>
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          {application.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No applications yet</p>
                  <Link href="/home" className="text-blue-600 hover:underline block mt-2">
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>

            {/* Recommended jobs */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recommended Jobs</h2>
                <Link href="/home" className="text-sm text-blue-600 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">Senior Frontend Developer</h3>
                  <p className="text-gray-600 text-sm">TechCorp Inc.</p>
                  <p className="text-gray-500 text-sm mt-1">Bangalore, India • ₹18-25 LPA</p>
                  <div className="mt-2">
                    <Link href="/jobs/1" className="text-blue-600 hover:underline text-sm">
                      View Details
                    </Link>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">Full Stack Developer</h3>
                  <p className="text-gray-600 text-sm">WebSolutions Ltd.</p>
                  <p className="text-gray-500 text-sm mt-1">Remote • ₹15-20 LPA</p>
                  <div className="mt-2">
                    <Link href="/jobs/2" className="text-blue-600 hover:underline text-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}