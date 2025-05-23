'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin, handleTokenExpiration, isTokenExpired } from '@/app/uitlis/auth';
import PageLoading from '@/components/ui/PageLoading';

interface WithAuthProps {
  requireAdmin?: boolean;
}

/**
 * Higher-order component to protect routes that require authentication
 * @param Component The component to wrap
 * @param options Configuration options
 * @returns A new component that includes authentication checks
 */
export default function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  const { requireAdmin = false } = options;

  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      // Check authentication on client side
      const checkAuth = () => {
        // Get the current path
        const currentPath = window.location.pathname;

        // Skip auth check if we're already on the login page to prevent infinite redirects
        if (currentPath === '/login') {
          setLoading(false);
          return;
        }

        // Check if token exists and is valid
        const token = localStorage.getItem('authToken');
        if (!token || isTokenExpired(token)) {
          console.log('Token is missing or expired, redirecting to login');
          // Clear auth data
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('userSubscription');

          // Redirect to appropriate login page
          if (requireAdmin) {
            router.push('/admin/login');
          } else {
            router.push('/');
          }
          return;
        }

        // Then check if user is authenticated
        if (!isAuthenticated()) {
          console.log('User is not authenticated, redirecting to login');
          // User is not authenticated, redirect to appropriate login page
          if (requireAdmin) {
            router.push('/admin/login');
          } else {
            router.push('/');
          }
          return;
        }

        // If admin access is required, check if user is admin
        if (requireAdmin && !isAdmin()) {
          console.log('User is not an admin, redirecting to home');
          // User is not an admin, redirect to home page
          router.push('/');
          return;
        }

        // User is authenticated and has required permissions
        console.log('User is authenticated with required permissions');
        setAuthorized(true);
        setLoading(false);
      };

      checkAuth();

      // Set up interval to periodically check token expiration (but don't redirect automatically)
      const tokenCheckInterval = setInterval(() => {
        const token = localStorage.getItem('authToken');
        if (token && isTokenExpired(token)) {
          console.log('Token expired during session');
          // We'll just log it here, the next navigation will trigger a proper redirect
        }
      }, 60000); // Check every minute

      return () => {
        clearInterval(tokenCheckInterval);
      };
    }, [router, requireAdmin]);

    // Show loading indicator while checking authentication
    if (loading) {
      return <PageLoading message="Checking authentication..." />;
    }

    // If authorized, render the component
    return authorized ? <Component {...props} /> : null;
  };
}
