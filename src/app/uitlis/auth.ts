import { deleteCookie } from './cookies';

/**
 * Log out the user by clearing all authentication data
 */
export function logout(): void {
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userSubscription');
  }
  
  // Clear cookies
  deleteCookie('authToken');
  
  // Redirect to home page
  window.location.href = '/';
}

/**
 * Check if the user is authenticated
 * @returns True if the user is authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('authToken');
  return !!token;
}

/**
 * Get the user's authentication token
 * @returns The user's authentication token or null if not authenticated
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('authToken');
}
