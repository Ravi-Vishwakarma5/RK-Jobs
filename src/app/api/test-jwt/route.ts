import { NextRequest, NextResponse } from 'next/server';
import { generateToken, verifyToken } from '@/app/uitlis/jwt';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing JWT functionality...');

    // Test payload
    const testPayload = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      isAdmin: false
    };

    console.log('Test payload:', testPayload);

    // Try to generate a token
    const token = generateToken(testPayload, '1h');
    console.log('Token generated:', !!token);
    console.log('Token length:', token?.length);

    // Try to verify the token
    const verified = verifyToken(token);
    console.log('Token verified:', !!verified);
    console.log('Verified payload:', verified);

    return NextResponse.json({
      success: true,
      message: 'JWT test successful',
      tokenGenerated: !!token,
      tokenLength: token?.length,
      tokenVerified: !!verified,
      originalPayload: testPayload,
      verifiedPayload: verified
    });
  } catch (error: any) {
    console.error('JWT test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
