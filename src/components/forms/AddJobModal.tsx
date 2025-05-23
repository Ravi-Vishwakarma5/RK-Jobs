'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { getAuthToken } from '@/app/uitlis/auth';

interface AddJobModalProps {
  companyId: string;
  companyName: string;
  companyLocation: string;
  companyIndustry: string;
  companyLogo?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({
  companyId,
  companyName,
  companyLocation,
  companyIndustry,
  companyLogo,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    jobType: 'Full-time',
    category: companyIndustry,
    salary: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Get auth token
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Format data for API
      const jobData = {
        ...formData,
        company: companyName,
        location: companyLocation,
        logo: companyLogo || '',
        // Convert text areas to arrays
        description: formData.description.split('\n').filter(line => line.trim() !== ''),
        requirements: formData.requirements.split('\n').filter(line => line.trim() !== ''),
        responsibilities: formData.responsibilities.split('\n').filter(line => line.trim() !== ''),
        benefits: formData.benefits.split('\n').filter(line => line.trim() !== '')
      };

      // Call API to create job
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
      } else {
        // Handle different types of error responses
        if (data.validationErrors) {
          // Format validation errors
          const errorMessages = Object.entries(data.validationErrors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(', ');
          setError(`Validation failed: ${errorMessages}`);
        } else if (data.details) {
          setError(`${data.error}: ${data.details}`);
        } else {
          setError(data.error || 'Failed to create job position');
        }

        // Log the error for debugging
        console.error('Job creation error:', data);
      }
    } catch (err: any) {
      console.error('Error creating job:', err);
      setError('An error occurred while creating the job position');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Add Job Position for {companyName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">Job Type *</label>
                <select
                  id="jobType"
                  name="jobType"
                  required
                  value={formData.jobType}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Internship">Internship</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary *</label>
              <input
                type="text"
                id="salary"
                name="salary"
                required
                placeholder="e.g. $50,000 - $70,000/year or $25/hour"
                value={formData.salary}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description * <span className="text-xs text-gray-500">(Enter each point on a new line)</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter job description points, one per line"
              ></textarea>
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Requirements * <span className="text-xs text-gray-500">(Enter each point on a new line)</span>
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={4}
                required
                value={formData.requirements}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter job requirements, one per line"
              ></textarea>
            </div>

            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700">
                Responsibilities * <span className="text-xs text-gray-500">(Enter each point on a new line)</span>
              </label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                rows={4}
                required
                value={formData.responsibilities}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter job responsibilities, one per line"
              ></textarea>
            </div>

            <div>
              <label htmlFor="benefits" className="block text-sm font-medium text-gray-700">
                Benefits * <span className="text-xs text-gray-500">(Enter each point on a new line)</span>
              </label>
              <textarea
                id="benefits"
                name="benefits"
                rows={4}
                required
                value={formData.benefits}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter job benefits, one per line"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              loadingText="Creating..."
              disabled={isLoading}
            >
              Create Job Position
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobModal;
