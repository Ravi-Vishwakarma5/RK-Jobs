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
            
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
