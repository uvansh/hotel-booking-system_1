import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import getAdminModel from '@/models/Admin';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    
    console.log('Admin check request:', { userId });

    if (!userId) {
      console.log('No userId found in request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const Admin = getAdminModel();
    const admin = await Admin.findOne({ userId });

    console.log('Admin check result:', { userId, admin });

    if (!admin) {
      console.log('User is not an admin:', userId);
      return NextResponse.json(
        { error: 'Not an admin' },
        { status: 403 }
      );
    }

    console.log('User is confirmed as admin:', userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
} 