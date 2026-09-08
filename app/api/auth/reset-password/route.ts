import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getPasswordResetByToken, deletePasswordResetToken, updateUserPassword, revokeAllUserSessions } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = (body.token || '').trim();
    const newPassword = (body.newPassword || '').trim();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const record = await getPasswordResetByToken(token);
    if (!record) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check expiration (1 hour)
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      await deletePasswordResetToken(token);
      return NextResponse.json(
        { error: 'This password reset link has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await updateUserPassword(record.userId, passwordHash);

    // Invalidate reset token
    await deletePasswordResetToken(token);

    // Revoke all existing sessions for security
    await revokeAllUserSessions(record.userId);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset! You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again later.' },
      { status: 500 }
    );
  }
}
