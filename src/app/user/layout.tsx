"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { hasActiveSubscription } from '@/data/subscriptions';

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has an active subscription
    const userId = 'user123'; // In a real app, this would be the authenticated user's ID
    const hasSubscription = hasActiveSubscription(userId);

    // If user does NOT have an active subscription, redirect to subscription page
    // But only if they're trying to access protected pages
    if (!hasSubscription && pathname !== '/subscription') {
      console.log('No active subscription, redirecting to subscription page');
      // Uncomment this line to enable subscription check
      // router.push('/subscription');
    }
  }, [router, pathname]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
