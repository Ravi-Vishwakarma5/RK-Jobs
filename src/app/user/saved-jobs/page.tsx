import React from 'react';
import Header from '@/components/dashboard/Header';
import JobsTable from '@/components/dashboard/JobsTable';
import Button from '@/components/ui/Button';

// Mock data for saved jobs
const savedJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    date: '2025-05-03',
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    company: 'Design Studio',
    location: 'Remote',
    date: '2025-05-02',
  },
  {
    id: '3',
    title: 'React Developer',
    company: 'Startup Inc.',
    location: 'New York, NY',
    date: '2025-04-30',
  },
  {
    id: '4',
    title: 'Frontend Engineer',
    company: 'Big Tech Co.',
    location: 'Seattle, WA',
    date: '2025-04-28',
  },
  {
    id: '5',
    title: 'JavaScript Developer',
    company: 'Web Solutions',
    location: 'Austin, TX',
    date: '2025-04-25',
  },
];

export default function SavedJobsPage() {
  return (
    <div>
      <Header title="Saved Jobs" />
      <main className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-medium text-gray-900">All Saved Jobs</h2>
            <p className="text-gray-500">Jobs you&apos;ve saved for later</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline">Filter</Button>
            <Button variant="primary">Browse Jobs</Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <Button variant="secondary" size="sm">
                  All
                </Button>
                <Button variant="ghost" size="sm">
                  Recent
                </Button>
                <Button variant="ghost" size="sm">
                  Remote
                </Button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search saved jobs..."
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <JobsTable jobs={savedJobs} type="saved" />
        </div>
      </main>
    </div>
  );
}
