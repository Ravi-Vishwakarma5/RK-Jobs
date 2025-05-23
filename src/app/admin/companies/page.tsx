'use client';

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import PageLoading from '@/components/ui/PageLoading';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { getAuthToken } from '@/app/uitlis/auth';

interface Company {
  _id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  industry: string;
  location: string;
  size: string;
  founded: number;
  createdAt: string;
}

export default function AdminCompaniesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
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

        // Fetch companies
        console.log('Fetching companies...');
        const response = await fetch('/api/companies', { headers });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        console.log('Companies data:', data);

        if (data.companies) {
          setCompanies(data.companies);
        } else {
          // If no companies or invalid format, use empty array
          setCompanies([]);
          setError('No companies found or invalid data format');
        }
      } catch (err: any) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies. Please try again.');
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filter companies based on search query
  const filteredCompanies = companies.filter(company => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      company.name.toLowerCase().includes(query) ||
      company.industry.toLowerCase().includes(query) ||
      company.location.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return <PageLoading message="Loading companies..." />;
  }

  return (
    <div>
      <AdminHeader title="Manage Companies" user={null} />
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

        {/* Header with search and add button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search companies..."
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

          <Link href="/admin/companies/new">
            <Button variant="primary">
              Add New Company
            </Button>
          </Link>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div key={company._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-40 bg-gray-100 relative">
                  {company.logo ? (
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="p-4"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{company.industry}</p>
                  <p className="text-sm text-gray-600 mb-3">{company.location}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Added: {new Date(company.createdAt).toLocaleDateString()}
                    </span>
                    <Link href={`/admin/companies/${company._id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Companies Found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? "No companies match your search criteria. Try a different search term."
                : "You haven't added any companies yet. Click the button below to add your first company."}
            </p>
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            ) : (
              <Link href="/admin/companies/new">
                <Button variant="primary">
                  Add New Company
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
