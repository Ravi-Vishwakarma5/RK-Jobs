import jwt from 'jsonwebtoken';

// Secret key for signing JWT tokens
// In a production environment, this should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'sarthak-consultancy-service-secret-key-2025';

// Token expiration time (1 hour)
const TOKEN_EXPIRATION = '1h';

/**
 * Generate a JWT token for a user
 * @param payload - Data to include in the token
 * @param expiresIn - Token expiration time (default: 1h)
 * @returns The generated JWT token
 */
export function generateToken(payload: any, expiresIn: string = TOKEN_EXPIRATION): string {
  try {
    console.log('JWT_SECRET exists:', !!JWT_SECRET);
    console.log('JWT_SECRET length:', JWT_SECRET.length);
    console.log('Payload to sign:', payload);
    console.log('Expiration time:', expiresIn);

    // Validate inputs
    if (!payload) {
      throw new Error('Payload is required for token generation');
    }

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Create a clean payload without any functions or circular references
    const cleanPayload = JSON.parse(JSON.stringify(payload));
    console.log('Clean payload:', cleanPayload);

    // Generate the token with the specified expiration
    const token = jwt.sign(cleanPayload, JWT_SECRET, {
      expiresIn,
      algorithm: 'HS256' // Explicitly specify algorithm
    });

    console.log('Token generated successfully, length:', token.length);
    return token;
  } catch (error: any) {
    console.error('Error generating token:', error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);

    // Re-throw the error instead of returning a fallback token
    // This will help us identify the actual issue
    throw new Error(`Token generation failed: ${error?.message || 'Unknown error'}`);
  }
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
