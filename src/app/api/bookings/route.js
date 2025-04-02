import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getAuth } from '@clerk/nextjs/server';
import Hotel from '@/models/Hotel';

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // Validate required fields
    if (!data.hotelId || !data.checkIn || !data.checkOut || !data.guests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get hotel details
    const hotel = await Hotel.findById(data.hotelId);
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    // Calculate number of nights
    const checkInDate = new Date(data.checkIn);
    const checkOutDate = new Date(data.checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Calculate total price
    const totalPrice = hotel.price * nights;

    // Create booking with field names matching the model
    const booking = await Booking.create({
      hotelId: data.hotelId,
      userId: userId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      numberOfGuests: parseInt(data.guests),
      totalPrice,
      status: 'pending'
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Fetch user's bookings and populate hotel details
    const bookings = await Booking.find({ userId })
      .populate({
        path: 'hotelId',
        select: 'name location price image'
      })
      .sort({ createdAt: -1 });

    // Transform the data to match the expected format
    const transformedBookings = bookings.map(booking => ({
      _id: booking._id,
      userId: booking.userId,
      hotelId: booking.hotelId._id,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.numberOfGuests,
      status: booking.status,
      createdAt: booking.createdAt,
      hotel: {
        _id: booking.hotelId._id,
        name: booking.hotelId.name,
        location: booking.hotelId.location,
        price: booking.hotelId.price,
        image: booking.hotelId.image
      }
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