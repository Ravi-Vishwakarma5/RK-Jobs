'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import PageLoading from '@/components/ui/PageLoading';

interface SubscriptionDetails {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  features: string[];
  daysRemaining: number;
}

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('id');
  
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!subscriptionId) {
        setError('Subscription ID is missing');
        setIsLoading(false);
        return;
      }
      
      try {
        // In a real implementation, you would fetch the subscription details from the API
        // For now, we'll create mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create mock subscription data
        const mockSubscription: SubscriptionDetails = {
          id: subscriptionId,
          plan: 'standard',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          features: ['unlimited_jobs', 'referrals', 'interview_review', 'cv_review'],
          daysRemaining: 365
        };
        
        setSubscription(mockSubscription);
      } catch (error) {
        console.error('Error fetching subscription details:', error);
        setError('Failed to load subscription details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionDetails();
  }, [subscriptionId]);
  
  if (isLoading) {
    return <PageLoading />;
  }
  
  if (error || !subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Subscription Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Subscription details not found'}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/subscription">
              <Button variant="primary">Try Again</Button>
            </Link>
            <Link href="/home">
              <Button variant="outline">Go to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Format dates for display
  const startDate = new Date(subscription.startDate).toLocaleDateString();
  const endDate = new Date(subscription.endDate).toLocaleDateString();
  
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-500 p-6 text-white text-center">
          <svg 
            className="w-16 h-16 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="mt-2 text-lg">Your subscription has been activated</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Plan</p>
                <p className="font-medium">Standard Plan</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">{startDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="font-medium">{endDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subscription ID</p>
                <p className="font-medium text-sm">{subscription.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Days Remaining</p>
                <p className="font-medium">{subscription.daysRemaining} days</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Features Included</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited Job Applications</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Referrals to Top Companies</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Interview Preparation</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>CV/Resume Review</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/user/dashboard">
              <Button variant="primary">Go to Dashboard</Button>
            </Link>
            <Link href="/home">
              <Button variant="outline">Browse Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
