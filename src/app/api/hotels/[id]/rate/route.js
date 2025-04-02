import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Booking from '@/models/Booking';

export async function POST(request, { params }) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      console.log('No user ID found in request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating } = await request.json();
    console.log('Received rating request:', { userId, hotelId: params.id, rating });

    if (!rating || rating < 1 || rating > 5) {
      console.log('Invalid rating value:', rating);
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    await connectDB();

    // Find the most recent completed booking for this hotel and user
    const booking = await Booking.findOne({
      hotelId: params.id,
      userId,
      status: 'completed',
      userRating: { $exists: false }
    }).sort({ checkOut: -1 });

    console.log('Found booking:', booking);

    if (!booking) {
      console.log('No completed booking found for rating');
      return NextResponse.json({ 
        error: 'No completed booking found to rate. Please complete a stay before rating.' 
      }, { status: 400 });
    }

    // Update the booking with the user's rating
    booking.userRating = rating;
    await booking.save();

    // Update hotel rating
    const hotel = await Hotel.findById(params.id);
    if (!hotel) {
      console.log('Hotel not found:', params.id);
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    // Calculate new average rating
    const allBookings = await Booking.find({
      hotelId: params.id,
      userRating: { $exists: true }
    });
    
    const totalRating = allBookings.reduce((sum, booking) => sum + booking.userRating, 0);
    hotel.rating = totalRating / allBookings.length;
    await hotel.save();

    console.log('Rating submitted successfully:', { 
      bookingId: booking._id, 
      hotelId: hotel._id, 
      newRating: hotel.rating 
    });

    return NextResponse.json({
      message: 'Rating submitted successfully',
      newRating: hotel.rating
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit rating' },
      { status: 500 }
    );
  }
} 