"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { SubscriptionPlan } from '@/types/subscription';

interface PaymentFormProps {
  plan: SubscriptionPlan;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ plan, onCancel }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be in MM/YY format';
    }
    
    if (!formData.cvc.trim()) {
      newErrors.cvc = 'CVC is required';
    } else if (!/^\d{3,4}$/.test(formData.cvc)) {
      newErrors.cvc = 'CVC must be 3 or 4 digits';
    }
    
    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Name on card is required';
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
    setPaymentError(null);
    
    try {
      // In a real application, you would use a secure payment processor
      // For this example, we'll use our mock API
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          userId: 'user123', // In a real app, this would be the authenticated user's ID
          email: formData.email,
          name: formData.name,
          paymentMethod: 'card',
          cardDetails: {
            number: formData.cardNumber,
            expiry: formData.expiryDate,
            cvc: formData.cvc,
            name: formData.cardName,
          },
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Payment failed');
      }
      
      // Redirect to success page or dashboard
      router.push(data.redirectUrl || '/payment/success');
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment processing failed. Please try again.');
    } finally {
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
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
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
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="font-medium text-gray-900 mb-4">Payment Details</h3>
          
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                CVC
              </label>
              <input
                type="text"
                id="cvc"
                name="cvc"
                placeholder="123"
                value={formData.cvc}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cvc ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cvc && (
                <p className="mt-1 text-sm text-red-600">{errors.cvc}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
              Name on Card
            </label>
            <input
              type="text"
              id="cardName"
              name="cardName"
              value={formData.cardName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cardName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cardName && (
              <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
            )}
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

export default PaymentForm;
