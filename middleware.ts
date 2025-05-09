import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserActiveSubscription } from './src/data/subscriptions';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Skip middleware for API routes, static files, and the home page itself
  if (
    path.startsWith('/api') || 
    path.startsWith('/_next') || 
    path.includes('/favicon.ico') ||
    path === '/' ||
    path === '/home' ||
    path.startsWith('/admin') ||
    path.startsWith('/payment')
  ) {
    return NextResponse.next();
  }

  // Get user ID from cookies or localStorage (in a real app)
  // For this demo, we'll use a hardcoded user ID
  const userId = 'user123';
  
  // Check if the user has an active subscription
  const subscription = getUserActiveSubscription(userId);
  
  // If the user has an active subscription, redirect to home page
  if (subscription) {
    // Allow access to the home page
    if (path === '/home') {
      return NextResponse.next();
    }
    
    // Redirect to home page for all other routes
    return NextResponse.redirect(new URL('/home', request.url));
  }
  
  // If no active subscription, allow normal navigation
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
