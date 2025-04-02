import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Destination from '@/models/Destination';

export async function GET() {
  try {
    await connectDB();
    
    const destinations = await Destination.find({})
      .sort({ createdAt: -1 })
      .select('name country description image rating hotelCount');

    return NextResponse.json(destinations);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await getAuth(request);
    
    // Check if user is admin
    const adminUserIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',') || [];
    if (!adminUserIds.includes(userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'country', 'description', 'image', 'rating', 'hotelCount', 'popularAttractions', 'climate', 'bestTimeToVisit'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Convert string values to appropriate types
    const destinationData = {
      ...data,
      rating: Number(data.rating),
      hotelCount: Number(data.hotelCount),
      popularAttractions: Array.isArray(data.popularAttractions) 
        ? data.popularAttractions 
        : data.popularAttractions.split(',').map(attraction => attraction.trim())
    };

    const destination = await Destination.create(destinationData);
    return NextResponse.json(destination, { status: 201 });
  } catch (error) {
    console.error('Error creating destination:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: Object.values(error.errors).map(err => err.message).join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create destination' },
      { status: 500 }
    );
  }
} 