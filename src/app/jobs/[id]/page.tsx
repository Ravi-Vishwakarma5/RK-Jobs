"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { jobPosts } from '@/data/jobPosts';
import ApplicationForm from '@/components/forms/ApplicationForm';
import PageLoading from '@/components/ui/PageLoading';
import { isValidObjectId } from '@/app/uitlis/helpers/jobConverter';
import { saveJob, isJobSaved, removeSavedJob, fetchSavedJobs } from '@/app/uitlis/savedJobs';
import { isAuthenticated } from '@/app/uitlis/auth';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [job, setJob] = useState<typeof jobPosts[0] | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const shareUrlRef = useRef<HTMLInputElement>(null);

  // Log the job ID for debugging
  console.log('Job Detail Page - Job ID from params:', jobId);
  console.log('Job Detail Page - Full params:', params);

  // Check if user is authenticated
  useEffect(() => {
    const authStatus = isAuthenticated();
    setIsUserAuthenticated(authStatus);
  }, []);

  // Check if job is saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        if (isUserAuthenticated) {
          console.log(`Checking if job ${jobId} is saved...`);
          setIsSaving(true);

          // Fetch saved jobs and check if this job is saved
          const savedJobs = await fetchSavedJobs();
          const savedStatus = savedJobs.some(job => job.id === jobId);

          console.log(`Job ${jobId} saved status:`, savedStatus);
          setIsSaved(savedStatus);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      } finally {
        setIsSaving(false);
      }
    };

    if (isUserAuthenticated) {
      checkSavedStatus();
    }
  }, [jobId, isUserAuthenticated]);

  // Load job data
  useEffect(() => {
    const loadJob = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching job with ID: ${jobId}`);

        // Check if this is a MongoDB ObjectId
        const isMongoId = isValidObjectId(jobId);
        console.log(`Is MongoDB ObjectId: ${isMongoId}`);

        // Try to fetch from main API first
        try {
          console.log(`Fetching from API: /api/jobs/${jobId}`);
          const response = await fetch(`/api/jobs/${jobId}`, {
            cache: 'no-store' // Disable caching to always get fresh data
          });

          console.log('API response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('Job data received:', data);

            if (data.job) {
              console.log(`Job found: ${data.job.title} (source: ${data.source})`);
              console.log('Job ID:', data.job.id);

              // Ensure the job has an ID
              if (!data.job.id) {
                console.warn('Job is missing ID, adding jobId from URL params');
                data.job.id = jobId;
              }

              // For MongoDB jobs, ensure all required fields are present
              if (isMongoId || data.source === 'database') {
                // Make sure the job has all the fields needed by the UI
                if (!data.job.tags && Array.isArray(data.job.requirements)) {
                  // Create tags from requirements if missing
                  data.job.tags = data.job.requirements.slice(0, 4).map((req: string) => {
                    // Extract first few words for tags
                    return req.split(' ').slice(0, 3).join(' ');
                  });
                }

                // Ensure description is a string
                if (Array.isArray(data.job.description)) {
                  data.job.description = data.job.description.join(' ');
                }
              }

              setJob(data.job);
              return; // Exit early if job is found
            }
          } else {
            console.error('API error:', response.status);
            // Continue to fallback
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError);
          // Continue to fallback
        }

        // Try the test API endpoint as a second fallback
        try {
          console.log('Trying test API endpoint...');
          const testResponse = await fetch(`/api/test-job/${jobId}`, {
            cache: 'no-store'
          });

          console.log('Test API response status:', testResponse.status);

          if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log('Test job data received:', testData);

            if (testData.job) {
              console.log(`Job found in test API: ${testData.job.title}`);
              console.log('Test job ID:', testData.job.id);

              // Ensure the job has an ID
              if (!testData.job.id) {
                console.warn('Test job is missing ID, adding jobId from URL params');
                testData.job.id = jobId;
              }

              setJob(testData.job);
              return; // Exit early if job is found
            }
          } else {
            console.error('Test API error:', testResponse.status);
            // Continue to final fallback
          }
        } catch (testApiError) {
          console.error('Test API fetch error:', testApiError);
          // Continue to final fallback
        }

        // Fallback to static data if API fails
        console.log('Falling back to static data');
        const foundJob = jobPosts.find(j => j.id === jobId);

        if (foundJob) {
          console.log(`Job found in static data: ${foundJob.title}`);
          console.log('Static job ID:', foundJob.id);

          // Ensure the job has an ID
          if (!foundJob.id) {
            console.warn('Static job is missing ID, adding jobId from URL params');
            foundJob.id = jobId;
          }

          setJob(foundJob);
        } else {
          console.error(`Job with ID ${jobId} not found in any data source`);

          // Create a minimal job object with the ID from the URL
          console.warn('Creating minimal job object with ID from URL');
          const minimalJob = {
            id: jobId,
            title: 'Job Details',
            company: 'Unknown Company',
            location: 'Unknown Location',
            description: 'No description available',
            postedDate: new Date().toLocaleDateString()
          };

          setJob(minimalJob as any);
        }
      } catch (error) {
        console.error('Error loading job:', error);
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  // Handle save/unsave job
  const handleSaveJob = async () => {
    if (!isUserAuthenticated) {
      // Redirect to login page
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    setIsSaving(true);
    try {
      console.log(`${isSaved ? 'Unsaving' : 'Saving'} job ${jobId}`);

      if (isSaved) {
        // Unsave job
        console.log('Removing saved job...');
        const success = await removeSavedJob(jobId);
        console.log('Remove job result:', success);

        if (success) {
          console.log('Job unsaved successfully');
          setIsSaved(false);
        } else {
          console.error('Failed to unsave job');
        }
      } else {
        // Save job
        if (job) {
          console.log('Saving job...');
          const success = await saveJob({
            id: jobId,
            title: job.title,
            company: job.company,
            location: job.location,
            date: new Date().toISOString()
          });
          console.log('Save job result:', success);

          if (success) {
            console.log('Job saved successfully');
            setIsSaved(true);
          } else {
            console.error('Failed to save job');
          }
        } else {
          console.error('Cannot save job: job data not available');
        }
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle successful application submission
  const handleApplicationSuccess = (applicationId: string) => {
    setApplicationSubmitted(true);
    // Redirect to success page
    router.push(`/jobs/${jobId}/application-success?applicationId=${applicationId}`);
  };

  // Handle share job
  const handleShareJob = () => {
    setShowShareModal(true);
    setShareSuccess(false);
  };

  // Handle copy to clipboard
  const handleCopyLink = () => {
    if (shareUrlRef.current) {
      shareUrlRef.current.select();
      document.execCommand('copy');
      setShareSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setShareSuccess(false);
      }, 3000);
    }
  };

  // Handle share via social media
  const handleShareSocial = (platform: string) => {
    const jobUrl = typeof window !== 'undefined' ? window.location.href : '';
    const jobTitle = job?.title || 'Job Opening';
    const jobCompany = job?.company || 'Company';
    const shareText = `Check out this job: ${jobTitle} at ${jobCompany}`;

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(jobUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + jobUrl)}`;
        break;
      default:
        break;
    }

    if (shareUrl && typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Show loading state
  if (isLoading) {
    return <PageLoading message="Loading job details..." />;
  }

  // If job not found, show a message
  if (!job) {
    const isMongoId = isValidObjectId(jobId);

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>

          {/* Debug information */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-700 mb-2"><strong>Debug Info:</strong></p>
            <p className="text-sm text-gray-700 mb-1">Job ID: {jobId}</p>
            <p className="text-sm text-gray-700 mb-1">Is MongoDB ID: {isMongoId ? 'Yes' : 'No'}</p>

            {isMongoId ? (
              <>
                <p className="text-sm text-gray-700 mb-1">This appears to be a MongoDB ObjectId.</p>
                <p className="text-sm text-gray-700 mb-1">Possible issues:</p>
                <ul className="text-sm text-gray-700 list-disc pl-5 mb-1">
                  <li>The job may have been deleted from the database</li>
                  <li>There might be a database connection issue</li>
                  <li>The job ID might be incorrect</li>
                </ul>
              </>
            ) : (
              <p className="text-sm text-gray-700 mb-1">Available IDs in static data: 1-8</p>
            )}

            <p className="text-sm text-gray-700">Make sure you&apos;re using a valid job ID from the home page.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/home">
              <Button variant="primary">Go to Home Page</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="outline">Browse All Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                  isLoading={applicationSubmitted}
                  loadingText="Processing..."
                >
                  {showApplicationForm ? 'Hide Application Form' : 'Apply Now'}
                </Button>
                <Button
                  variant={isSaved ? "secondary" : "outline"}
                  onClick={handleSaveJob}
                  isLoading={isSaving}
                  loadingText="Processing..."
                >
                  {isSaved ? 'Saved' : 'Save Job'}
                </Button>
                <Link href={`/jobs/company/${encodeURIComponent(job.company)}`}>
                  <Button variant="outline">
                    More Jobs at {job.company}
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleShareJob}>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </span>
                </Button>
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
                <ApplicationForm job={job} onSuccess={handleApplicationSuccess} />
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
                  isLoading={applicationSubmitted}
                  loadingText="Processing..."
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log(`Navigating to similar job: /jobs/${similarJob.id}`);
                        window.location.href = `/jobs/${similarJob.id}`;
                      }}
                    >
                      View Job
                    </Button>
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Share this job</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">Copy link</p>
              <div className="flex">
                <input
                  ref={shareUrlRef}
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
              {shareSuccess && (
                <p className="text-green-600 text-sm mt-1">Link copied to clipboard!</p>
              )}
            </div>

            <div>
              <p className="text-gray-600 mb-3">Share on social media</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleShareSocial('facebook')}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShareSocial('twitter')}
                  className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShareSocial('linkedin')}
                  className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShareSocial('whatsapp')}
                  className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                  aria-label="Share on WhatsApp"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
