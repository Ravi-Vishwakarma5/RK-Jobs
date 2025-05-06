"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function PaymentSuccessPage() {
  const router = useRouter();

  // Redirect to dashboard after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/home');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

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
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>

            <p className="text-lg text-gray-700 mb-6">
              Thank you for your subscription. Your account has been activated for one year.
            </p>

            <p className="text-gray-600 mb-8">
              A confirmation email has been sent to your email address with all the details.
            </p>

            <div className="flex flex-col gap-4">
              <Link href="/home">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              You will be redirected to your dashboard in a few seconds...
            </p>
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
