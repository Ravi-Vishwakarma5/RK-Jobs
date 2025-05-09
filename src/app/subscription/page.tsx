'use client';

import React from 'react';
import SubscriptionForm from '@/components/forms/SubscriptionForm';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade Your Job Search</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get unlimited access to all job listings, referrals, and career support with our affordable subscription plan.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Why Subscribe?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">Unlimited Job Applications</h3>
                  <p className="mt-1 text-gray-600">Apply to as many jobs as you want without any restrictions.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">Referrals to Top Companies</h3>
                  <p className="mt-1 text-gray-600">Get referred to top companies in your industry to increase your chances.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">Interview Preparation</h3>
                  <p className="mt-1 text-gray-600">Get expert guidance on how to prepare for interviews in your field.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium">CV/Resume Review</h3>
                  <p className="mt-1 text-gray-600">Get professional feedback on your resume to make it stand out.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Standard Plan</h3>
                <span className="text-2xl font-bold text-blue-600">₹699</span>
              </div>
              <p className="text-gray-600 text-sm">per year</p>
              <div className="mt-2 text-sm text-gray-600">
                <p>One-time payment, valid for 1 year</p>
                <p>All features included</p>
                <p>No hidden charges</p>
              </div>
            </div>
          </div>
          
          <div>
            <SubscriptionForm />
          </div>
        </div>
        
        <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">How long is the subscription valid?</h3>
              <p className="mt-1 text-gray-600">Your subscription is valid for one year from the date of purchase.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Can I cancel my subscription?</h3>
              <p className="mt-1 text-gray-600">Yes, you can cancel your subscription at any time, but we do not offer refunds for the remaining period.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">How do I get a referral?</h3>
              <p className="mt-1 text-gray-600">Once you're subscribed, you can request referrals through your dashboard for jobs that offer this feature.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Is my payment information secure?</h3>
              <p className="mt-1 text-gray-600">Yes, we use Razorpay, a secure payment gateway that ensures your payment information is encrypted and protected.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
