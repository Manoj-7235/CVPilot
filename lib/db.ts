import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { User, AnalysisResult, ReviewHistory } from '@/types';

// Global singleton pool for Next.js to prevent connection exhaustion in development/serverless
declare global {
  // eslint-disable-next-line no-var
  var __postgresPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!global.__postgresPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is missing. Please provide a PostgreSQL connection URL (e.g. postgresql://user:password@host:5432/dbname).'
      );
    }

    const isLocal =
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1') ||
      connectionString.includes('@postgres:5432');

    global.__postgresPool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  return global.__postgresPool;
}

let initPromise: Promise<void> | null = null;

/**
 * Idempotently initializes PostgreSQL tables, indexes, and demo seed users
 */
export async function ensureDatabaseInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const pool = getPool();

      // 1. Users Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL,
          avatar_url TEXT
        );
      `);

      // Drop legacy email verification table if it exists
      await pool.query('DROP TABLE IF EXISTS email_verifications;');

      // 2. Password Resets Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          token TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      // 3. Sessions Table (HTTP-Only Secure Cookie Sessions)
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      // 4. Resumes & Analyses Table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS analyses (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          file_name TEXT NOT NULL,
          file_size BIGINT NOT NULL,
          job_title TEXT,
          overall_score INTEGER NOT NULL,
          ats_compatibility INTEGER NOT NULL,
          authenticity_score INTEGER,
          summary TEXT,
          resume_text TEXT,
          full_result_json TEXT NOT NULL,
          analyzed_at TEXT NOT NULL
        );
      `);

      // Indexes for high query performance
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
        CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id);
        CREATE INDEX IF NOT EXISTS idx_analyses_date ON analyses(analyzed_at);
        CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
        CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
      `);

      // Seed Default Demo Accounts if they don't already exist (only in development or if explicitly enabled)
      if (process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_USERS === 'true') {
        await seedDemoUsers(pool);
      }
    })().catch((err) => {
      initPromise = null; // Allow retry on subsequent calls if initial connection failed
      console.error('[PostgreSQL] Database initialization error:', err);
      throw err;
    });
  }

  return initPromise;
}

async function seedDemoUsers(pool: Pool): Promise<void> {
  const demoEmail1 = 'alex.morgan@example.com';
  const demoEmail2 = 'demo@resumeai.com';

  const res1 = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [demoEmail1]);
  if (res1.rowCount === 0) {
    const hash = bcrypt.hashSync('demo123', 10);
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, created_at, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        'demo-user-alex',
        'Alex Morgan',
        demoEmail1,
        hash,
        '2026-01-15T10:00:00.000Z',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      ]
    );
  }

  const res2 = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [demoEmail2]);
  if (res2.rowCount === 0) {
    const hash = bcrypt.hashSync('demo123', 10);
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, created_at, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        'demo-user-resumeai',
        'Demo Candidate',
        demoEmail2,
        hash,
        '2026-01-15T10:00:00.000Z',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      ]
    );
  }
}

// ─────────────────────────────────────────────────────────────
// User Operations
// ─────────────────────────────────────────────────────────────

export interface DbUserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  avatar_url: string | null;
}

export async function getUserByEmail(email: string): Promise<DbUserRecord | null> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const cleanEmail = email.trim().toLowerCase();
  const result = await pool.query<DbUserRecord>(
    'SELECT id, name, email, password_hash, created_at, avatar_url FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
    [cleanEmail]
  );
  return result.rows[0] || null;
}

export async function getUserById(id: string): Promise<User | null> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const result = await pool.query<{
    id: string;
    name: string;
    email: string;
    created_at: string;
    avatar_url: string | null;
  }>('SELECT id, name, email, created_at, avatar_url FROM users WHERE id = $1', [id]);

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    avatarUrl: row.avatar_url || undefined,
  };
}

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  avatarUrl?: string
): Promise<User> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const cleanEmail = email.trim().toLowerCase();

  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, created_at, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, name.trim(), cleanEmail, passwordHash, createdAt, avatarUrl || null]
  );

  return {
    id,
    name: name.trim(),
    email: cleanEmail,
    createdAt,
    avatarUrl,
  };
}

// ─────────────────────────────────────────────────────────────
// Password Reset Operations
// ─────────────────────────────────────────────────────────────

export async function createPasswordReset(userId: string, token: string, expiresAt: string): Promise<void> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const createdAt = new Date().toISOString();
  await pool.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);
  await pool.query(
    `INSERT INTO password_resets (token, user_id, expires_at, created_at)
     VALUES ($1, $2, $3, $4)`,
    [token, userId, expiresAt, createdAt]
  );
}

export async function getPasswordResetByToken(token: string): Promise<{ userId: string; expiresAt: string } | null> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const result = await pool.query<{ user_id: string; expires_at: string }>(
    'SELECT user_id, expires_at FROM password_resets WHERE token = $1',
    [token]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { userId: row.user_id, expiresAt: row.expires_at };
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
}

// ─────────────────────────────────────────────────────────────
// Session Operations
// ─────────────────────────────────────────────────────────────

export async function createSession(token: string, userId: string, expiresAt: string): Promise<void> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const createdAt = new Date().toISOString();
  await pool.query(
    `INSERT INTO sessions (token, user_id, expires_at, created_at)
     VALUES ($1, $2, $3, $4)`,
    [token, userId, expiresAt, createdAt]
  );
}

export async function getSession(token: string): Promise<{ userId: string; expiresAt: string } | null> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const result = await pool.query<{ user_id: string; expires_at: string }>(
    'SELECT user_id, expires_at FROM sessions WHERE token = $1',
    [token]
  );
  const row = result.rows[0];
  if (!row) return null;

  // Check expiration
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await deleteSession(token);
    return null;
  }

  return { userId: row.user_id, expiresAt: row.expires_at };
}

export async function deleteSession(token: string): Promise<void> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
}

export async function deleteExpiredSessions(): Promise<void> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const now = new Date().toISOString();
  await pool.query('DELETE FROM sessions WHERE expires_at < $1', [now]);
}

// ─────────────────────────────────────────────────────────────
// Analysis / Resume Operations (Strict Per-User Authorization)
// ─────────────────────────────────────────────────────────────

export interface DbAnalysisRow {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number | string;
  job_title: string | null;
  overall_score: number;
  ats_compatibility: number;
  authenticity_score: number | null;
  summary: string | null;
  resume_text: string | null;
  full_result_json: string;
  analyzed_at: string;
}

export async function getAnalysesByUserId(userId: string): Promise<ReviewHistory[]> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const result = await pool.query<{
    id: string;
    user_id: string;
    file_name: string;
    job_title: string | null;
    overall_score: number;
    ats_compatibility: number;
    summary: string | null;
    analyzed_at: string;
  }>(
    `SELECT id, user_id, file_name, job_title, overall_score, ats_compatibility, summary, analyzed_at
     FROM analyses
     WHERE user_id = $1
     ORDER BY analyzed_at DESC`,
    [userId]
  );

  return result.rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    fileName: r.file_name,
    jobTitle: r.job_title || undefined,
    overallScore: r.overall_score,
    atsCompatibility: r.ats_compatibility,
    summary: r.summary || '',
    analyzedAt: r.analyzed_at,
  }));
}

export async function getAnalysisByIdAndUser(id: string, userId: string): Promise<AnalysisResult | null> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const result = await pool.query<DbAnalysisRow>(
    'SELECT * FROM analyses WHERE id = $1 AND user_id = $2 LIMIT 1',
    [id, userId]
  );
  const row = result.rows[0];
  if (!row) return null;

  try {
    const parsed = JSON.parse(row.full_result_json) as AnalysisResult;
    return {
      ...parsed,
      id: row.id,
      userId: row.user_id,
      fileName: row.file_name,
      fileSize: Number(row.file_size),
      analyzedAt: row.analyzed_at,
      resumeText: row.resume_text || parsed.resumeText,
      jobTitle: row.job_title || parsed.jobTitle,
    };
  } catch (error) {
    console.error('Error parsing analysis JSON from PostgreSQL DB:', error);
    return null;
  }
}

export async function saveAnalysis(analysis: AnalysisResult, userId: string): Promise<void> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const fullJson = JSON.stringify(analysis);

  await pool.query(
    `INSERT INTO analyses (
      id, user_id, file_name, file_size, job_title,
      overall_score, ats_compatibility, authenticity_score,
      summary, resume_text, full_result_json, analyzed_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      file_name = EXCLUDED.file_name,
      file_size = EXCLUDED.file_size,
      job_title = EXCLUDED.job_title,
      overall_score = EXCLUDED.overall_score,
      ats_compatibility = EXCLUDED.ats_compatibility,
      authenticity_score = EXCLUDED.authenticity_score,
      summary = EXCLUDED.summary,
      resume_text = EXCLUDED.resume_text,
      full_result_json = EXCLUDED.full_result_json,
      analyzed_at = EXCLUDED.analyzed_at`,
    [
      analysis.id,
      userId,
      analysis.fileName,
      analysis.fileSize,
      analysis.jobTitle || null,
      analysis.overallScore,
      analysis.atsCompatibility,
      analysis.authenticityScore || null,
      analysis.summary || null,
      analysis.resumeText || null,
      fullJson,
      analysis.analyzedAt || new Date().toISOString(),
    ]
  );
}

export async function deleteAnalysis(id: string, userId: string): Promise<boolean> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  const result = await pool.query('DELETE FROM analyses WHERE id = $1 AND user_id = $2', [id, userId]);
  return (result.rowCount ?? 0) > 0;
}

export async function clearAnalysesByUserId(userId: string): Promise<void> {
  await ensureDatabaseInitialized();
  const pool = getPool();
  await pool.query('DELETE FROM analyses WHERE user_id = $1', [userId]);
}
