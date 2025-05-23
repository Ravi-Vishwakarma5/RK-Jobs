import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import UserModel from '@/app/uitlis/model/user';
import { verifyToken } from '@/app/uitlis/jwt';
import { users } from '@/data/users';

export async function GET(request: NextRequest) {
  console.log('GET request received at /api/users');
  
  try {
    // Check for authentication (optional)
    const authHeader = request.headers.get('authorization');
    let isAdmin = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        isAdmin = decoded?.isAdmin === true;
        
        // Only admins can access this endpoint
        if (!isAdmin) {
          return NextResponse.json({
            success: false,
            error: 'Unauthorized access'
          }, { status: 403 });
        }
      } catch (tokenError) {
        console.error('Token verification error:', tokenError);
        return NextResponse.json({
          success: false,
          error: 'Invalid token'
        }, { status: 401 });
      }
    } else {
      // For demo purposes, we'll allow access without token
      console.log('No auth token provided, proceeding with limited access');
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    
    // Build query
    const query: any = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    try {
      // Connect to MongoDB
      await connectDB();
      
      // Get total count for pagination
      const total = await UserModel.countDocuments(query);
      
      // Get users with pagination
      const dbUsers = await UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      
      // Format users for response
      const formattedUsers = dbUsers.map(user => {
        // Log the user object to debug
        console.log('Processing user:', user._id.toString());
        
        return {
          id: user._id.toString(),
          name: user.name || 'No Name',
          email: user.email || 'No Email',
          role: user.role || 'user',
          status: user.status || 'inactive',
          createdAt: user.createdAt || new Date(),
          lastLogin: user.lastLogin || null,
          hasActiveSubscription: user.hasActiveSubscription || false
        };
      });
      
      return NextResponse.json({
        success: true,
        users: formattedUsers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Fallback to mock data
      const filteredUsers = users.filter(user => {
        if (role && role !== 'all' && user.role !== role) {
          return false;
        }
        
        if (status && status !== 'all' && user.status !== status) {
          return false;
        }
        
        if (search) {
          const query = search.toLowerCase();
          return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
          );
        }
        
        return true;
      });
      
      // Paginate mock data
      const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);
      
      return NextResponse.json({
        success: true,
        users: paginatedUsers,
        pagination: {
          total: filteredUsers.length,
          page,
          limit,
          pages: Math.ceil(filteredUsers.length / limit)
        },
        source: 'mock'
      });
    }
  } catch (error: any) {
    console.error('Error getting users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get users',
      details: error.message
    }, { status: 500 });
  }
}
