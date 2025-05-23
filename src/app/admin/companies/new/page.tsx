'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';

export default function NewCompanyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    industry: 'Technology',
    location: '',
    size: '',
    founded: '',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Industry options
  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Media',
    'Transportation',
    'Construction',
    'Energy',
    'Agriculture',
    'Hospitality',
    'Entertainment',
    'Real Estate',
    'Other'
  ];

  // Company size options
  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Upload to Cloudinary
      await uploadImage(file);
    } catch (error) {
      console.error('Failed to initiate upload:', error);
      // Still allow the user to see the preview and submit the form
      // The preview will be shown but the actual logo URL won't be set
      setError('Image upload service is not available. You can still create the company without a logo.');
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    // Declare interval variable in the outer scope so it can be cleared in any catch block
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (since fetch doesn't provide progress events)
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      try {
        // Upload to Cloudinary via our API
        let response;
        try {
          response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          clearInterval(progressInterval);

          // Handle non-OK responses
          if (!response.ok) {
            // Safely access response properties
            const status = response?.status || 'unknown';
            const statusText = response?.statusText || 'unknown';

            console.log('Upload API error:', status, statusText);
            let errorMessage = `Image upload failed: Server returned ${status}`;
            let isServiceUnavailable = status === 503;

            try {
              const errorData = await response.json();
              if (errorData && errorData.error) {
                errorMessage = `Image upload failed: ${errorData.error}`;
                console.log('Error details:', errorData);

                // Check if this is a configuration issue (service unavailable)
                if (typeof errorData.error === 'string' && (
                    errorData.error.includes('not available') ||
                    errorData.error.includes('not configured') ||
                    status === 503)) {
                  isServiceUnavailable = true;
                }
              }
            } catch (jsonError) {
              console.log('Could not parse error response as JSON');
            }

            if (isServiceUnavailable) {
              // For service unavailable errors, show a warning instead of an error
              // This allows the user to continue with form submission
              setWarning(`The image upload service is not available. You can still create the company without a logo.`);
              setError(null);
            } else {
              // For other errors, show an error but still let the user continue
              errorMessage += '. You can still create the company without a logo.';
              setError(errorMessage);
              setWarning(null);
            }

            setIsUploading(false);
            setUploadProgress(0);
            // Don't clear the logo preview - let the user see what they uploaded
            // even though it won't be saved
            return;
          }
        } catch (fetchError) {
          clearInterval(progressInterval);
          console.log('Network error during fetch:', fetchError);
          setWarning('Could not connect to the image upload service. You can still create the company without a logo.');
          setError(null);
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }

        // If we get here, we have a successful response

        try {
          const data = await response.json();
          if (data && data.success && data.url) {
            setForm(prev => ({ ...prev, logo: data.url }));
            setUploadProgress(100);

            // Reset progress after a delay
            setTimeout(() => {
              setUploadProgress(0);
              setIsUploading(false);
            }, 1000);
          } else {
            console.log('Invalid upload response:', data);
            setWarning('Invalid response from upload API. You can still create the company without a logo.');
            setError(null);
            setIsUploading(false);
            setUploadProgress(0);
            // Don't clear the logo preview - let the user see what they uploaded
            // even though it won't be saved
          }
        } catch (parseError) {
          console.log('Error parsing upload response:', parseError);
          setWarning('Could not process server response. You can still create the company without a logo.');
          setError(null);
          setIsUploading(false);
          setUploadProgress(0);
          // Don't clear the logo preview - let the user see what they uploaded
          // even though it won't be saved
        }
      } catch (fetchError: any) {
        clearInterval(progressInterval);
        console.log('Fetch error during upload:', fetchError);
        setWarning(`Network error during upload. You can still create the company without a logo.`);
        setError(null);
        setIsUploading(false);
        setUploadProgress(0);
        // Don't clear the logo preview - let the user see what they uploaded
        // even though it won't be saved
      }
    } catch (err: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      console.log('Upload error:', err);
      setWarning(`Upload failed. You can still create the company without a logo.`);
      setError(null);
      setIsUploading(false);
      setUploadProgress(0);
      // Don't clear the logo preview - let the user see what they uploaded
      // even though it won't be saved
    }
  };

  const handleRemoveImage = () => {
    setLogoPreview(null);
    setForm(prev => ({ ...prev, logo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setWarning(null);
    setSuccess(false);

    try {
      // Validate form
      if (!form.name) throw new Error('Company name is required');
      if (!form.description) throw new Error('Description is required');
      // Logo is optional
      if (!form.industry) throw new Error('Industry is required');
      if (!form.location) throw new Error('Location is required');

      // If logo upload failed but we have a preview, inform the user
      if (logoPreview && !form.logo) {
        console.warn('Logo preview exists but no logo URL is available. Using placeholder or empty string.');
        setWarning('The logo preview will not be saved because the image upload service is unavailable.');
      } else {
        setWarning(null);
      }

      // Use empty string for logo if upload failed
      const logoUrl = form.logo || '';

      // Submit to API
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          logo: logoUrl,
          founded: form.founded ? parseInt(form.founded) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create company');
      }

      const data = await response.json();
      console.log('Company created:', data);

      setSuccess(true);

      // Redirect after a delay
      setTimeout(() => {
        router.push('/admin/companies');
      }, 2000);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(`Failed to create company: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <AdminHeader title="Add New Company" user={null} />
      <main className="p-6">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/admin/companies">
              <Button variant="outline" size="sm">
                ← Back to Companies
              </Button>
            </Link>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-semibold">Company created successfully!</p>
              <p>Redirecting to companies list...</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Warning message */}
          {warning && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
              <p className="font-semibold">Warning</p>
              <p>{warning}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo (Optional)
                </label>
                <div className="flex items-center space-x-6">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        width={128}
                        height={128}
                        className="object-contain"
                      />
                    ) : (
                      <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <div className="flex flex-col space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      {logoPreview && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={handleRemoveImage}
                          disabled={isUploading}
                        >
                          Remove Logo
                        </Button>
                      )}
                    </div>
                    {isUploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadProgress < 100
                            ? `Uploading: ${Math.round(uploadProgress)}%`
                            : 'Upload complete!'}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: Square image, at least 200x200px. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Two-column layout for remaining fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Industry */}
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                    Industry *
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Company Size */}
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <select
                    id="size"
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select company size</option>
                    {companySizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                {/* Founded Year */}
                <div>
                  <label htmlFor="founded" className="block text-sm font-medium text-gray-700 mb-1">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    id="founded"
                    name="founded"
                    value={form.founded}
                    onChange={handleChange}
                    placeholder="e.g. 2010"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isSubmitting}
                  loadingText="Creating Company..."
                  disabled={isUploading}
                >
                  Create Company
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
