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
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
        isSelected 
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
          <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
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

export default PlanCard;
