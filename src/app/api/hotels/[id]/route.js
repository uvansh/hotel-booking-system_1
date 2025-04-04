import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { getAuth } from '@clerk/nextjs/server';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const hotel = await Hotel.findByIdAndDelete(id);

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return NextResponse.json({ error: 'Failed to delete hotel' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const hotel = await Hotel.findById(id);
    
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    return NextResponse.json(hotel);
  } catch (error) {
    console.error('Error fetching hotel:', error);
    return NextResponse.json({ error: 'Failed to fetch hotel' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    
    // Validate discount percentage if provided
    if (body.discountPercentage !== undefined) {
      const discount = Number(body.discountPercentage);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return NextResponse.json(
          { error: 'Discount percentage must be between 0 and 100' },
          { status: 400 }
        );
      }
      body.discountPercentage = discount;
    }
    
    const hotel = await Hotel.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Hotel updated successfully', hotel });
  } catch (error) {
    console.error('Error updating hotel:', error);
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 });
  }
} 