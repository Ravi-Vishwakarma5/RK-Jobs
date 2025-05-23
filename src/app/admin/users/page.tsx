"use client";

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import PageLoading from '@/components/ui/PageLoading';
import Button from '@/components/ui/Button';
import { users, User } from '@/data/users';
import Link from 'next/link';
import { getAuthToken } from '@/app/uitlis/auth';

interface Subscription {
  id: string;
  email: string;
  fullName: string;
  plan: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  paymentId: string;
}

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
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

        // Create headers with proper typing
        const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Build query parameters
        const userQueryParams = new URLSearchParams();
        if (searchQuery) {
          userQueryParams.append('search', searchQuery);
        }
        if (roleFilter && roleFilter !== 'all') {
          userQueryParams.append('role', roleFilter);
        }
        if (statusFilter && statusFilter !== 'all') {
          userQueryParams.append('status', statusFilter);
        }

        const subscriptionQueryParams = new URLSearchParams();
        if (searchQuery) {
          subscriptionQueryParams.append('search', searchQuery);
        }
        if (statusFilter && statusFilter !== 'all') {
          subscriptionQueryParams.append('status', statusFilter);
        }

        // Fetch data in parallel
        const [usersResponse, subscriptionsResponse] = await Promise.all([
          fetch(`/api/users?${userQueryParams.toString()}`, { headers }),
          fetch(`/api/subscriptions?${subscriptionQueryParams.toString()}`, { headers })
        ]);

        // Process users response
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();

          if (usersData.success) {
            setAllUsers(usersData.users || []);

            // Check if using mock data
            if (usersData.source === 'mock') {
              console.log('Using mock data for users');
            }
          } else {
            console.error('API returned error for users:', usersData.error);
            setError(usersData.error || 'Failed to fetch users');

            // Fallback to mock data
            setAllUsers(users);
          }
        } else {
          console.error('Failed to fetch users');
          setError('Failed to fetch users. Using mock data instead.');

          // Fallback to mock data
          setAllUsers(users);
        }

        // Process subscriptions response
        try {
          let subscriptionsData;

          try {
            const text = await subscriptionsResponse.text();
            try {
              subscriptionsData = JSON.parse(text);
            } catch (jsonError) {
              console.error('Failed to parse subscriptions response as JSON:', text.substring(0, 100));
              throw new Error(`Invalid JSON response from subscriptions API: ${text.substring(0, 100)}...`);
            }
          } catch (parseError) {
            console.error('Error getting subscriptions response text:', parseError);
            throw new Error('Failed to get subscriptions API response text');
          }

          if (!subscriptionsData) {
            throw new Error('No data returned from subscriptions API');
          }

          if (subscriptionsResponse.ok && subscriptionsData.success) {
            console.log('Successfully fetched subscriptions:', subscriptionsData.subscriptions?.length || 0);

            // Ensure subscriptions is an array
            if (!Array.isArray(subscriptionsData.subscriptions)) {
              console.error('API returned non-array subscriptions:', subscriptionsData.subscriptions);
              throw new Error('Invalid subscriptions data format');
            }

            setSubscriptions(subscriptionsData.subscriptions || []);

            // Check if using mock data
            if (subscriptionsData.source === 'mock') {
              console.log('Using mock data for subscriptions:', subscriptionsData.note || '');
            }
          } else {
            // Handle API error
            let errorMsg = 'Unknown error';
            if (subscriptionsData && typeof subscriptionsData === 'object') {
              errorMsg = subscriptionsData.error || 'API returned error without details';
            }

            console.warn('Subscriptions API returned error or unsuccessful response:', errorMsg);

            // If we have mock data despite the error, use it
            if (subscriptionsData.subscriptions && Array.isArray(subscriptionsData.subscriptions)) {
              setSubscriptions(subscriptionsData.subscriptions);
              console.log('Using fallback mock subscriptions data');
            } else {
              // Fallback to empty array
              setSubscriptions([]);
              setError(`Failed to fetch subscriptions: ${errorMsg}`);
            }
          }
        } catch (subscriptionsError) {
          // Handle any errors in the fetch process
          const errorMessage = subscriptionsError instanceof Error ? subscriptionsError.message : 'Unknown error';
          console.warn('Error processing subscriptions response:', errorMessage);

          // Generate mock data for fallback
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

          setSubscriptions(mockSubscriptions);
          console.log('Using client-side generated mock subscriptions data');
          setError(`Failed to fetch subscriptions: ${errorMessage}`);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');

        // Fallback to mock data
        setAllUsers(users);
        setSubscriptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, roleFilter, statusFilter]);

  // Filter users based on search query, role, and status
  const filteredUsers = allUsers.filter(user => {
    // Filter by role
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }

    // Filter by status
    if (statusFilter !== 'all' && user.status !== statusFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Handle status update
  const handleStatusUpdate = (userId: string, newStatus: 'active' | 'inactive') => {
    setIsUpdating(true);

    // Simulate API call
    setTimeout(() => {
      setAllUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, status: newStatus }
            : user
        )
      );
      setIsUpdating(false);
    }, 1000);
  };

  if (isLoading) {
    return <PageLoading message="Loading users..." />;
  }

  // Filter subscriptions based on search query and status
  const filteredSubscriptions = subscriptions.filter(subscription => {
    // Filter by status
    if (statusFilter !== 'all' && subscription.status !== statusFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        subscription.fullName?.toLowerCase().includes(query) ||
        subscription.email.toLowerCase().includes(query) ||
        subscription.plan?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div>
      <AdminHeader title={activeTab === 'users' ? "Manage Users" : "Manage Subscriptions"} user={null} />
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

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subscriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Subscriptions
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search users..."
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

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="flex gap-2 mr-4">
              <Button
                variant={roleFilter === 'all' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('all')}
              >
                All Roles
              </Button>
              <Button
                variant={roleFilter === 'admin' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('admin')}
              >
                Admin
              </Button>
              <Button
                variant={roleFilter === 'employer' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('employer')}
              >
                Employer
              </Button>
              <Button
                variant={roleFilter === 'jobseeker' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('jobseeker')}
              >
                Job Seeker
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All Status
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>

        {activeTab === 'users' ? (
          /* Users Table */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {user.name.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'employer' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(user.id, user.status === 'active' ? 'inactive' : 'active')}
                              isLoading={isUpdating}
                              className={user.status === 'active' ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-green-600 border-green-300 hover:bg-green-50'}
                            >
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Link href={`/admin/users/${user.id}`} className="text-blue-600 hover:text-blue-900 text-sm">
                              Edit
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
                <p className="text-gray-500 mb-4">No users found matching your criteria.</p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setRoleFilter('all'); setStatusFilter('all'); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Subscriptions Table */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredSubscriptions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-0">
                              <div className="text-sm font-medium text-gray-900">{subscription.fullName || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{subscription.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            subscription.plan === 'basic' ? 'bg-blue-100 text-blue-800' :
                            subscription.plan === 'professional' ? 'bg-purple-100 text-purple-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                            {subscription.plan ? (subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{subscription.amount?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                            subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                            subscription.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                            subscription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {subscription.status
                              ? (subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1))
                              : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() :
                           subscription.createdAt ? new Date(subscription.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscription.paymentId || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No subscriptions found matching your criteria.</p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
