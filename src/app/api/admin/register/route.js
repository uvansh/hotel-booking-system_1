import connectDB from '@/lib/mongodb';
import getAdminModel from '@/models/Admin';
import { getAuth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { userId, secretCode } = await req.json();
    const { userId: authUserId } = getAuth(req);

    console.log('Admin registration attempt:', { userId, authUserId });

    if (!authUserId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (authUserId !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!secretCode) {
      return new Response(JSON.stringify({ error: 'Secret code is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (secretCode !== process.env.ADMIN_SECRET_CODE) {
      return new Response(JSON.stringify({ error: 'Invalid secret code' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectDB();
    const Admin = getAdminModel();

    // Check if user is already an admin
    const existingAdmin = await Admin.findOne({ userId });
    console.log('Existing admin check:', { userId, existingAdmin });

    if (existingAdmin) {
      return new Response(JSON.stringify({ error: 'User is already an admin' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create new admin
    const admin = await Admin.create({
      userId,
      createdAt: new Date(),
    });

    console.log('New admin created:', admin);

    return new Response(JSON.stringify({ success: true, admin }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 