import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const hotel = await Hotel.create(data);
    return NextResponse.json(hotel, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create hotel' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
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
    return NextResponse.json(
      { error: 'Failed to delete hotel' },
      { status: 500 }
    );
  }
} 