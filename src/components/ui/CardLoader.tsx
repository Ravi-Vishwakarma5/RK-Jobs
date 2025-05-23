"use client";

import React from 'react';

interface CardLoaderProps {
  count?: number;
  grid?: boolean;
  message?: string;
}

const CardLoader: React.FC<CardLoaderProps> = ({
  count = 4,
  grid = true,
  message = 'Loading...',
}) => {
  const containerClasses = grid 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    : 'space-y-4';

  return (
    <div className="w-full">
      <div className="flex justify-center mb-4">
        <p className="text-gray-500 text-lg">{message}</p>
      </div>
      
      <div className={containerClasses}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            {/* Card header with image placeholder */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            
            {/* Card body */}
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
            
            {/* Card footer */}
            <div className="flex justify-between items-center pt-2">
              <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardLoader;
