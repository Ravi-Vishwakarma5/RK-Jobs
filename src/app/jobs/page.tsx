import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import JobCard from '@/components/ui/JobCard';
import Button from '@/components/ui/Button';
import { jobPosts } from '@/data/jobPosts';

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image
                className="dark:invert"
                src="/next.svg"
                alt="Job Portal Logo"
                width={120}
                height={30}
                priority
              />
            </Link>
            <nav className="ml-10 space-x-8 hidden md:flex">
              <Link href="/" className="text-gray-500 hover:text-gray-900">Home</Link>
              <Link href="/jobs" className="text-blue-600 font-medium">Browse Jobs</Link>
              <Link href="/companies" className="text-gray-500 hover:text-gray-900">Companies</Link>
              <Link href="/about" className="text-gray-500 hover:text-gray-900">About</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/user" 
              className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              User Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-blue-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Job title, keywords, or company" 
                className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="text" 
                placeholder="Location" 
                className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button variant="primary" size="lg">
                Search Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Job Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Job Type</h3>
                  <div className="space-y-2">
                    {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map((type) => (
                      <div key={type} className="flex items-center">
                        <input 
                          id={`job-type-${type}`} 
                          type="checkbox" 
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`job-type-${type}`} className="ml-2 text-sm text-gray-700">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h3>
                  <div className="space-y-2">
                    {['Entry Level', 'Mid Level', 'Senior Level', 'Director', 'Executive'].map((level) => (
                      <div key={level} className="flex items-center">
                        <input 
                          id={`exp-level-${level}`} 
                          type="checkbox" 
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`exp-level-${level}`} className="ml-2 text-sm text-gray-700">
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Salary Range</h3>
                  <div className="space-y-2">
                    {['$0 - $50,000', '$50,000 - $100,000', '$100,000 - $150,000', '$150,000+'].map((range) => (
                      <div key={range} className="flex items-center">
                        <input 
                          id={`salary-${range}`} 
                          type="checkbox" 
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`salary-${range}`} className="ml-2 text-sm text-gray-700">
                          {range}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Button variant="outline" className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Job Listings */}
            <div className="w-full lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">All Jobs</h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                  <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Most Relevant</option>
                    <option>Newest</option>
                    <option>Salary: High to Low</option>
                    <option>Salary: Low to High</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-6">
                {jobPosts.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center">
                  <Button variant="outline" size="sm" className="mr-2">
                    Previous
                  </Button>
                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      key={page}
                      className={`px-3 py-1 mx-1 rounded-md ${
                        page === 1 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <Button variant="outline" size="sm" className="ml-2">
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Job Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
