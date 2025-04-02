import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { getAuth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    await connectDB();
    const hotels = await Hotel.find({});
    return NextResponse.json(hotels);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    
    // Check if user is admin
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    if (!adminUserIds.includes(userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'description', 'location', 'price', 'rating', 'image'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create new hotel
    const hotel = await Hotel.create({
      name: data.name,
      description: data.description,
      location: data.location,
      price: Number(data.price),
      rating: Number(data.rating),
      image: data.image,
      destination: data.destination || null,
      amenities: data.amenities || [],
      rooms: data.rooms || []
    });

    return NextResponse.json(hotel, { status: 201 });
  } catch (error) {
    console.error('Error creating hotel:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: Object.values(error.errors).map(err => err.message).join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create hotel' },
      { status: 500 }
    );
  }
} 