"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoading from '@/components/ui/PageLoading';
import { isAuthenticated, isAdmin, handleTokenExpiration } from '@/app/uitlis/auth';

export default function AdminPage() {
  const router = useRouter();

  // Check authentication and redirect
  useEffect(() => {
    // First check if token is expired and handle redirection
    if (!handleTokenExpiration()) {
      return;
    }

    // Check if user is authenticated and is an admin
    if (isAuthenticated() && isAdmin()) {
      router.push('/admin/dashboard');
    } else {
      // Not authenticated or not an admin, redirect to login
      router.push('/admin/login');
    }
  }, [router]);

  return <PageLoading message="Redirecting..." fullScreen />;
}
