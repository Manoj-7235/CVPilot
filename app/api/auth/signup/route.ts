import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '@/lib/db';
import { createAndSetSession } from '@/lib/serverAuth';
import { sendWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { error: 'Please provide full name, email address, and password.' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(cleanPassword, 10);

    // Create user in PostgreSQL database (immediately active)
    const newUser = await createUser(cleanName, cleanEmail, passwordHash);

    // Immediately create session & set HTTP-only cookie
    await createAndSetSession(newUser.id);

    // Send "Thank you for signing up" welcome email safely from backend
    // If sending fails, account creation STILL succeeds and user remains logged in
    try {
      await sendWelcomeEmail(cleanEmail, cleanName);
    } catch (emailErr) {
      console.warn('[Signup] Welcome email could not be delivered, continuing signup:', emailErr);
    }

    return NextResponse.json({
      user: newUser,
      message: 'Account created successfully! Welcome to CVPilot.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during account creation. Please try again.' },
      { status: 500 }
    );
  }
}
