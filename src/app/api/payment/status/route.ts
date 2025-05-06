import { NextRequest, NextResponse } from 'next/server';
import { getUserActiveSubscription } from '@/data/subscriptions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const subscription = getUserActiveSubscription(userId);
    
    return NextResponse.json({
      hasActiveSubscription: !!subscription,
      subscription: subscription || null
    });
    
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}
