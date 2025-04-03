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
      .populate({
        path: 'hotelId',
        select: 'name location price image',
        model: 'Hotel'
      })
      .sort({ createdAt: -1 });

    // Transform the data to match the frontend expectations
    const transformedBookings = bookings.map(booking => {
      // Ensure hotelId exists and has the required properties
      const hotelData = booking.hotelId ? {
        _id: booking.hotelId._id,
        name: booking.hotelId.name || 'Unnamed Hotel',
        location: booking.hotelId.location || 'Location not specified',
        price: booking.hotelId.price || 0,
        image: booking.hotelId.image || '/placeholder.jpg'
      } : {
        _id: null,
        name: 'Unnamed Hotel',
        location: 'Location not specified',
        price: 0,
        image: '/placeholder.jpg'
      };

      return {
        _id: booking._id,
        hotel: hotelData,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.numberOfGuests, // Use numberOfGuests from the model
        status: booking.status,
        createdAt: booking.createdAt
      };
    });

    return NextResponse.json(transformedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, status } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the booking and verify ownership
    const booking = await Booking.findOne({ _id: bookingId, userId });
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the booking status
    booking.status = status;
    await booking.save();

    return NextResponse.json(
      { message: 'Booking status updated successfully', booking },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    );
  }
} 