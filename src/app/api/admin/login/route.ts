import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/data/users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // In a real application, you would validate against a database
    // and use proper password hashing
    
    // For demo purposes, we'll use hardcoded credentials for admin
    if (email === 'admin@example.com' && password === 'admin123') {
      const user = users.find(u => u.email === email && u.role === 'admin');
      
      if (user) {
        // In a real application, you would create a session or JWT token
        // For this demo, we'll just return the user object (excluding sensitive data)
        const { id, name, email, role, status, createdAt, lastLogin, avatar } = user;
        
        return NextResponse.json({
          success: true,
          user: { id, name, email, role, status, createdAt, lastLogin, avatar }
        });
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
