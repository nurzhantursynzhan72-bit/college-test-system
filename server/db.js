const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const isVercel = !!process.env.VERCEL;
const dbPath = isVercel ? '/tmp/database.sqlite' : path.join(dataDir, 'database.sqlite');

// Vercel environment: copy seed DB into writable /tmp on first boot.
if (isVercel) {
  const seedPath = path.join(dataDir, 'database.sqlite');
  if (!fs.existsSync(dbPath) && fs.existsSync(seedPath)) {
    fs.copyFileSync(seedPath, dbPath);
  }
}

function createDb(filePath) {
  // Prefer better-sqlite3 (works on Vercel) when available.
  try {
    // eslint-disable-next-line global-require
    const BetterSqlite3 = require('better-sqlite3');
    const instance = new BetterSqlite3(filePath);
    instance.pragma('foreign_keys = ON');
    migrate(instance);
    return instance;
  } catch {
    // Fallback for local/offline environments without native deps installed.
    // eslint-disable-next-line global-require
    const { DatabaseSync } = require('node:sqlite');
    const instance = new DatabaseSync(filePath);
    instance.exec('PRAGMA foreign_keys = ON;');
    migrate(instance);

    // Polyfill subset of better-sqlite3 API used in server/app.js
    if (typeof instance.transaction !== 'function') {
      instance.transaction = (fn) => (...args) => {
        instance.exec('BEGIN');
        try {
          const result = fn(...args);
          instance.exec('COMMIT');
          return result;
        } catch (err) {
          try { instance.exec('ROLLBACK'); } catch {}
          throw err;
        }
      };
    }

    return instance;
  }
}

function migrate(db) {
  const run = (sql) => {
    try {
      if (typeof db.exec === 'function') db.exec(sql);
      else db.prepare(sql).run();
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      // Ignore idempotent migration errors (SQLite).
      if (
        msg.includes('duplicate column name') ||
        msg.includes('already exists') ||
        msg.includes('no such table')
      ) {
        return;
      }
      throw err;
    }
  };

  // tests
  run('ALTER TABLE tests ADD COLUMN randomize_questions INTEGER DEFAULT 0');
  run('ALTER TABLE tests ADD COLUMN allow_retake INTEGER DEFAULT 0');
  run('ALTER TABLE tests ADD COLUMN max_attempts INTEGER');
  run('ALTER TABLE tests ADD COLUMN password_hash TEXT');
  run('ALTER TABLE tests ADD COLUMN start_at TEXT');
  run('ALTER TABLE tests ADD COLUMN end_at TEXT');
  run('ALTER TABLE tests ADD COLUMN category TEXT');

  // questions
  run('ALTER TABLE questions ADD COLUMN explanation TEXT');
  run('ALTER TABLE questions ADD COLUMN media_url TEXT');

  // results
  run('ALTER TABLE results ADD COLUMN attempt_no INTEGER DEFAULT 1');
  run('ALTER TABLE results ADD COLUMN time_taken_sec INTEGER');
  run('ALTER TABLE results ADD COLUMN answers_json TEXT');

  // attempts table (for timers/retakes)
  run(`
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      test_id TEXT NOT NULL,
      attempt_no INTEGER NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      submitted_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
    )
  `);
  run('CREATE INDEX IF NOT EXISTS idx_attempts_user_test ON attempts(user_id, test_id)');

  // Email notifications outbox (optional worker / cron)
  run(`
    CREATE TABLE IF NOT EXISTS outbox_emails (
      id TEXT PRIMARY KEY,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      sent_at DATETIME
    )
  `);
}

const db = createDb(dbPath);

module.exports = { db, dbPath };
