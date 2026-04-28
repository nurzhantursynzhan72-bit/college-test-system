const Database = require('better-sqlite3');
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

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

module.exports = { db, dbPath };

