"use client";

import React from 'react';
import { SubscriptionPlan } from '@/types/subscription';
import Button from '@/components/ui/Button';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
  isSelected?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isSelected }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-xl overflow-hidden transition-all ${
        isSelected
          ? 'ring-4 ring-blue-500 transform scale-[1.02]'
          : 'hover:shadow-2xl hover:scale-[1.01]'
      }`}
    >
      {plan.popular && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-medium">
          BEST VALUE OFFER
        </div>
      )}

      <div className="p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-6">{plan.description}</p>

        <div className="mb-8 flex items-baseline">
          <span className="text-5xl font-bold text-blue-600">₹{plan.price}</span>
          <span className="text-gray-600 ml-2 text-lg">/year</span>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-8">
          <h4 className="font-semibold text-blue-800 mb-3">What&apos;s included:</h4>
          <ul className="space-y-4">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          variant={isSelected ? "primary" : "outline"}
          className="w-full py-3 text-lg font-medium"
          onClick={() => onSelect(plan)}
        >
          {isSelected ? 'Selected' : 'Select Plan'}
        </Button>
      </div>
    </div>
  );
};

export default PlanCard;
