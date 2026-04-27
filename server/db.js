const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Vercel-де файлдық жүйе оқуға ғана арналғандықтан, SQLite базасын /tmp папкасына көшіреміз
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL;
let dbPath = path.join(dataDir, 'database.sqlite');

if (isVercel) {
  const tmpDbPath = path.join('/tmp', 'database.sqlite');
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, tmpDbPath);
  }
  dbPath = tmpDbPath;
}

const db = new DatabaseSync(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    group_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT,
    group_name TEXT,
    duration INTEGER,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT 1,
    FOREIGN KEY (created_by) REFERENCES users(email)
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    test_id TEXT NOT NULL,
    text TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON string
    correct INTEGER NOT NULL,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS results (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    test_id TEXT NOT NULL,
    correct INTEGER,
    total INTEGER,
    score INTEGER,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
  );
`);

module.exports = { db };
