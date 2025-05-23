"use client";

import React from 'react';

interface ButtonLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'blue' | 'gray';
}

const ButtonLoader: React.FC<ButtonLoaderProps> = ({
  size = 'md',
  color = 'white',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  // Color classes
  const colorClasses = {
    white: 'border-white',
    blue: 'border-blue-500',
    gray: 'border-gray-500',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full border-2 border-t-transparent ${colorClasses[color]} animate-spin`}></div>
  );
};

export default ButtonLoader;
