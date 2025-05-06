"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { jobPosts } from '@/data/jobPosts';
import ApplicationForm from '@/components/forms/ApplicationForm';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Find the job post with the matching ID
  const job = jobPosts.find(job => job.id === jobId);

  // If job not found, show a message
  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/jobs">
            <Button variant="primary">Browse All Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Job Detail */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Job Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <span className="mr-4">{job.company}</span>
                    <span className="mr-4">{job.location}</span>
                    {job.type && <span className="mr-4">{job.type}</span>}
                    {job.salary && <span>{job.salary}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.tags && job.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {job.logo && (
                  <div className="ml-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                      <Image src={job.logo} alt={`${job.company} logo`} className="max-w-full max-h-full" width={80} height={80} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Actions */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  onClick={() => setShowApplicationForm(!showApplicationForm)}
                >
                  {showApplicationForm ? 'Hide Application Form' : 'Apply Now'}
                </Button>
                <Button variant="outline">Save Job</Button>
                <Button variant="outline">Share</Button>
              </div>
            </div>

            {/* Job Description */}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-700 mb-6">{job.description}</p>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-2">
                <li>5+ years of experience in frontend development</li>
                <li>Strong proficiency in JavaScript, HTML, and CSS</li>
                <li>Experience with React and modern frontend frameworks</li>
                <li>Understanding of responsive design principles</li>
                <li>Knowledge of version control systems (Git)</li>
                <li>Excellent problem-solving skills</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
              <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-2">
                <li>Develop and maintain user interfaces for web applications</li>
                <li>Collaborate with designers to implement visual elements</li>
                <li>Ensure cross-browser compatibility and responsive design</li>
                <li>Optimize applications for maximum speed and scalability</li>
                <li>Participate in code reviews and team discussions</li>
                <li>Stay up-to-date with emerging trends and technologies</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
              <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-2">
                <li>Competitive salary and equity options</li>
                <li>Health, dental, and vision insurance</li>
                <li>Flexible work hours and remote work options</li>
                <li>Professional development budget</li>
                <li>Paid time off and parental leave</li>
                <li>Modern office with snacks and beverages</li>
              </ul>
            </div>

            {/* Application Form */}
            {showApplicationForm && (
              <div className="p-6 bg-blue-50 border-t border-blue-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for this position</h2>
                <p className="text-gray-700 mb-6">
                  Please fill out the form below to apply for this position.
                </p>
                <ApplicationForm job={job} />
              </div>
            )}

            {/* Apply Section - shown only when form is hidden */}
            {!showApplicationForm && (
              <div className="p-6 bg-blue-50 border-t border-blue-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for this position</h2>
                <p className="text-gray-700 mb-6">
                  Ready to apply for this position? Click the button below to submit your application.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowApplicationForm(true)}
                >
                  Apply Now
                </Button>
              </div>
            )}
          </div>

          {/* Similar Jobs */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Similar Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobPosts
                .filter(j => j.id !== job.id)
                .slice(0, 2)
                .map(similarJob => (
                  <div key={similarJob.id} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{similarJob.title}</h3>
                    <p className="text-gray-600 mb-2">{similarJob.company}</p>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <span className="mr-3">{similarJob.location}</span>
                      {similarJob.type && <span>{similarJob.type}</span>}
                    </div>
                    <Link href={`/jobs/${similarJob.id}`}>
                      <Button variant="outline" size="sm">View Job</Button>
                    </Link>
                  </div>
                ))}
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
