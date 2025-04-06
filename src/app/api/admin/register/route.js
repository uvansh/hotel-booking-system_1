import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req) {
  try {
    const { userId, secretCode } = await req.json();
    const { userId: authUserId } = getAuth(req);

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

    // Check if user is already an admin
    const existingAdmin = await Admin.findOne({ userId });
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