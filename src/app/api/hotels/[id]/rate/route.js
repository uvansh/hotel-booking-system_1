import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export async function POST(request, { params }) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;
    const { rating } = await request.json();

    if (!rating || rating < 0 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating value' },
        { status: 400 }
      );
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Check if user has already rated this hotel
    const existingRating = hotel.ratings.find(r => r.userId === userId);
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.createdAt = new Date();
    } else {
      // Add new rating
      hotel.ratings.push({
        userId,
        rating,
        createdAt: new Date()
      });
    }

    await hotel.save();

    return NextResponse.json({
      message: 'Rating submitted successfully',
      averageRating: hotel.rating
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
} 