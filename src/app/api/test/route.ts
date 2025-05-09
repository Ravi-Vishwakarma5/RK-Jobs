import { NextResponse } from 'next/server';

// Simple test endpoint that always returns JSON
export async function GET() {
  return new NextResponse(
    JSON.stringify({ 
      message: 'Test endpoint working', 
      timestamp: new Date().toISOString() 
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export async function POST(request: Request) {
  try {
    // Try to parse the request body
    const body = await request.json();
    
    // Echo back the request body
    return new NextResponse(
      JSON.stringify({ 
        message: 'Test endpoint received POST data',
        received: body,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    // Return error if parsing fails
    return new NextResponse(
      JSON.stringify({ 
        message: 'Error parsing request body',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
