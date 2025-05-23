'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  updatedAt: string;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch company data
  useEffect(() => {
    const fetchCompany = async () => {
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

        // Fetch company
        console.log(`Fetching company with ID: ${companyId}`);
        const response = await fetch(`/api/companies/${companyId}`, { headers });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        console.log('Company data:', data);

        if (data.company) {
          setCompany(data.company);
        } else {
          setError('Company not found or invalid data format');
        }
      } catch (err: any) {
        console.error('Error fetching company:', err);
        setError('Failed to load company details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  const handleDelete = async () => {
    if (!company) return;
    
    setIsDeleting(true);
    
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

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Delete company
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete company');
      }

      // Redirect to companies list
      router.push('/admin/companies');
    } catch (err: any) {
      console.error('Error deleting company:', err);
      setError(`Failed to delete company: ${err.message}`);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <PageLoading message="Loading company details..." />;
  }

  if (!company) {
    return (
      <div>
        <AdminHeader title="Company Not Found" user={null} />
        <main className="p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Not Found</h2>
            <p className="text-gray-600 mb-6">The company you're looking for doesn't exist or has been removed.</p>
            <Link href="/admin/companies">
              <Button variant="primary">Back to Companies</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title={company.name} user={null} />
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/admin/companies">
              <Button variant="outline" size="sm">
                ← Back to Companies
              </Button>
            </Link>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Company Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="h-48 bg-gray-100 relative">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="p-6"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <svg className="h-24 w-24 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                  <p className="text-gray-600">{company.industry}</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <Link href={`/admin/companies/${companyId}/edit`}>
                    <Button variant="outline">
                      Edit Company
                    </Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                <p className="text-gray-900">{company.location}</p>
              </div>
              
              {company.website && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Website</h3>
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {company.website}
                  </a>
                </div>
              )}
              
              {company.size && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Company Size</h3>
                  <p className="text-gray-900">{company.size}</p>
                </div>
              )}
              
              {company.founded && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Founded</h3>
                  <p className="text-gray-900">{company.founded}</p>
                </div>
              )}
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Added On</h3>
                <p className="text-gray-900">{new Date(company.createdAt).toLocaleDateString()} at {new Date(company.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Company Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About {company.name}</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{company.description}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Company</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{company.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete Company
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
