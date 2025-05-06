"use client";

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import PageLoading from '@/components/ui/PageLoading';
import Button from '@/components/ui/Button';
import { users, User } from '@/data/users';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setAllUsers(users);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  return (
    <div>
      <AdminHeader title="Manage Users" />
      <main className="p-6">
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
        
        {/* Users Table */}
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
      </main>
    </div>
  );
}
