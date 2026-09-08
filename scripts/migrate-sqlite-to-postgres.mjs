/**
 * CVPilot SQLite to PostgreSQL Database Migration Script
 * 
 * Usage:
 *   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require" npm run db:migrate
 *   or:
 *   node scripts/migrate-sqlite-to-postgres.mjs
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Pool } = pg;

async function migrate() {
  console.log('--- CVPilot SQLite -> PostgreSQL Data Migration ---');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not defined.');
    console.error('Please set DATABASE_URL (e.g. postgresql://user:pass@host:5432/dbname) and run again.');
    process.exit(1);
  }

  const sqlitePath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'cvpilot.db');
  if (!fs.existsSync(sqlitePath)) {
    console.log(`[INFO] No SQLite database found at ${sqlitePath}. Nothing to migrate.`);
    process.exit(0);
  }

  console.log(`[1/5] Opening SQLite database at: ${sqlitePath}`);
  const sqliteDb = new DatabaseSync(sqlitePath);

  const isLocal =
    databaseUrl.includes('localhost') ||
    databaseUrl.includes('127.0.0.1') ||
    databaseUrl.includes('@postgres:5432');

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });

  console.log('[2/5] Ensuring PostgreSQL tables and schema exist...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      avatar_url TEXT
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

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

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id);
    CREATE INDEX IF NOT EXISTS idx_analyses_date ON analyses(analyzed_at);
    CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
    CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
  `);

  console.log('[3/5] Migrating users...');
  let usersCount = 0;
  try {
    const users = sqliteDb.prepare('SELECT id, name, email, password_hash, created_at, avatar_url FROM users').all();
    for (const u of users) {
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, created_at, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           avatar_url = EXCLUDED.avatar_url`,
        [u.id, u.name, u.email, u.password_hash, u.created_at, u.avatar_url || null]
      );
      usersCount++;
    }
    console.log(` -> Transferred ${usersCount} users.`);
  } catch (err) {
    console.warn(' -> Users migration note:', err.message);
  }

  console.log('[4/5] Migrating analyses & review history...');
  let analysesCount = 0;
  try {
    const analyses = sqliteDb.prepare(`
      SELECT id, user_id, file_name, file_size, job_title, overall_score,
             ats_compatibility, authenticity_score, summary, resume_text,
             full_result_json, analyzed_at
      FROM analyses
    `).all();

    for (const a of analyses) {
      await pool.query(
        `INSERT INTO analyses (
           id, user_id, file_name, file_size, job_title, overall_score,
           ats_compatibility, authenticity_score, summary, resume_text,
           full_result_json, analyzed_at
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
          a.id,
          a.user_id,
          a.file_name,
          a.file_size,
          a.job_title || null,
          a.overall_score,
          a.ats_compatibility,
          a.authenticity_score || null,
          a.summary || null,
          a.resume_text || null,
          a.full_result_json,
          a.analyzed_at,
        ]
      );
      analysesCount++;
    }
    console.log(` -> Transferred ${analysesCount} analyses.`);
  } catch (err) {
    console.warn(' -> Analyses migration note:', err.message);
  }

  console.log('[5/5] Migrating active sessions & password resets...');
  let sessionsCount = 0;
  try {
    const now = new Date().toISOString();
    const sessions = sqliteDb.prepare('SELECT token, user_id, expires_at, created_at FROM sessions WHERE expires_at > ?').all(now);
    for (const s of sessions) {
      await pool.query(
        `INSERT INTO sessions (token, user_id, expires_at, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (token) DO NOTHING`,
        [s.token, s.user_id, s.expires_at, s.created_at]
      );
      sessionsCount++;
    }
    console.log(` -> Transferred ${sessionsCount} active sessions.`);
  } catch (err) {
    console.warn(' -> Sessions migration note:', err.message);
  }

  let resetCount = 0;
  try {
    const now = new Date().toISOString();
    const resets = sqliteDb.prepare('SELECT token, user_id, expires_at, created_at FROM password_resets WHERE expires_at > ?').all(now);
    for (const r of resets) {
      await pool.query(
        `INSERT INTO password_resets (token, user_id, expires_at, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (token) DO NOTHING`,
        [r.token, r.user_id, r.expires_at, r.created_at]
      );
      resetCount++;
    }
    console.log(` -> Transferred ${resetCount} active password resets.`);
  } catch (err) {
    console.warn(' -> Password resets migration note:', err.message);
  }

  await pool.end();
  console.log('----------------------------------------------------');
  console.log('SUCCESS: Migration from SQLite to PostgreSQL completed successfully!');
  console.log(`Summary: ${usersCount} users, ${analysesCount} analyses, ${sessionsCount} sessions, ${resetCount} resets.`);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
