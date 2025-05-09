"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';

interface PaymentDetails {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
}

interface SubscriptionDetails {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  features: string[];
}

interface UserDetails {
  email: string;
  fullName: string;
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  // Load payment details and handle redirect
  useEffect(() => {
    // Store subscription status in localStorage for demo purposes
    // In a real app, this would be handled by the backend
    localStorage.setItem('hasActiveSubscription', 'true');

    // Get subscription ID from URL
    const subscriptionId = searchParams.get('id');

    // Try to get payment details from localStorage
    let storedPayment = null;
    let storedUser = null;

    try {
      const paymentData = localStorage.getItem('lastPayment');
      if (paymentData) {
        const parsedData = JSON.parse(paymentData);
        storedPayment = {
          paymentId: parsedData.paymentId,
          orderId: parsedData.orderId || `order_${Date.now()}`,
          amount: parsedData.amount,
          currency: parsedData.currency || 'INR',
          status: 'success',
          date: new Date().toISOString()
        };

        storedUser = {
          email: parsedData.email,
          fullName: parsedData.name
        };
      }
    } catch (error) {
      console.error('Error parsing stored payment data:', error);
    }

    // Use stored data or fallback to mock data
    const paymentData: PaymentDetails = storedPayment || {
      paymentId: `pay_${Math.random().toString(36).substring(2, 15)}`,
      orderId: `order_${Math.random().toString(36).substring(2, 15)}`,
      amount: 699,
      currency: 'INR',
      status: 'success',
      date: new Date().toISOString()
    };

    const subscriptionData: SubscriptionDetails = {
      id: subscriptionId || 'sub_default',
      plan: 'standard',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      features: ['unlimited_jobs', 'referrals', 'interview_review', 'cv_review']
    };

    const userData: UserDetails = storedUser || {
      email: 'user@example.com',
      fullName: 'John Doe'
    };

    // Set the data
    setPayment(paymentData);
    setSubscription(subscriptionData);
    setUser(userData);
    setIsLoading(false);

    // Start countdown for redirect
    const countdownInterval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          router.push('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Job Portal Logo"
              width={120}
              height={30}
              priority
            />
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Success Header */}
            <div className="bg-green-500 p-6 text-center">
              <div className="inline-block bg-white rounded-full p-3 mb-4">
                <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-green-100">Your subscription has been activated successfully.</p>
            </div>

            {/* Payment Details */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Payment ID</p>
                  <p className="font-medium">{payment?.paymentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{payment?.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">{payment?.currency} {payment?.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{new Date(payment?.date || '').toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-green-600">{payment?.status}</p>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium capitalize">{subscription?.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-green-600 capitalize">{subscription?.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{new Date(subscription?.startDate || '').toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{new Date(subscription?.endDate || '').toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Features</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subscription?.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* User Details */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/home">
                <Button variant="primary">Go to Home</Button>
              </Link>
              <Link href="/user/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                You will be redirected to the home page in {redirectCountdown} seconds...
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Job Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
