import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { handlePaymentSuccess } from '@/utils/paymentHandler';

interface SubscriptionFormProps {
  onSuccess?: (subscriptionId: string) => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Creating subscription order...');
      console.log('Form data:', { ...formData });

      // Create subscription order
      try {
        console.log('Sending request to /api/subscription/create');
        const createResponse = await fetch('/api/subscription/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        console.log('Create API response status:', createResponse.status);

        // Check if response is JSON
        const contentType = createResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Non-JSON response received:', contentType);
          // Try to get the response text for debugging
          const responseText = await createResponse.text();
          console.error('Response text (first 500 chars):', responseText.substring(0, 500));
          throw new Error(`Server returned non-JSON response (${createResponse.status}). Please check server logs.`);
        }

        // Parse the response
        let orderData;
        try {
          orderData = await createResponse.json();
          console.log('Order data received:', orderData);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          throw new Error('Failed to parse server response. Please try again.');
        }

        if (!createResponse.ok) {
          const errorMessage = orderData && orderData.error
            ? orderData.error
            : `Server returned error (${createResponse.status})`;
          throw new Error(errorMessage);
        }

        // In a real implementation, you would open the Razorpay payment form here
        // For now, we'll simulate a successful payment

        // Simulate payment verification
        console.log('Verifying payment...');
        try {
          const verifyResponse = await fetch('/api/subscription/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpayOrderId: orderData.orderId,
              razorpayPaymentId: `pay_${Date.now()}`,
              razorpaySignature: `sig_${Date.now()}`,
            }),
          });

          console.log('Verify API response status:', verifyResponse.status);

          // Check if response is JSON
          const verifyContentType = verifyResponse.headers.get('content-type');
          if (!verifyContentType || !verifyContentType.includes('application/json')) {
            console.error('Non-JSON verify response received:', verifyContentType);
            // Try to get the response text for debugging
            const verifyResponseText = await verifyResponse.text();
            console.error('Verify response text (first 500 chars):', verifyResponseText.substring(0, 500));
            throw new Error(`Server returned non-JSON response (${verifyResponse.status}). Please check server logs.`);
          }

          // Parse the response
          let subscriptionData;
          try {
            subscriptionData = await verifyResponse.json();
            console.log('Subscription data received:', subscriptionData);
          } catch (parseError) {
            console.error('Error parsing verify JSON response:', parseError);
            throw new Error('Failed to parse verification response. Please try again.');
          }

          if (!verifyResponse.ok) {
            const errorMessage = subscriptionData && subscriptionData.error
              ? subscriptionData.error
              : `Server returned error (${verifyResponse.status})`;
            throw new Error(errorMessage);
          }

          console.log('Subscription activated:', subscriptionData);

          // Store payment details in MongoDB using our new API
          try {
            // Extract payment details
            const paymentDetails = {
              name: formData.fullName,
              email: formData.email,
              paymentId: subscriptionData.payment?.paymentId || `pay_${Date.now()}`,
              amount: 699 // Fixed amount for the standard plan
            };

            console.log('Storing payment details to database:', paymentDetails);

            // Call our new API to store payment details
            const paymentResponse = await fetch('/api/payments/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(paymentDetails)
            });

            const paymentResult = await paymentResponse.json();

            if (!paymentResponse.ok) {
              throw new Error(paymentResult.error || 'Failed to store payment details');
            }

            console.log('Payment details stored successfully in database:', paymentResult);

            // Store in localStorage for the success page
            if (typeof window !== 'undefined') {
              localStorage.setItem('hasActiveSubscription', 'true');
              localStorage.setItem('lastPayment', JSON.stringify(paymentDetails));
            }
          } catch (paymentError: any) {
            console.error('Error storing payment details:', paymentError);
            // Continue with subscription activation even if payment storage fails
          }

          // Handle success
          if (onSuccess) {
            onSuccess(subscriptionData.subscription.id);
          } else {
            router.push(`/subscription/success?id=${subscriptionData.subscription.id}`);
          }
        } catch (verifyError: any) {
          console.error('Error verifying payment:', verifyError);
          throw new Error(`Payment verification failed: ${verifyError.message}`);
        }
      } catch (createError: any) {
        console.error('Error creating subscription order:', createError);
        throw new Error(`Failed to create subscription order: ${createError.message}`);
      }
    } catch (error: any) {
      console.error('Error processing subscription:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to process subscription. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Subscribe to Job Portal</h2>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Standard Plan - ₹699/year</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Unlimited job applications</li>
          <li>Referrals to top companies</li>
          <li>Interview preparation assistance</li>
          <li>CV/Resume review</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter your full name"
          />
          {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter your email"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter your phone number"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Subscribe Now - ₹699'}
        </Button>
      </form>
    </div>
  );
};

export default SubscriptionForm;
