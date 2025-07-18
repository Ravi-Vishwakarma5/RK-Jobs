"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/dashboard/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { isAuthenticated, getAuthToken, logout } from '@/app/uitlis/auth';
import { decodeToken } from '@/app/uitlis/jwt';

interface UserData {
  name: string;
  email: string;
  subscriptionId: string;
  hasActiveSubscription: boolean;
  iat: number;
  exp: number;
}

export default function ProfilePage() {
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
          <h2 className="text-xl font-semibold text-gray-700">Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null; // Will redirect in useEffect
  }

  // Calculate token expiration
  const tokenExpiration = new Date(userData.exp * 1000);
  const now = new Date();
  const minutesRemaining = Math.max(0, Math.floor((tokenExpiration.getTime() - now.getTime()) / (1000 * 60)));

  // Get user initials for avatar
  const initials = userData.name
    ? userData.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  return (
    <div>
      <Header title="Profile" />
      <main className="p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-medium">
                  {initials}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-medium text-gray-900">{userData.name || 'User'}</h2>
                  <p className="text-gray-500">{userData.email || 'No email available'}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
          </Card>

          <Card className="mb-6" title="Account Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-gray-900">{userData.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{userData.email || 'No email available'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subscription ID</label>
                <p className="mt-1 text-gray-900 text-sm break-all">{userData.subscriptionId || 'Not available'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subscription Status</label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </p>
              </div>
            </div>
          </Card>

          <Card className="mb-6" title="Authentication Status">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Session Expires In</label>
                <p className="mt-1 text-gray-900">{minutesRemaining} minutes</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, (minutesRemaining / 60) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Token Expiration</label>
                <p className="mt-1 text-gray-900">{tokenExpiration.toLocaleString()}</p>
              </div>
              {/* <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">JWT Token</label>
                <p className="mt-1 text-xs text-gray-500 break-all bg-gray-50 p-2 rounded">
                  {getAuthToken() || 'No token found'}
                </p>
              </div> */}
            </div>
          </Card>

          <Card className="mb-6" title="Skills">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">React</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">TypeScript</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">JavaScript</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">HTML5</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">CSS3</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Tailwind CSS</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Redux</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Next.js</span>
            </div>
          </Card>

          <Card className="mb-6" title="Experience">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Senior Frontend Developer</h3>
                  <span className="text-sm text-gray-500">2022 - Present</span>
                </div>
                <p className="text-gray-700">Tech Solutions Inc.</p>
                <ul className="mt-2 list-disc list-inside text-gray-700">
                  <li>Led the frontend development of the company&apos;s flagship product</li>
                  <li>Implemented responsive design principles to improve mobile user experience</li>
                  <li>Collaborated with UX designers to create intuitive user interfaces</li>
                </ul>
              </div>
              <div>
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Frontend Developer</h3>
                  <span className="text-sm text-gray-500">2019 - 2022</span>
                </div>
                <p className="text-gray-700">Web Innovations</p>
                <ul className="mt-2 list-disc list-inside text-gray-700">
                  <li>Developed and maintained multiple client websites</li>
                  <li>Optimized web performance and loading times</li>
                  <li>Implemented analytics tracking and A/B testing</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card title="Subscription Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan</label>
                <p className="mt-1 text-gray-900">
                  {subscriptionInfo?.subscriptionDetails?.planName || 'Premium'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <p className="mt-1 text-gray-900">
                  {subscriptionInfo?.subscriptionDetails?.startDate
                    ? new Date(subscriptionInfo.subscriptionDetails.startDate).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <p className="mt-1 text-gray-900">
                  {subscriptionInfo?.subscriptionDetails?.endDate
                    ? new Date(subscriptionInfo.subscriptionDetails.endDate).toLocaleDateString()
                    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Days Remaining</label>
                <p className="mt-1 text-gray-900">
                  {subscriptionInfo?.subscriptionDetails?.endDate
                    ? Math.max(0, Math.floor((new Date(subscriptionInfo.subscriptionDetails.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    : 365} days
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
