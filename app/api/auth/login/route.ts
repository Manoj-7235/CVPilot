import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, getUserById } from '@/lib/db';
import { createAndSetSession } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: 'Please enter both email address and password.' },
        { status: 400 }
      );
    }

    const userRecord = await getUserByEmail(cleanEmail);
    if (!userRecord) {
      return NextResponse.json(
        { error: 'No account found with this email address. Please click "Create an account" to sign up.' },
        { status: 404 }
      );
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(cleanPassword, userRecord.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Incorrect password. Please verify your password and try again.' },
        { status: 401 }
      );
    }

    // Fetch user profile without password
    const user = await getUserById(userRecord.id);
    if (!user) {
      return NextResponse.json({ error: 'User account error.' }, { status: 500 });
    }

    // Create session & set HTTP-only cookie
    await createAndSetSession(user.id);

    return NextResponse.json({
      user,
      message: 'Logged in successfully.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
