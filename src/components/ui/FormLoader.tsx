"use client";

import React from 'react';

interface FormLoaderProps {
  fields?: number;
  message?: string;
}

const FormLoader: React.FC<FormLoaderProps> = ({
  fields = 5,
  message = 'Loading form...',
}) => {
  return (
    <div className="w-full animate-pulse">
      {/* Loading message */}
      <div className="flex justify-center mb-6">
        <p className="text-gray-500 text-lg">{message}</p>
      </div>
      
      {/* Form fields */}
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
        
        {/* Submit button */}
        <div className="h-12 bg-gray-300 rounded w-1/3 mt-8"></div>
      </div>
    </div>
  );
};

export default FormLoader;
