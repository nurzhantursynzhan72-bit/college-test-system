const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { db } = require('./db');

const DATA_DIR = path.join(__dirname, '../data');

function readData(file) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) return [];
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

function migrate() {
  try {
    console.log('Кестелер тексерілді.');

    // Users
    const users = readData('users.json');
    if (users.length > 0) {
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
      if (userCount.count === 0) {
        console.log(`Users көшірілуде (${users.length})...`);
        const insertUser = db.prepare('INSERT INTO users (id, name, email, phone, password, role, group_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        for (const u of users) {
          insertUser.run(u.id, u.name, u.email, u.phone, u.password, u.role, u.group || '', u.createdAt || new Date().toISOString());
        }
      }
    }

    // Tests
    const tests = readData('tests.json');
    if (tests.length > 0) {
      const testCount = db.prepare('SELECT COUNT(*) as count FROM tests').get();
      if (testCount.count === 0) {
        console.log(`Tests көшірілуде (${tests.length})...`);
        const insertTest = db.prepare('INSERT INTO tests (id, title, subject, group_name, duration, created_by, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        const insertQuestion = db.prepare('INSERT INTO questions (id, test_id, text, options, correct) VALUES (?, ?, ?, ?, ?)');
        
        for (const t of tests) {
          insertTest.run(t.id, t.title, t.subject || '', t.group || '', t.duration || 20, t.createdBy, t.createdAt || new Date().toISOString(), t.active ? 1 : 0);
          
          if (t.questions && t.questions.length > 0) {
            for (const q of t.questions) {
              insertQuestion.run(crypto.randomUUID(), t.id, q.text, JSON.stringify(q.options), q.correct);
            }
          }
        }
      }
    }

    // Results
    const results = readData('results.json');
    if (results.length > 0) {
      const resultCount = db.prepare('SELECT COUNT(*) as count FROM results').get();
      if (resultCount.count === 0) {
        console.log(`Results көшірілуде (${results.length})...`);
        const insertResult = db.prepare('INSERT INTO results (id, user_id, test_id, correct, total, score, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
        for (const r of results) {
          insertResult.run(r.id, r.userId, r.testId, r.correct, r.total, r.score, r.submittedAt || new Date().toISOString());
        }
      }
    }

    console.log('Миграция сәтті аяқталды!');
  } catch (err) {
    console.error('Миграция кезінде қате кетті:', err);
  }
}

migrate();
