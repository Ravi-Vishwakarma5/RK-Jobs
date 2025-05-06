"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/user' },
    { name: 'Profile', href: '/user/profile' },
    { name: 'Applications', href: '/user/applications' },
    { name: 'Saved Jobs', href: '/user/saved-jobs' },
  ];

  return (
    <div className="w-64 bg-white shadow-md h-screen">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Job Portal</h2>
      </div>
      <nav className="mt-6">
        <ul>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                    isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' : ''
                  }`}
                >
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center text-gray-700 hover:text-gray-900"
        >
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
