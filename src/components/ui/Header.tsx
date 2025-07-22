// "use client";

// import React, { useState } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { usePathname, useRouter } from 'next/navigation';
// import { isAuthenticated, logout } from '@/app/uitlis/auth';

// interface HeaderProps {
//   transparent?: boolean;
// }

// const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
//   const pathname = usePathname();
//   const router = useRouter();
//   const isLoggedIn = isAuthenticated();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const handleLogout = () => {
//     localStorage.removeItem('authToken');
//     router.push('/');
//   };

//   const isActive = (path: string) => pathname === path;

//   const toggleMobileMenu = () => {
//     setMobileMenuOpen(!mobileMenuOpen);
//   };

//   return (
//     <>
//     <header className={transparent ? 'bg-transparent' : 'bg-white shadow-sm'}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
//         <div className="flex items-center">
//           <Link href="/">
//             <Image
//               className={transparent ? '' : 'dark:invert'}
//               src="/next.svg"
//               alt="Job Portal Logo"
//               width={120}
//               height={30}
//               priority
//             />
//           </Link>
//           {/* Desktop Navigation */}
//           <nav className="ml-10 space-x-4 lg:space-x-8 hidden md:flex">
//             <Link
//               href="/"
//               className={`${isActive('/')
//                 ? 'text-blue-600 font-medium'
//                 : transparent
//                   ? 'text-white hover:text-gray-200'
//                   : 'text-gray-500 hover:text-gray-900'
//               } text-sm lg:text-base`}
//             >
//               Home
//             </Link>
//              <Link
//               href="/jobs"
//               className={`${isActive('/jobs')
//                 ? 'text-blue-600 font-medium'
//                 : transparent
//                   ? 'text-white hover:text-gray-200'
//                   : 'text-gray-500 hover:text-gray-900'
//               } text-sm lg:text-base`}
//             >
//              Browse Jobs
//             </Link>
//             <Link
//               href="/about"
//               className={`${isActive('/about')
//                 ? 'text-blue-600 font-medium'
//                 : transparent
//                   ? 'text-white hover:text-gray-200'
//                   : 'text-gray-500 hover:text-gray-900'
//               } text-sm lg:text-base`}
//             >
//               About
//             </Link>
//             <Link
//               href="/companies"
//               className={`${isActive('/companies') || pathname.startsWith('/companies/')
//                 ? 'text-blue-600 font-medium'
//                 : transparent
//                   ? 'text-white hover:text-gray-200'
//                   : 'text-gray-500 hover:text-gray-900'
//               } text-sm lg:text-base`}
//             >
//               Companies
//             </Link>
//           </nav>
//         </div>

//         {/* Desktop Auth Buttons */}
//         <div className="hidden md:flex items-center space-x-4">
//           {isLoggedIn ? (
//             <>
//               <Link
//                 href="/user"
//                 className={`${transparent
//                   ? 'text-white hover:text-gray-200'
//                   : 'text-gray-500 hover:text-gray-900'
//                 } text-sm lg:text-base`}
//               >
//                 Dashboard
//               </Link>
//               <button
//                 onClick={handleLogout}
//                 className={`rounded-full ${
//                   transparent
//                     ? 'bg-white text-blue-600 hover:bg-gray-100'
//                     : 'bg-blue-600 text-white hover:bg-blue-700'
//                 } px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors`}
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <Link
//               href="/login"
//               className={`rounded-full ${
//                 transparent
//                   ? 'bg-white text-blue-600 hover:bg-gray-100'
//                   : 'bg-blue-600 text-white hover:bg-blue-700'
//               } px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors`}
//             >
//               Login
//             </Link>
//           )}
//         </div>

//         {/* Mobile Menu Button */}
//         <div className="md:hidden">
//           <button
//             onClick={toggleMobileMenu}
//             className="text-gray-500 hover:text-gray-900 focus:outline-none"
//             aria-label="Toggle menu"
//           >
//             {mobileMenuOpen ? (
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             ) : (
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <div className="md:hidden bg-white shadow-lg">
//           <nav className="px-4 pt-2 pb-4 space-y-2">
//             <Link
//               href="/"
//               className={`block py-2 px-3 rounded-md ${isActive('/')
//                 ? 'bg-blue-50 text-blue-600 font-medium'
//                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
//               }`}
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               Home
//             </Link>
//             <Link
//               href="/jobs"
//               className={`block py-2 px-3 rounded-md ${isActive('/jobs')
//                 ? 'bg-blue-50 text-blue-600 font-medium'
//                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
//               }`}
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               Browse Jobs
//             </Link>
//             <Link
//               href="/about"
//               className={`block py-2 px-3 rounded-md ${isActive('/about')
//                 ? 'bg-blue-50 text-blue-600 font-medium'
//                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
//               }`}
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               About
//             </Link>
//             <Link
//               href="/companies"
//               className={`block py-2 px-3 rounded-md ${isActive('/companies') || pathname.startsWith('/companies/')
//                 ? 'bg-blue-50 text-blue-600 font-medium'
//                 : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
//               }`}
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               Companies
//             </Link>

//             {/* Mobile Auth Links */}
//             <div className="pt-2 border-t border-gray-200">
//               {isLoggedIn || localStorage.get('free_token') ? (
//                 <>
//                   <Link
//                     href="/user"
//                     className="block py-2 px-3 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Dashboard
//                   </Link>
//                   <button
//                     onClick={() => {
//                       handleLogout();
//                       setMobileMenuOpen(false);
//                     }}
//                     className="w-full text-left py-2 px-3 rounded-md text-red-600 hover:bg-red-50"
//                   >
//                     Logout
//                   </button>
//                 </>
//               ) : (
//                 <Link
//                   href="/login"
//                   className="block py-2 px-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-center"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Login
//                 </Link>
//               )}
//             </div>
//           </nav>
//         </div>
//       )}
//     </header>
//     </>
//   );
// };

// export default Header;


'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated } from '@/app/uitlis/auth';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated() || !!localStorage.getItem('free_token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('free_token');
    setIsLoggedIn(false);
    router.push('/');
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const linkClass = (path: string) =>
    `${isActive(path) ? 'text-blue-600 font-medium' : transparent ? 'text-white hover:text-gray-200' : 'text-gray-500 hover:text-gray-900'} text-sm lg:text-base`;

  const buttonClass = transparent
    ? 'bg-white text-blue-600 hover:bg-gray-100'
    : 'bg-blue-600 text-white hover:bg-blue-700';

  return (
    <header className={transparent ? 'bg-transparent' : 'bg-white shadow-sm'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo & Nav */}
        <div className="flex items-center">
          <Link href="/">
            <Image
              className={transparent ? '' : 'dark:invert'}
              src="/next.svg"
              alt="Logo"
              width={120}
              height={30}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="ml-10 space-x-4 lg:space-x-8 hidden md:flex">
            <Link href="/" className={linkClass('/')}>Home</Link>
            <Link href="/jobs" className={linkClass('/jobs')}>Browse Jobs</Link>
            <Link href="/about" className={linkClass('/about')}>About</Link>
            <Link href="/companies" className={linkClass('/companies')}>Companies</Link>
          </nav>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link href="/user" className={linkClass('/user')}>Dashboard</Link>
              <button
                onClick={handleLogout}
                className={`rounded-full ${buttonClass} px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors`}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={`rounded-full ${buttonClass} px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors`}
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 hover:text-gray-900">
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="px-4 pt-2 pb-4 space-y-2">
            <Link href="/" className={`block py-2 px-3 rounded-md ${isActive('/') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/jobs" className={`block py-2 px-3 rounded-md ${isActive('/jobs') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`} onClick={() => setMobileMenuOpen(false)}>Browse Jobs</Link>
            <Link href="/about" className={`block py-2 px-3 rounded-md ${isActive('/about') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`} onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link href="/companies" className={`block py-2 px-3 rounded-md ${isActive('/companies') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`} onClick={() => setMobileMenuOpen(false)}>Companies</Link>

            {/* Auth Links */}
            <div className="pt-2 border-t border-gray-200">
              {isLoggedIn ? (
                <>
                  <Link href="/user" className="block py-2 px-3 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-md text-red-600 hover:bg-red-50">Logout</button>
                </>
              ) : (
                <Link href="/login" className="block py-2 px-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-center" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
