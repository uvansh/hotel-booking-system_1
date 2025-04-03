import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

// Helper function to check if user is admin
const isAdmin = async (userId) => {
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  return adminUserIds.includes(userId);
};

export async function PATCH(request, { params }) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!await isAdmin(userId)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = params;
    const { status } = await request.json();

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await connectDB();
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('hotelId');

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
} 