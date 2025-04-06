import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { secretCode } = await request.json();

    // Get the admin secret code from environment variable
    const adminSecretCode = process.env.ADMIN_SECRET_CODE;

    if (!adminSecretCode) {
      return NextResponse.json(
        { error: 'Admin secret code not configured' },
        { status: 500 }
      );
    }

    if (secretCode !== adminSecretCode) {
      return NextResponse.json(
        { error: 'Invalid secret code' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error validating admin secret code:', error);
    return NextResponse.json(
      { error: 'Failed to validate secret code' },
      { status: 500 }
    );
  }
} 