import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Hotel from '@/models/Hotel';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { hotelId, checkIn, checkOut, guests } = body;

    await connectDB();

    // Check for existing booking with same dates and hotel
    const existingBooking = await Booking.findOne({
      hotelId,
      userId,
      checkIn,
      checkOut,
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a booking for these dates' },
        { status: 400 }
      );
    }

    // Create new booking
    const booking = await Booking.create({
      ...body,
      userId,
      status: 'pending'
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fetch all bookings for the user and populate hotel details
    const bookings = await Booking.find({ userId })
      .populate('hotelId', 'name location price image')
      .sort({ createdAt: -1 });

    // Transform the data to match the frontend expectations
    const transformedBookings = bookings.map(booking => ({
      _id: booking._id,
      hotel: {
        _id: booking.hotelId._id,
        name: booking.hotelId.name,
        location: booking.hotelId.location,
        price: booking.hotelId.price,
        image: booking.hotelId.image
      },
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      status: booking.status,
      createdAt: booking.createdAt
    }));

    return NextResponse.json(transformedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
} 