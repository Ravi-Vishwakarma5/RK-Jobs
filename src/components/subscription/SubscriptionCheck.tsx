"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import PageLoading from '@/components/ui/PageLoading';
import { getUserActiveSubscription } from '@/data/subscriptions';

interface SubscriptionCheckProps {
  children: React.ReactNode;
}

export default function SubscriptionCheck({ children }: SubscriptionCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    // Skip subscription check for certain paths
    if (
      pathname === '/' ||
      pathname === '/home' ||
      pathname.startsWith('/jobs/') || // Allow access to job detail pages
      pathname.startsWith('/admin') ||
      pathname.startsWith('/payment') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/subscription')
    ) {
      console.log('Skipping subscription check for path:', pathname);
      setIsLoading(false);
      return;
    }

    // Check if user has an active subscription
    // In a real app, this would be a call to an API endpoint
    // For this demo, we'll use the mock function
    const checkSubscription = () => {
      try {
        // For demo purposes, we'll use a hardcoded user ID
        const userId = 'user123';
        const subscription = getUserActiveSubscription(userId);

        setHasSubscription(!!subscription);

        // FIXED: Don't redirect users with active subscriptions
        // Only redirect users without subscriptions to the subscription page
        // if they're trying to access protected pages

        // Uncomment this if you want to redirect users without subscriptions
        // if (!subscription && !pathname.startsWith('/subscription')) {
        //   router.push('/subscription');
        // }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [pathname, router]);

  // Show loading while checking subscription
  if (isLoading) {
    return <PageLoading message="Checking subscription status..." fullScreen />;
  }

  // If on a protected page and has subscription, the useEffect will handle redirection
  // Otherwise, render children
  return <>{children}</>;
}
