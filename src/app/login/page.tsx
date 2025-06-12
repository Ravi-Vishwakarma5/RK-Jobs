"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { setCookie } from '@/app/uitlis/cookies';
import { isAuthenticated } from '@/app/uitlis/auth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubscriptionLogin, setIsSubscriptionLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For backward compatibility with the existing code
  const email = formData.email;

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/home');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleLoginMode = () => {
    setIsSubscriptionLogin(!isSubscriptionLogin);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate email
      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // For subscription login, we only need email
      if (isSubscriptionLogin) {
        // Call the API to check if the email has an active subscription
        const response = await fetch('/api/user/find', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await response.json();
        console.log('User find API response:', data);

        if (!data.success || !data.hasActiveSubscription) {
          const errorMessage = data.message || 'No active subscription found for this email';
          throw new Error(errorMessage);
        }

        // Validate that we received a token
        if (!data.token) {
          throw new Error('Authentication token not received from server');
        }

        // Store user data in localStorage
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }

        // Store subscription info and JWT token in localStorage
        localStorage.setItem('userSubscription', JSON.stringify({
          email: formData.email,
          hasActiveSubscription: true,
          subscriptionDetails: data.subscription,
          userName: data.user?.name || 'Subscriber'
        }));

        // Store JWT token in localStorage and cookies
        localStorage.setItem('authToken', data.token);

        // Set the token in cookies for server-side middleware
        setCookie('authToken', data.token, 1); // Expires in 1 day (24 hours)

        console.log('JWT token stored in localStorage and cookies');

        // Redirect to user dashboard
        router.push('/home');
      } else {
        // Regular login with email and password
        if (!formData.password) {
          throw new Error('Please enter your password');
        }

        // Call the API to login with email and password
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Invalid email or password');
        }

        // Store JWT token in localStorage and cookies
        localStorage.setItem('authToken', data.token);
        setCookie('authToken', data.token, 1); // Expires in 1 day (24 hours)

        // Store user info if provided
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }

        // Store subscription info if user has an active subscription
        if (data.hasActiveSubscription) {
          localStorage.setItem('userSubscription', JSON.stringify({
            email: formData.email,
            hasActiveSubscription: true,
            subscriptionDetails: data.subscription,
            userName: data.user?.name || 'User'
          }));
        }

        // Redirect to user dashboard
        router.push('/home');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = error.message || 'Failed to login. Please try again.';

      // Provide more helpful error messages
      if (errorMessage.includes('No active subscription')) {
        errorMessage = 'No active subscription found for this email. Please use one of the test emails: test@example.com, user@example.com, or demo@example.com';
      } else if (errorMessage.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (errorMessage.includes('Authentication token not received')) {
        errorMessage = 'Login failed: Server did not provide authentication token. Please try again.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          {isSubscriptionLogin ? "Login with Subscription" : "Sign in to your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSubscriptionLogin
            ? "Enter the email address you used for your subscription"
            : "Enter your credentials to access your account"}
        </p>
        {isSubscriptionLogin && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-center text-sm font-medium text-blue-800">Test User Credentials</p>
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-700">Email: <span className="font-medium">test@example.com</span></p>
              <p className="text-sm text-gray-700">Or: <span className="font-medium">user@example.com</span></p>
              <p className="text-sm text-gray-700">Or: <span className="font-medium">demo@example.com</span></p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Login Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              {/* <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isSubscriptionLogin
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setIsSubscriptionLogin(true)}
              >
                Subscription Login
              </button> */}
              {/* <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  !isSubscriptionLogin
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setIsSubscriptionLogin(false)}
              >
                Account Login
              </button> */}
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
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
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={isSubscriptionLogin ? "Enter your subscription email" : "Enter your email"}
                />
              </div>
            </div>

            {!isSubscriptionLogin && (
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
                    required={!isSubscriptionLogin}
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                loadingText={isSubscriptionLogin ? "Checking subscription..." : "Signing in..."}
              >
                {isSubscriptionLogin ? "Login" : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isSubscriptionLogin ? "Don't have a subscription?" : "Don't have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col space-y-3">

                <Link href="/">
                  <div className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50">
                    Subscribe Now
                  </div>
                </Link>




              {/* Link to toggle between login modes */}
              {/* <button
                type="button"
                onClick={toggleLoginMode}
                className="text-sm text-blue-600 hover:text-blue-500 text-center"
              >
                {isSubscriptionLogin
                  ? "Sign in with email and password instead"
                  : "Sign in with subscription email instead"}
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
