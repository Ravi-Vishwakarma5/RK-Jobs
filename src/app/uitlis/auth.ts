import { deleteCookie } from './cookies';

/**
 * Log out the user by clearing all authentication data
 * @param isAdmin Whether the user is an admin (for redirect purposes)
 */
export function logout(isAdmin: boolean = false): void {
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userSubscription');
    localStorage.removeItem('currentUser'); // Also clear admin user
  }

  // Clear cookies
  deleteCookie('authToken');

  // Redirect to appropriate page
  if (isAdmin) {
    window.location.href = '/admin/login';
  } else {
    window.location.href = '/';
  }
}

/**
 * Check if the user is authenticated and token is not expired
 * @returns True if the user is authenticated and token is valid, false otherwise
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    // Check if token is expired
    const decodedToken = decodeToken(token);
    if (!decodedToken) return false;

    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    const isTokenExpired = decodedToken.exp * 1000 < Date.now();

    if (isTokenExpired) {
      // Clear expired token
      localStorage.removeItem('authToken');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Get the user's authentication token
 * @returns The user's authentication token or null if not authenticated
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Decode JWT token (simple decode, no verification)
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): any {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if the current user is an admin
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return !!user && user.isAdmin === true;
}

/**
 * Check if token is expired
 * @param token JWT token to check
 * @returns True if token is expired, false otherwise
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const decodedToken = decodeToken(token);
    if (!decodedToken || !decodedToken.exp) return true;

    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    return decodedToken.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

/**
 * Handle token expiration and redirect to appropriate login page
 * @returns True if token is valid, false if expired and redirected
 */
export function handleTokenExpiration(): boolean {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('authToken');

  if (isTokenExpired(token)) {
    // Token is expired, clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userSubscription');

    // Get the current path
    const currentPath = window.location.pathname;

    // Only redirect if we're not already on a login page
    if (currentPath !== '/admin/login' && currentPath !== '/login') {
      // Determine if we were on an admin page
      const isAdminPage = currentPath.startsWith('/admin');

      // Redirect to appropriate login page
      if (isAdminPage) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/';
      }
    }

    return false;
  }

  return true;
}
