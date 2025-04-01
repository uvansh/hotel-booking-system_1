import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

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