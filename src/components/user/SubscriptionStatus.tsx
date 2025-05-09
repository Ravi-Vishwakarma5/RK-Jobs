import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface SubscriptionStatusProps {
  userId?: string;
  email?: string;
}

interface SubscriptionDetails {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  features: string[];
  daysRemaining: number;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ userId, email }) => {
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!userId && !email) {
        setError('User ID or email is required');
        setIsLoading(false);
        return;
      }
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (email) params.append('email', email);
        
        // Fetch subscription status
        const response = await fetch(`/api/subscription/status?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription status');
        }
        
        const data = await response.json();
        
        if (data.hasActiveSubscription && data.subscription) {
          setSubscription(data.subscription);
        } else {
          setSubscription(null);
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        setError('Failed to load subscription status');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionStatus();
  }, [userId, email]);
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-1/3 mt-4"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Subscription Status</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/subscription">
          <Button variant="primary">Subscribe Now</Button>
        </Link>
      </div>
    );
  }
  
  if (!subscription) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
        <p className="text-gray-600 mb-4">
          You don't have an active subscription. Subscribe now to access all features.
        </p>
        <Link href="/subscription">
          <Button variant="primary">Subscribe Now</Button>
        </Link>
      </div>
    );
  }
  
  // Format dates for display
  const startDate = new Date(subscription.startDate).toLocaleDateString();
  const endDate = new Date(subscription.endDate).toLocaleDateString();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">Subscription Status</h2>
        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Active
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Plan</p>
          <p className="font-medium">Standard Plan</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Expires On</p>
          <p className="font-medium">{endDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Days Remaining</p>
          <p className="font-medium">{subscription.daysRemaining} days</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Started On</p>
          <p className="font-medium">{startDate}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Features Included</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {subscription.features.map((feature, index) => (
            <div key={index} className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">
                {feature === 'unlimited_jobs' && 'Unlimited Jobs'}
                {feature === 'referrals' && 'Referrals'}
                {feature === 'interview_review' && 'Interview Review'}
                {feature === 'cv_review' && 'CV Review'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
