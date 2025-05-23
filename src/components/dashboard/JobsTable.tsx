"use client";

import React from 'react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  status?: 'applied' | 'interview' | 'offer' | 'rejected' | 'saved';
  date: string;
}

interface JobsTableProps {
  jobs: Job[];
  type: 'applications' | 'saved';
  onRemove?: (jobId: string) => void;
  removingJobId?: string | null;
}

const JobsTable: React.FC<JobsTableProps> = ({ jobs, type, onRemove, removingJobId }) => {
  const statusColors = {
    applied: 'bg-blue-100 text-blue-800',
    interview: 'bg-yellow-100 text-yellow-800',
    offer: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    saved: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Job Title
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Company
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Location
            </th>
            {type === 'applications' && (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            )}
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{job.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{job.company}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{job.location}</div>
              </td>
              {type === 'applications' && job.status && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[job.status]
                    }`}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {job.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-4">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-blue-600 hover:text-blue-900"
                    onClick={(e) => {
                      console.log(`Navigating to job detail: /jobs/${job.id}`);
                      // Use direct navigation to avoid routing issues
                      e.preventDefault();
                      window.location.href = `/jobs/${job.id}`;
                    }}
                  >
                    View
                  </Link>

                  {type === 'saved' && onRemove && (
                    <button
                      onClick={() => onRemove(job.id)}
                      className="text-red-600 hover:text-red-900 flex items-center"
                      disabled={removingJobId === job.id}
                    >
                      {removingJobId === job.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Removing...
                        </>
                      ) : (
                        'Remove'
                      )}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobsTable;
