import { NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import FreeUser from '@/app/uitlis/model/freelogin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'mysecret';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    await connectDB();

    const user = await FreeUser.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isMatch =  user.password;
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    return NextResponse.json({ message: 'Login successful', token, user }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
