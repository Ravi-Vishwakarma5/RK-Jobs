"use client";

import React from 'react';

interface TableLoaderProps {
  rows?: number;
  columns?: number;
  message?: string;
}

const TableLoader: React.FC<TableLoaderProps> = ({
  rows = 5,
  columns = 4,
  message = 'Loading data...',
}) => {
  return (
    <div className="w-full animate-pulse">
      {/* Loading message */}
      <div className="flex justify-center mb-4">
        <div className="h-5 w-40 bg-gray-200 rounded"></div>
      </div>
      
      {/* Table header */}
      <div className="flex mb-2">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="flex-1 h-8 bg-gray-300 rounded mx-1"></div>
        ))}
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex mb-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="flex-1 h-10 bg-gray-200 rounded mx-1"
            ></div>
          ))}
        </div>
      ))}
      
      {/* Message */}
      <div className="text-center mt-4 text-gray-500">{message}</div>
    </div>
  );
};

export default TableLoader;
