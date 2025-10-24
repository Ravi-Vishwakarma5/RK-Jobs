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
  const handlelogout=()=>{
    localStorage.removeItem('authToken');
    

  }

  return (
    <div className="w-64 bg-white shadow-md h-screen">
      <div className="p-6 border-b border-gray-200">
         <Link href="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              <span className="text-xl font-bold">RK Jobs</span>
            </Link>
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
          onClick={handlelogout}
        >
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
