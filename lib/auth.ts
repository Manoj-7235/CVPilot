import { User } from '../types';

export const DEMO_USER: User = {
  id: 'demo-user-alex',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  createdAt: '2026-01-15T10:00:00.000Z',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
};

/**
 * Remove any legacy plaintext passwords or sensitive credentials from localStorage
 */
export function purgeLegacySensitiveStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('cvpilot_users');
    localStorage.removeItem('resumeai_users');
    localStorage.removeItem('cvpilot_current_user');
  } catch (err) {
    console.error('Error purging legacy storage:', err);
  }
}

/**
 * Fetch currently authenticated user from server session cookie
 */
export async function fetchCurrentUser(): Promise<User | null> {
  purgeLegacySensitiveStorage();
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Log in with email and password via server-side verification and cookie session
 */
export async function loginUser(email: string, password: string): Promise<User> {
  purgeLegacySensitiveStorage();

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error('Please enter both email and password.');
  }

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to log in.');
  }

  return data.user;
}

/**
 * Register a new user with server-side bcrypt hashing and cookie session
 */
export async function signUpUser(name: string, email: string, password: string): Promise<User> {
  purgeLegacySensitiveStorage();

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanName || !cleanEmail || !cleanPassword) {
    throw new Error('Please fill in all fields.');
  }

  if (cleanPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: cleanName, email: cleanEmail, password: cleanPassword }),
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create account.');
  }

  return data.user;
}


/**
 * Request password reset link
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Please enter your email address.');
  }

  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to request password reset.');
  }

  return { success: true, message: data.message };
}

/**
 * Reset password using token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  if (!token || !newPassword) {
    throw new Error('Invalid request.');
  }

  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.trim(), newPassword: newPassword.trim() }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset password.');
  }

  return { success: true, message: data.message };
}

/**
 * Log out and destroy the server-side session
 */
export async function logoutUser(): Promise<void> {
  purgeLegacySensitiveStorage();
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error logging out:', error);
  }
}
