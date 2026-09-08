import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getUserByEmail, createPasswordReset } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: 'Please provide your email address.' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (user) {
      // Generate 32-byte secure reset token valid for 1 hour
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await createPasswordReset(user.id, resetToken, expiresAt);

      await sendPasswordResetEmail(email, user.name, resetToken);
    }

    // Always return safe generic confirmation to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, we have sent instructions to reset your password.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request. Please try again later.' },
      { status: 500 }
    );
  }
}
