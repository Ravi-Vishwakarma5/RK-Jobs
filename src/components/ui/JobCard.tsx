"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from './Button';

export interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type?: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  description: string;
  postedDate: string;
  logo?: string;
  tags?: string[];
}

interface JobCardProps {
  job: JobPost;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-1">{job.title}</h3>
          <p className="text-gray-600 mb-2">{job.company}</p>
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <span className="mr-3">{job.location}</span>
            {job.type && <span className="mr-3">{job.type}</span>}
            {job.salary && <span>{job.salary}</span>}
          </div>

          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Posted {job.postedDate}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Save</Button>
              <a href={`/jobs/${job.id}`}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    console.log(`Navigating to job detail page: /jobs/${job.id}`);
                    // Use window.location for direct navigation
                    window.location.href = `/jobs/${job.id}`;
                  }}
                >
                  Apply
                </Button>
              </a>
            </div>
          </div>
        </div>

        {job.logo && (
          <div className="ml-4">
            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
              <Image src={job.logo} alt={`${job.company} logo`} className="max-w-full max-h-full" width={64} height={64} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
