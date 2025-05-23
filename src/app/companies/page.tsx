"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import PageLoading from '@/components/ui/PageLoading';

// Company interface
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

// Company Card Component
interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-6">
        <div className="flex items-center">
          {company.logo ? (
            <div className="h-16 w-16 relative mr-4">
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-full"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mr-4">
              <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
            <p className="text-sm text-gray-500">{company.industry} • {company.location}</p>
          </div>
        </div>

        <p className="mt-4 text-gray-600 line-clamp-3">{company.description || 'No description available.'}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {company.size ? (
              <span><span className="font-medium">{company.size}</span></span>
            ) : (
              <span>Company size not specified</span>
            )}
          </div>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 font-medium hover:text-blue-800"
            >
              Visit Website
            </a>
          )}
        </div>

        <div className="mt-6">
          <Link href={`/companies/${company._id}`}>
            <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
              View Company
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch companies
        console.log('Fetching companies...');
        const response = await fetch('/api/companies');

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
        console.log('Error fetching companies:', err);
        setError('Failed to load companies. Please try again.');
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Get unique industries for filter
  const industries = ['All', ...new Set(companies.map(company => company.industry))];

  // Filter companies based on search term and industry
  const filteredCompanies = companies.filter(company => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.description && company.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesIndustry = industryFilter === 'All' || company.industry === industryFilter;

    return matchesSearch && matchesIndustry;
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <PageLoading message="Loading companies..." />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <div className="bg-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Explore Top Companies
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl">
              Discover great places to work and find your next career opportunity.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search companies by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <select
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
        </div>
      )}

      {/* Companies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || industryFilter !== 'All'
                ? "Try adjusting your search or filter to find what you're looking for."
                : "No companies have been added yet. Check back later."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
