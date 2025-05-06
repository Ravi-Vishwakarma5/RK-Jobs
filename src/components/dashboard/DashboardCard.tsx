"use client";

import React from 'react';
import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  linkText?: string;
  linkHref?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
  icon,
  linkText,
  linkHref,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
      {linkText && linkHref && (
        <div className="mt-4">
          <Link
            href={linkHref}
            className={`text-${color}-700 hover:text-${color}-900 text-sm font-medium`}
          >
            {linkText}
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
