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
    return instance;
  } catch {
    // Fallback for local/offline environments without native deps installed.
    // eslint-disable-next-line global-require
    const { DatabaseSync } = require('node:sqlite');
    const instance = new DatabaseSync(filePath);
    instance.exec('PRAGMA foreign_keys = ON;');

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

const db = createDb(dbPath);

module.exports = { db, dbPath };
