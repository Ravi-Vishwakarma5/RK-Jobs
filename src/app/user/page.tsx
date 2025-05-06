import React from 'react';
import Header from '@/components/dashboard/Header';
import DashboardCard from '@/components/dashboard/DashboardCard';
import JobsTable from '@/components/dashboard/JobsTable';
import Button from '@/components/ui/Button';
import Link from 'next/link';

// Mock data for the dashboard
const recentApplications = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'Tech Solutions Inc.',
    location: 'New York, NY',
    status: 'applied',
    date: '2025-05-01',
  },
  {
    id: '2',
    title: 'UX Designer',
    company: 'Creative Designs',
    location: 'Remote',
    status: 'interview',
    date: '2025-04-28',
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Web Innovations',
    location: 'San Francisco, CA',
    status: 'rejected',
    date: '2025-04-15',
  },
];

export default function UserDashboard() {
  return (
    <div>
      <Header title="Dashboard" />
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Applications"
            value="12"
            color="blue"
            linkText="View all applications"
            linkHref="/user/applications"
          />
          <DashboardCard
            title="Interviews"
            value="3"
            color="yellow"
            linkText="View interviews"
            linkHref="/user/applications"
          />
          <DashboardCard
            title="Offers"
            value="1"
            color="green"
            linkText="View offers"
            linkHref="/user/applications"
          />
          <DashboardCard
            title="Saved Jobs"
            value="8"
            color="purple"
            linkText="View saved jobs"
            linkHref="/user/saved-jobs"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
            <Link href="/user/applications">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <JobsTable jobs={recentApplications} type="applications" />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recommended Jobs</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <p className="text-gray-500">Based on your profile and preferences</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">Senior Frontend Developer</h3>
              <p className="text-sm text-gray-500">TechCorp • San Francisco, CA</p>
              <p className="text-sm text-gray-500 mt-2">$120,000 - $150,000</p>
              <div className="mt-4 flex justify-end">
                <Button variant="primary" size="sm">
                  Apply Now
                </Button>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">UI/UX Designer</h3>
              <p className="text-sm text-gray-500">Design Studio • Remote</p>
              <p className="text-sm text-gray-500 mt-2">$90,000 - $110,000</p>
              <div className="mt-4 flex justify-end">
                <Button variant="primary" size="sm">
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
