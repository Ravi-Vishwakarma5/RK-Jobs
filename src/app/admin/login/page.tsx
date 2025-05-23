"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import FormLoader from '@/components/ui/FormLoader';
import { getCurrentUser } from '@/app/uitlis/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Check if user is already logged in as admin
  useEffect(() => {
    try {
      // Clear any existing login error
      setLoginError(null);

      // Get auth token
      const token = localStorage.getItem('authToken');

      // If no token, stay on login page
      if (!token) {
        console.log('No auth token found, staying on login page');
        return;
      }

      // Get user data
      const user = getCurrentUser();

      // If no user data or user is not admin, clear token and stay on login page
      if (!user) {
        console.log('No user data found, clearing token');
        localStorage.removeItem('authToken');
        return;
      }

      // Check if user is admin
      if (!user.isAdmin) {
        console.log('User is not an admin, clearing token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        return;
      }

      // Check if token is valid (not expired)
      if (token) {
        try {
          // Decode token to check expiration
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );

          const decodedToken = JSON.parse(jsonPayload);
          const isExpired = decodedToken.exp * 1000 < Date.now();

          if (isExpired) {
            console.log('Token is expired, clearing auth data');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            return;
          }

          // Token is valid and user is admin, redirect to dashboard
          console.log('User is already logged in as admin, redirecting to dashboard');
          router.push('/admin/dashboard');
        } catch (tokenError) {
          console.error('Error decoding token:', tokenError);
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
        }
      }
    } catch (error) {
      console.error('Error checking admin authentication:', error);
      // On error, stay on login page
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear login error when user types
    if (loginError) {
      setLoginError(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    try {
      console.log('Attempting admin login with:', formData.email);

      // Clear any existing auth data before attempting login
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      let data;
      try {
        data = await response.json();
        console.log('API login response status:', response.status, 'success:', data?.success);
      } catch (jsonError) {
        console.error('Error parsing response:', jsonError);
        setLoginError('Invalid response from server. Please try again.');
        setIsLoading(false);
        return;
      }

      if (response.ok && data && data.success) {
        try {
          // Check if token exists in response
          if (!data.token) {
            console.warn('No token received from server');
            setLoginError('Authentication error: No token received');
            setIsLoading(false);
            return;
          }

          // Validate token format
          const tokenParts = data.token.split('.');
          if (tokenParts.length !== 3) {
            console.warn('Invalid token format received');
            setLoginError('Authentication error: Invalid token format');
            setIsLoading(false);
            return;
          }

          // Check if user data exists in response
          if (!data.user) {
            console.warn('No user data received from server');
            setLoginError('Authentication error: No user data received');
            setIsLoading(false);
            return;
          }

          // Store token in localStorage
          console.log('Storing auth token');
          localStorage.setItem('authToken', data.token);

          // Ensure user data has isAdmin flag
          const userData = {
            ...data.user,
            isAdmin: true
          };

          console.log('Storing admin user data:', userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));

          // Verify data was stored correctly
          const storedToken = localStorage.getItem('authToken');
          const storedUser = localStorage.getItem('currentUser');

          if (!storedToken || !storedUser) {
            console.error('Failed to store authentication data');
            setLoginError('Error storing authentication data. Please try again.');
            setIsLoading(false);
            return;
          }

          console.log('Admin login successful, redirecting to dashboard');
          router.push('/admin/dashboard');
        } catch (storageError) {
          console.error('Error storing auth data:', storageError);
          setLoginError('Error storing authentication data. Please try again.');
          setIsLoading(false);
        }
      } else {
        // Handle login failure with detailed error information
        let errorMessage = data?.error || 'Invalid email or password';

        // Add details if available
        if (data?.details) {
          console.error('Login failed details:', data.details);
          errorMessage += ` (${data.details})`;
        }

        console.error('Login failed:', errorMessage);
        setLoginError(errorMessage);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred during login. Please check your network connection and try again.');
      setIsLoading(false);
    }
  };

  // If loading, show the form loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              <span className="text-2xl font-bold text-gray-900">Sarthak Consultancy</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <FormLoader fields={2} message="Logging in..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
            <span className="text-2xl font-bold text-gray-900">Sarthak Consultancy</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/admin/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register a new admin account
          </Link>
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-center text-sm font-medium text-blue-800">Default Admin Credentials</p>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-700">Email: <span className="font-medium">admin@example.com</span></p>
            <p className="text-sm text-gray-700">Password: <span className="font-medium">admin123</span></p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loginError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {loginError}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                loadingText="Logging in..."
              >
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue to
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Link
                href="/"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}