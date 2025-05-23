"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface AdminHeaderProps {
  title: string;
  user?: any;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <div className="relative">
            <button
              className="flex items-center text-gray-700 hover:text-gray-900"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </span>
              <span className="ml-2">{user?.name || 'Admin'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </Link>
                <div className="border-t border-gray-100"></div>
                <Link
                  href="/admin/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => {
                    e.preventDefault();
                    // Clear both authentication methods
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('authToken');
                      localStorage.removeItem('currentUser');
                    }
                    window.location.href = '/admin/login';
                  }}
                >
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
