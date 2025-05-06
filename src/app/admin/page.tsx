"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoading from '@/components/ui/PageLoading';

export default function AdminPage() {
  const router = useRouter();
  
  // Redirect to dashboard
  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);
  
  return <PageLoading message="Redirecting to dashboard..." fullScreen />;
}
