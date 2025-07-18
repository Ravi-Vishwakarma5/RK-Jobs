import { NextResponse } from 'next/server';
import connectDB from '@/app/uitlis/model/mongodb';
import FreeUser from '@/app/uitlis/model/freelogin';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await FreeUser.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const newUser = await FreeUser.create({ name, email, password });

    return NextResponse.json(newUser, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: 'Something went wrong', error: err.message }, { status: 500 });
  }
}
