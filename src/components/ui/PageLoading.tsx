"use client";

import React from 'react';

interface PageLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-200 animate-pulse"></div>
        </div>
        <p className="mt-4 text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default PageLoading;
