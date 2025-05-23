import jwt from 'jsonwebtoken';

// Secret key for signing JWT tokens
// In a production environment, this should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-jwt-tokens';

// Token expiration time (1 hour)
const TOKEN_EXPIRATION = '1h';

/**
 * Generate a JWT token for a user
 * @param payload - Data to include in the token
 * @param expiresIn - Token expiration time (default: 1h)
 * @returns The generated JWT token
 */
export function generateToken(payload: any, expiresIn: string = TOKEN_EXPIRATION): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify a JWT token
 * @param token - The token to verify
 * @returns The decoded token payload if valid, null otherwise
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Decode a JWT token without verifying it
 * @param token - The token to decode
 * @returns The decoded token payload
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}

/**
 * Check if a token is expired
 * @param token - The token to check
 * @returns True if the token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    if (!decoded || !decoded.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}
