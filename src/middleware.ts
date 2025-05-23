import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, isTokenExpired } from '@/app/uitlis/jwt';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Log navigation for debugging
  console.log(`Middleware processing path: ${path}`);

  // Define paths that are public (no authentication required)
  const publicPaths = [
    '/',
    '/login',
    '/api',
    '/payment',
    '/_next',
    '/favicon.ico',
    '/subscription-test',
    '/payment-test',
    '/admin/login',
    '/companies',
    '/about'
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath =>
    path.startsWith(publicPath)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check if this is a job detail page or company detail page
  if ((path.startsWith('/jobs/') && !path.includes('/application-success')) ||
      path.startsWith('/companies/')) {
    console.log(`Detail page detected: ${path}`);

    // Continue with normal navigation
    return NextResponse.next();
  }

  // Check if this is an admin route
  const isAdminRoute = path.startsWith('/admin') && !path.startsWith('/admin/login');

  // Define paths that require subscription and authentication
  const protectedPaths = [
    '/user/dashboard',
    '/user/applications',
    '/user/referrals',
    '/user/interviews',
    '/user/resume-review',
    '/user/profile'
  ];

  // Check if the current path requires subscription and authentication
  const isUserProtectedPath = protectedPaths.some(protectedPath =>
    path.startsWith(protectedPath)
  );

  // Handle admin routes
  if (isAdminRoute) {
    // Get the token from cookies
    const token = request.cookies.get('authToken')?.value;

    // If no token is found, redirect to admin login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verify the token
    const decodedToken = verifyToken(token);

    // If the token is invalid or expired, redirect to admin login
    if (!decodedToken || isTokenExpired(token)) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('authToken');
      return response;
    }

    // Check if the user is an admin
    if (!decodedToken.isAdmin) {
      // Not an admin, redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  // Handle user protected routes
  else if (isUserProtectedPath) {
    // Get the token from cookies
    const token = request.cookies.get('authToken')?.value;

    // If no token is found, redirect to home page
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Verify the token
    const decodedToken = verifyToken(token);

    // If the token is invalid or expired, redirect to home page
    if (!decodedToken || isTokenExpired(token)) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('authToken');
      return response;
    }

    // Check if the user has an active subscription
    if (!decodedToken.hasActiveSubscription) {
      // Redirect to subscription page if no active subscription
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/user/:path*',
    '/jobs/:id*',
    '/admin/:path*',
    '/companies/:id*',
  ],
};
