'use client';

import { useState } from 'react';

export default function CreateJobPage() {
  const [form, setForm] = useState({
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    jobType: 'Part-Remote',
    salary: '$120,000 - $150,000',
    logo: '',
    description: [
      'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building user interfaces using React, TypeScript, and modern CSS frameworks.'
    ],
    requirements: [
      '5+ years of experience in frontend development',
      'Strong proficiency in JavaScript, HTML, and CSS',
      'Experience with React and modern frontend frameworks',
      'Understanding of responsive design principles',
      'Knowledge of version control systems (Git)',
      'Excellent problem-solving skills',
    ],
    responsibilities: [
      'Develop and maintain user interfaces for web applications',
      'Collaborate with designers to implement visual elements',
      'Ensure cross-browser compatibility and responsive design',
      'Optimize applications for speed and scalability',
      'Participate in code reviews and team discussions',
      'Stay updated with emerging trends and technologies',
    ],
    benefits: [
      'Competitive salary and equity options',
      'Health, dental, and vision insurance',
      'Flexible work hours and remote work options',
      'Professional development budget',
      'Paid time off and parental leave',
      'Modern office with snacks and beverages',
    ],
  });

  // State for loading and error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [usedMockApi, setUsedMockApi] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const clearField = (name: string) => {
    setForm(prev => ({ ...prev, [name]: '' }));
  };

  const handleArrayChange = (name: string, index: number, value: string) => {
    const updated = [...(form[name as keyof typeof form] as string[])];
    updated[index] = value;
    setForm(prev => ({ ...prev, [name]: updated }));
  };

  const addArrayItem = (name: string) => {
    setForm(prev => ({
      ...prev,
      [name]: [...(prev[name as keyof typeof form] as string[]), ''],
    }));
  };

  const removeArrayItem = (name: string, index: number) => {
    const updated = [...(form[name as keyof typeof form] as string[])];
    updated.splice(index, 1);
    setForm(prev => ({ ...prev, [name]: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Validate form data
      const requiredFields = ['title', 'company', 'location', 'jobType', 'salary'];
      for (const field of requiredFields) {
        if (!form[field as keyof typeof form]) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
      }

      // Validate arrays
      const arrayFields = ['description', 'requirements', 'responsibilities', 'benefits'];
      for (const field of arrayFields) {
        const array = form[field as keyof typeof form] as string[];
        if (!array || array.length === 0 || !array.some(item => item.trim())) {
          throw new Error(`At least one ${field} is required`);
        }
      }

      console.log('Sending job data to API...');

      let res;
      let data;
      let usedFallback = false;

      try {
        // Try the main API endpoint first
        console.log('Trying primary API endpoint...');
        res = await fetch('/api/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });

        console.log('Primary API response status:', res.status);

        // Check if response is JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response received from primary endpoint:', contentType);
          // Try to get the response text for debugging
          const responseText = await res.text();
          console.error('Response text (first 500 chars):', responseText.substring(0, 500));
          throw new Error(`Server returned non-JSON response (${res.status})`);
        }

        // Parse the response
        data = await res.json();
        console.log('Primary API response data:', data);

        // Check if the response indicates an error
        if (!res.ok) {
          throw new Error(data.message || data.error || `Server returned ${res.status}`);
        }
      } catch (primaryError) {
        console.error('Primary API endpoint failed:', primaryError);

        // Try the fallback mock endpoint
        console.log('Trying fallback mock API endpoint...');
        try {
          res = await fetch('/api/mock-job', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          });

          console.log('Fallback API response status:', res.status);

          // Check if response is JSON
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Non-JSON response received from fallback endpoint:', contentType);
            throw new Error('Both primary and fallback endpoints failed');
          }

          // Parse the response
          data = await res.json();
          console.log('Fallback API response data:', data);

          // Check if the response indicates an error
          if (!res.ok) {
            throw new Error(data.message || data.error || `Fallback server returned ${res.status}`);
          }

          usedFallback = true;
        } catch (fallbackError) {
          console.error('Fallback API endpoint also failed:', fallbackError);
          throw new Error('Both primary and fallback endpoints failed. Please check server logs.');
        }
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Something went wrong');
      }

      // Success!
      setSubmitSuccess(true);
      console.log('Job posted successfully:', data);

      // Update state to show whether the fallback was used
      setUsedMockApi(usedFallback);

      // Reset form or redirect
      // setForm({ ... }); // Reset form if needed

    } catch (err: any) {
      console.error('Error posting job:', err);
      setSubmitError(err.message || 'Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderClearableInput = (name: keyof typeof form, placeholder: string) => (
    <div className="relative">
      <input
        type="text"
        name={name}
        value={form[name] as string}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-2 pr-10 border rounded"
      />
      {(form[name] as string) && (
        <button
          type="button"
          onClick={() => clearField(name)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
        >
          ❌
        </button>
      )}
    </div>
  );

  // Function to test API connectivity
  const testApiConnection = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      console.log('Testing API connection...');
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
      });

      console.log('Test API response status:', res.status);

      const data = await res.json();
      console.log('Test API response:', data);

      alert('API test successful! Check console for details.');
    } catch (error: any) {
      console.error('API test error:', error);
      setSubmitError('API test failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Create New Job</h1>

      {/* Debug button */}
      <div className="mb-4 text-right">
        <button
          type="button"
          onClick={testApiConnection}
          className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-2 rounded"
        >
          Test API Connection
        </button>
      </div>

      {/* Success message */}
      {submitSuccess && (
        <div className={`mb-6 ${usedMockApi ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-green-50 border-green-200 text-green-700'} border px-4 py-3 rounded`}>
          <p className="font-semibold">Job posted successfully!</p>
          {usedMockApi ? (
            <>
              <p>Your job listing has been created in mock mode.</p>
              <p className="text-sm mt-1">Note: MongoDB connection failed, but your job was saved in memory for testing purposes.</p>
            </>
          ) : (
            <p>Your job listing has been created and is now live.</p>
          )}
        </div>
      )}

      {/* Error message */}
      {submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Error posting job</p>
          <p>{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {renderClearableInput('title', 'Job Title')}
        {renderClearableInput('company', 'Company Name')}
        {renderClearableInput('location', 'Location')}
        {renderClearableInput('salary', 'Salary Range')}
        {renderClearableInput('logo', 'Logo URL (optional)')}

        <select
          name="jobType"
          value={form.jobType}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Remote">Remote</option>
          <option value="Part-Remote">Part-Remote</option>
          <option value="Contract">Contract</option>
        </select>

        {['description', 'requirements', 'responsibilities', 'benefits'].map((field) => (
          <div key={field}>
            <label className="block font-semibold mt-6 capitalize">{field}</label>
            {(form as any)[field].map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <textarea
                  value={item}
                  onChange={(e) => handleArrayChange(field, idx, e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem(field, idx)}
                  className="text-red-500 font-bold"
                >
                  ❌
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem(field)}
              className="text-blue-600 text-sm"
            >
              + Add {field.slice(0, -1)}
            </button>
          </div>
        ))}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${
            isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-semibold py-2 rounded mt-6 flex items-center justify-center`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Posting Job...
            </>
          ) : (
            'Post Job'
          )}
        </button>
      </form>
    </div>
  );
}
