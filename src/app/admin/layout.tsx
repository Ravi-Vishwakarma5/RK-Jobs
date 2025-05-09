"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PageLoading from '@/components/ui/PageLoading';
import { getCurrentUser, isAdmin } from '@/utils/auth';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is an admin
    const checkAuth = () => {
      const user = getCurrentUser();
      const adminAuthenticated = isAdmin();

      // If not on login or register page and not authenticated, redirect to login
      if (!pathname.includes('/admin/login') && !pathname.includes('/admin/register')) {
        if (!user || !adminAuthenticated) {
          router.push('/admin/login');
          return;
        }
      }

      setIsAuthenticated(true);
      setIsLoading(false);
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
      <AdminSidebar />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}
