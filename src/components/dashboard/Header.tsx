"use client";

import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="flex items-center text-gray-700 hover:text-gray-900">
              <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                JD
              </span>
              <span className="ml-2">John Doe</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
