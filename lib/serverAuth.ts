import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { createSession, getSession, deleteSession, getUserById } from './db';
import { User } from '@/types';

export const SESSION_COOKIE_NAME = 'cvpilot_session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Creates a cryptographically secure session token in the database
 * and sets the HTTP-only cookie.
 */
export async function createAndSetSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString();

  // Store in database
  await createSession(token, userId, expiresAt);

  // Set HTTP-only cookie
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

/**
 * Returns the currently authenticated user based on the session cookie.
 * Supports passing a NextRequest directly (for Edge/API routes) or using next/headers cookies().
 */
export async function getAuthenticatedUser(request?: NextRequest): Promise<User | null> {
  let token: string | undefined = undefined;

  if (request) {
    token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      return null;
    }
  }

  if (!token) return null;

  const session = await getSession(token);
  if (!session) return null;

  return await getUserById(session.userId);
}

/**
 * Destroys the current session in the database and removes the cookie.
 */
export async function destroySession(request?: NextRequest): Promise<void> {
  let token: string | undefined = undefined;

  if (request) {
    token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // ignore
    }
  }

  if (token) {
    await deleteSession(token);
  }

  try {
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  } catch {
    // ignore if cannot set cookie
  }
}
