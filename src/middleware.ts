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
    '/payment-test'
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath =>
    path.startsWith(publicPath)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check if this is a job detail page
  if (path.startsWith('/jobs/') && !path.includes('/application-success')) {
    console.log(`Job detail page detected: ${path}`);
    const jobId = path.split('/').pop();
    console.log(`Job ID extracted: ${jobId}`);

    // Continue with normal navigation
    return NextResponse.next();
  }

  // Define paths that require subscription and authentication
  const protectedPaths = [
    '/user/dashboard',
    '/user/applications',
    '/user/referrals',
    '/user/interviews',
    '/user/resume-review',
    '/user/profile',
    '/admin'
  ];

  // Check if the current path requires subscription and authentication
  const isProtectedPath = protectedPaths.some(protectedPath =>
    path.startsWith(protectedPath)
  );

  if (isProtectedPath) {
    // Get the token from cookies
    const token = request.cookies.get('authToken')?.value;

    // If no token is found, check localStorage via client-side redirect
    if (!token) {
      // For server-side middleware, we can't access localStorage directly
      // So we'll redirect to a client-side auth check page
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify the token
    const decodedToken = verifyToken(token);

    // If the token is invalid or expired, redirect to login
    if (!decodedToken || isTokenExpired(token)) {
      const response = NextResponse.redirect(new URL('/login', request.url));
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
  ],
};
