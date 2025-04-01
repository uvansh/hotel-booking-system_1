import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

// Helper function to check if user is admin
const isAdmin = async (userId) => {
  // You can implement your own admin check logic here
  // For example, you could check against a list of admin user IDs
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  return adminUserIds.includes(userId);
};

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isUserAdmin = await isAdmin(userId);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'price', 'rating', 'image', 'location', 'description', 'amenities'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Convert price and rating to numbers
    const hotelData = {
      ...data,
      price: Number(data.price),
      rating: Number(data.rating),
      amenities: Array.isArray(data.amenities) ? data.amenities : data.amenities.split(',').map(amenity => amenity.trim())
    };

    console.log('Creating hotel with data:', hotelData);
    
    const hotel = await Hotel.create(hotelData);
    return NextResponse.json(hotel, { status: 201 });
  } catch (error) {
    console.error('Error creating hotel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create hotel' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isUserAdmin = await isAdmin(userId);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    await Hotel.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete hotel' },
      { status: 500 }
    );
  }
} 