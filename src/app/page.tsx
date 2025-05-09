"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout } from '@/app/uitlis/auth';

// Subscription plan data
const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for job seekers just starting out',
    price: 499,
    currency: 'INR',
    features: [
      'Unlimited job applications',
      'Basic profile visibility',
      'Email notifications for new jobs',
      'Access to job search filters'
    ],
    duration: 365, // 1 year in days
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For serious job seekers looking to stand out',
    price: 599,
    currency: 'INR',
    features: [
      'Unlimited job applications',
      'Referrels from industry professionals',
      'Featured profile for employers',
      'Priority application processing',
      'Advanced job search filters',

    ],
    duration: 365,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'The ultimate job seeking experience',
    price: 699,
    currency: 'INR',
    features: [
      'All Professional features',
      'Resume & CV review by experts',
      'Direct messaging with employers',
      'Interview preparation resources',
      'Personalized job recommendations',
      'Early access to new job listings'
    ],
    duration: 365,
  }
];

// Plan Card Component
interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
  isSelected?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isSelected }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${isSelected
          ? 'ring-2 ring-blue-500 transform scale-[1.02]'
          : 'hover:shadow-lg'
        }`}
    >
      {plan.popular && (
        <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
          Most Popular
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-4">{plan.description}</p>

        <div className="mb-6">
          <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
          <span className="text-gray-600 ml-1">/year</span>
        </div>

        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={isSelected ? "primary" : "outline"}
          className="w-full"
          onClick={() => onSelect(plan)}
        >
          {isSelected ? 'Selected' : 'Select Plan'}
        </Button>
      </div>
    </div>
  );
};

// Payment Form Component
const PaymentForm = ({ plan, onCancel }: { plan: SubscriptionPlan; onCancel: () => void }) => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      const response = await fetch('/api/payment/razorpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          userId: 'user123',
          email: formData.email,
          name: formData.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Job Portal',
        description: `${plan.name} Subscription`,
        order_id: data.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: '9999999999',
        },
        theme: {
          color: '#3B82F6',
        },
        notes: {
          is_test: 'true',
        },
        handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          try {
            const verifyResponse = await fetch('/api/payment/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
                planName: plan.name,
                userId: 'user123',
                email: formData.email,
                name: formData.name,
                amount: data.amount,
                currency: data.currency,
                duration: plan.duration,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(verifyData.error || 'Payment verification failed');
            console.log('Payment verified successfully:', verifyData);

            // Store subscription data in MongoDB
            try {
              console.log('Storing subscription data...');
              const storeResponse = await fetch('/api/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  planId: plan.id,
                  planName: plan.name,
                  paymentId: response.razorpay_payment_id,
                  amount: plan.price,
                  email: formData.email,
                  name: formData.name
                }),
              });

              const storeData = await storeResponse.json();

              if (!storeResponse.ok) {
                console.error('Failed to store subscription data:', storeData.error);
              } else {
                console.log('Subscription data stored successfully:', storeData);
              }
            } catch (storeError: any) {
              console.error('Error storing subscription data:', storeError);
              // Continue with payment success even if storage fails
            }

            window.location.href = '/payment/success';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            console.error('Verification error:', error);
            setPaymentError(error.message || 'Verification failed.');
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
      };

      // We need to use any here because Razorpay is loaded via script
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Payment failed. Try again.');
      setIsSubmitting(false);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Complete Your Payment</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">{plan.name} Plan</span>
          <span className="font-medium">{plan.price} {plan.currency}</span>
        </div>
        <div className="flex justify-between font-medium text-lg pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>{plan.price} {plan.currency}</span>
        </div>
      </div>

      {paymentError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {paymentError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-sm text-gray-600 mb-2">
            Payment will be processed securely via Razorpay. You&apos;ll be redirected to complete your payment.
          </p>
          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Test Card Details:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>Card Number: 4111 1111 1111 1111</li>
              <li>Expiry: Any future date</li>
              <li>CVV: Any 3 digits</li>
              <li>Name: Any name</li>
              <li>3D Secure Password: 1234</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Processing..."
          >
            Pay {plan.price} {plan.currency}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Define a type for our subscription plan
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  duration: number;
  popular?: boolean;
}

export default function Home() {
   const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check for active subscription and authentication on page load
  useEffect(() => {
  const checkAuthAndRedirect = () => {
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      router.push('/home');
      return;
    }

    // If not logged in, still check for subscription alert (optional)
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionActive = urlParams.get('subscriptionActive');

    if (subscriptionActive === 'true') {
      const userSubscription = localStorage.getItem('userSubscription');
      if (userSubscription) {
        try {
          const subscriptionData = JSON.parse(userSubscription);
          setSubscriptionInfo(subscriptionData);
          setShowSubscriptionAlert(true);

          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error parsing subscription data:', error);
        }
      }
    }
  };

  checkAuthAndRedirect();
}, []);

  // useEffect(() => {
  //   // Check if user is authenticated
  //   setIsLoggedIn(isAuthenticated());

  //   // Check URL parameters for subscription alert
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const subscriptionActive = urlParams.get('subscriptionActive');

  //   if (subscriptionActive === 'true') {
  //     // Get subscription info from localStorage
  //     const userSubscription = localStorage.getItem('userSubscription');
  //      router.push('/home');
  //     if (userSubscription) {
  //       try {
  //         const subscriptionData = JSON.parse(userSubscription);
  //         setSubscriptionInfo(subscriptionData);
  //         setShowSubscriptionAlert(true);
           

  //         // Remove the query parameter from URL without refreshing the page
  //         window.history.replaceState({}, document.title, window.location.pathname);
  //       } catch (error) {
  //         console.error('Error parsing subscription data:', error);
  //       }
  //     }
  //   }
  // }, []);

  // // Handle logout
  const handleLogout = () => {
    logout();
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    const pricingElement = document.getElementById('pricing');
    if (pricingElement) {
      window.scrollTo({ top: pricingElement.offsetTop - 100, behavior: 'smooth' });
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedPlan) return;
    setShowPaymentForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
  };

  const handleCloseAlert = () => {
    setShowSubscriptionAlert(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      {/* Subscription Alert */}
      {showSubscriptionAlert && subscriptionInfo && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Active Subscription Found!</h3>
              <div className="mt-2 text-sm">
                <p>Welcome back, {subscriptionInfo.userName}!</p>
                <p>You have an active subscription with email: {subscriptionInfo.email}</p>
                <p className="mt-1 text-xs">
                  Valid until: {new Date(subscriptionInfo.subscriptionDetails?.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={handleCloseAlert}
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPaymentForm ? (
        <div className="max-w-3xl mx-auto px-4 py-12">
          <PaymentForm plan={selectedPlan!} onCancel={handleCancelPayment} />
        </div>
      ) : (
        <>
          {/* Header */}


          {/* Hero Section */}
          <section className="bg-blue-700 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-bold mb-4">Find Your Dream Job Today</h1>
                <p className="text-xl mb-8">Subscribe to unlock premium features and boost your job search.</p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="#pricing">
                    <Button variant="primary" size="lg">
                      View Subscription Plans
                    </Button>
                  </Link>

                  {isLoggedIn ? (
                    <Button variant="outline" size="lg" onClick={handleLogout}>
                      Logout
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button variant="outline" size="lg">
                        Login with Subscription Email
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Subscribe?</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Unlock premium features to enhance your job search experience and increase your chances of landing your dream job.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Featured Profile</h3>
                  <p className="text-gray-600">
                    Stand out from other applicants with a featured profile that appears at the top of employer searches.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Priority Applications</h3>
                  <p className="text-gray-600">
                    Your job applications are prioritized and highlighted to employers, increasing your chances of getting noticed.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Early Access</h3>
                  <p className="text-gray-600">
                    Get early access to new job listings before they&apos;re available to non-subscribers.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="py-16 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscription Plans</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Choose the plan that best fits your needs and take your job search to the next level.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {subscriptionPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSelect={handlePlanSelect}
                    isSelected={!!(selectedPlan && selectedPlan.id === plan.id)}
                  />
                ))}
              </div>

              {selectedPlan && (
                <div className="text-center">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              )}

              <div className="text-center mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Already have a subscription?</h3>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    Login with Subscription Email
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-800 text-white py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-gray-400">© 2025 Job Portal. All rights reserved.</p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
