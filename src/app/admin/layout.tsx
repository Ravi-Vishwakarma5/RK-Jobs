"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PageLoading from '@/components/ui/PageLoading';
import { getCurrentUser, isAdmin } from '@/utils/auth';
import { isAuthenticated as checkAuthToken, getAuthToken, decodeToken } from '@/app/uitlis/auth';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated and is an admin
    const checkAuth = async () => {
      try {
        // Skip auth check for login and register pages
        if (pathname.includes('/admin/login') || pathname.includes('/admin/register')) {
          setIsLoading(false);
          return;
        }

        // First try JWT token authentication
        try {
          const isUserAuthenticated = checkAuthToken();
          if (isUserAuthenticated) {
            console.log('JWT token found, verifying...');
            const token = getAuthToken();
            if (token) {
              try {
                // Verify token
                const decoded = decodeToken(token);

                if (decoded && decoded.isAdmin) {
                  console.log('Admin authenticated with JWT token');
                  setUser(decoded);
                  setIsUserAuthenticated(true);
                  setIsLoading(false);
                  return;
                }
              } catch (tokenError) {
                console.error('Token verification error:', tokenError);
              }
            }
          }
        } catch (authError) {
          console.error('Authentication check error:', authError);
        }

        // Fallback to legacy auth
        console.log('Trying legacy authentication...');
        const user = getCurrentUser();
        const adminAuthenticated = isAdmin();

        if (user && adminAuthenticated) {
          console.log('Admin authenticated with legacy method');
          setUser(user);
          setIsUserAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // If no authentication method works, redirect to login
        console.log('Not authenticated, redirecting to login');
        router.push('/admin/login');
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Show loading while checking authentication
  if (isLoading && !pathname.includes('/admin/login') && !pathname.includes('/admin/register')) {
    return <PageLoading message="Checking authentication..." fullScreen />;
  }

  // For login and register pages, don't show the sidebar
  if (pathname.includes('/admin/login') || pathname.includes('/admin/register')) {
    return <>{children}</>;
  }

  // For authenticated admin pages, show the sidebar layout
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar user={user} />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}
