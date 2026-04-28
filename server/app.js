const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');

let db;
function getDb() {
  if (db) return db;
  db = require('./db').db;
  return db;
}

const app = express();
const SECRET = process.env.SESSION_SECRET || 'college-secret-2024';

const rootDist = path.join(__dirname, '../client/dist');
const CLIENT_DIST_DIR = fs.existsSync(rootDist) ? rootDist : path.join(__dirname, '../dist');

// ── Cookie session helpers ────────────────────────────────────────────────────
function signPayload(user) {
  const data = Buffer.from(JSON.stringify(user)).toString('base64');
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyPayload(token) {
  try {
    const [data, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    if (sig !== expected) return null;
    return JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
  } catch { return null; }
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.cookies = {};
  (req.headers.cookie || '').split(';').forEach(part => {
    const [k, ...v] = part.trim().split('=');
    if (k) req.cookies[k.trim()] = decodeURIComponent(v.join('='));
  });

  const token = req.cookies['edu_session'];
  req.session = { user: token ? verifyPayload(token) : null };

  res.saveSession = (user) => {
    const t = signPayload(user);
    res.setHeader('Set-Cookie', `edu_session=${encodeURIComponent(t)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  };
  res.clearSession = () => {
    res.setHeader('Set-Cookie', 'edu_session=; Path=/; HttpOnly; Max-Age=0');
  };
  next();
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// ── API Router ────────────────────────────────────────────────────────────────
const apiRouter = express.Router();
app.use('/api', apiRouter);

apiRouter.get('/health', (req, res) => res.json({ ok: true }));

// ── AUTH ──────────────────────────────────────────────────────────────────────
apiRouter.post('/register', (req, res) => {
  const db = getDb();
  const { name, email, phone, password, group } = req.body;
  if (!name || !email || !phone || !password || !group)
    return res.json({ success: false, message: 'Барлық өрістерді толтырыңыз' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.json({ success: false, message: 'Бұл email тіркелген' });

  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);

  try {
    db.prepare('INSERT INTO users (id, name, email, phone, password, role, group_name) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, email, phone, hash, 'student', group);
    const user = { id, name, email, role: 'student', group };
    res.saveSession(user);
    res.json({ success: true, role: 'student' });
  } catch (err) {
    console.error('Register error:', err);
    res.json({ success: false, message: 'Тіркелу кезінде қате кетті' });
  }
});

apiRouter.post('/login', (req, res) => {
  const db = getDb();
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: 'Email және пароль енгізіңіз' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password))
    return res.json({ success: false, message: 'Email немесе пароль қате' });

  const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role, group: user.group_name };
  res.saveSession(sessionUser);
  res.json({ success: true, role: user.role });
});

apiRouter.post('/logout', (req, res) => {
  res.clearSession();
  res.json({ success: true });
});

apiRouter.get('/me', (req, res) => {
  if (!req.session.user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user: req.session.user });
});

// ── GROUPS ────────────────────────────────────────────────────────────────────
apiRouter.get('/groups', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT group_name FROM users WHERE role = "student" AND group_name IS NOT NULL AND group_name != ""').all();
  res.json({ success: true, groups: rows.map(r => r.group_name) });
});

// ── STUDENT ROUTES ────────────────────────────────────────────────────────────
apiRouter.get('/tests', (req, res) => {
  if (!req.session.user) return res.json({ success: false, message: 'Кіру қажет' });
  const user = req.session.user;
  const db = getDb();

  let tests = db.prepare('SELECT t.*, (SELECT COUNT(*) FROM questions q WHERE q.test_id = t.id) as questionCount FROM tests t').all();

  if (user.role === 'student') {
    tests = tests.filter(t => {
      if (!t.active) return false;
      if (!t.group_name) return false;
      const targetGroups = t.group_name.split(',').map(g => g.trim());
      return targetGroups.includes(user.group);
    }).map(t => ({ id: t.id, title: t.title, subject: t.subject, duration: t.duration, group: t.group_name, questionCount: t.questionCount }));
  } else {
    tests = tests.map(t => ({ id: t.id, title: t.title, subject: t.subject, duration: t.duration, group: t.group_name, questionCount: t.questionCount, active: t.active }));
  }
  res.json({ success: true, tests });
});

apiRouter.get('/test/:id', (req, res) => {
  if (!req.session.user) return res.json({ success: false });
  const db = getDb();
  const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(req.params.id);
  if (!test) return res.json({ success: false, message: 'Тест табылмады' });

  const questions = db.prepare('SELECT id, text, options FROM questions WHERE test_id = ?').all(test.id);
  res.json({
    success: true,
    test: {
      id: test.id, title: test.title, subject: test.subject,
      duration: test.duration, group: test.group_name,
      questions: questions.map(q => ({ id: q.id, text: q.text, options: JSON.parse(q.options) }))
    }
  });
});

apiRouter.post('/submit', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'student')
    return res.json({ success: false });

  const { testId, answers } = req.body;
  const db = getDb();
  const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(testId);
  if (!test) return res.json({ success: false });

  const questions = db.prepare('SELECT * FROM questions WHERE test_id = ?').all(testId);
  let correct = 0;
  questions.forEach(q => {
    if (answers[q.id] !== undefined && parseInt(answers[q.id]) === q.correct) correct++;
  });

  const total = questions.length;
  const score = Math.round((correct / total) * 100);
  const resultId = uuidv4();

  db.prepare('INSERT INTO results (id, user_id, test_id, correct, total, score) VALUES (?, ?, ?, ?, ?, ?)')
    .run(resultId, req.session.user.id, testId, correct, total, score);

  res.json({ success: true, correct, total, score });
});

apiRouter.get('/my-results', (req, res) => {
  if (!req.session.user) return res.json({ success: false });
  const db = getDb();
  const results = db.prepare(`
    SELECT r.*, t.title as testTitle 
    FROM results r JOIN tests t ON r.test_id = t.id
    WHERE r.user_id = ?
  `).all(req.session.user.id);
  res.json({ success: true, results });
});

// ── TEACHER ROUTES ────────────────────────────────────────────────────────────
apiRouter.get('/teacher/tests', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'teacher')
    return res.json({ success: false, message: 'Рұқсат жоқ' });

  const db = getDb();
  const tests = db.prepare(`
    SELECT t.*, (SELECT COUNT(*) FROM questions q WHERE q.test_id = t.id) as questionCount 
    FROM tests t WHERE created_by = ?
  `).all(req.session.user.email);

  res.json({
    success: true, tests: tests.map(t => ({
      id: t.id, title: t.title, subject: t.subject, group: t.group_name,
      duration: t.duration, questionCount: t.questionCount,
      active: t.active, createdAt: t.created_at
    }))
  });
});

apiRouter.post('/teacher/test', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'teacher')
    return res.json({ success: false, message: 'Рұқсат жоқ' });

  const { title, subject, group, duration, questions } = req.body;
  if (!title || !group || !questions || questions.length < 1)
    return res.json({ success: false, message: 'Деректер жетіспейді' });

  const testId = uuidv4();
  const db = getDb();
  const insertAll = db.transaction(() => {
    db.prepare('INSERT INTO tests (id, title, subject, group_name, duration, created_by, active) VALUES (?, ?, ?, ?, ?, ?, 1)')
      .run(testId, title, subject || '', group, parseInt(duration) || 20, req.session.user.email);
    const qStmt = db.prepare('INSERT INTO questions (id, test_id, text, options, correct) VALUES (?, ?, ?, ?, ?)');
    for (const q of questions) {
      qStmt.run(uuidv4(), testId, q.text, JSON.stringify(q.options), q.correct);
    }
  });

  try {
    insertAll();
    res.json({ success: true });
  } catch (err) {
    console.error('Create test error:', err);
    res.json({ success: false, message: 'Серверде қате кетті' });
  }
});

apiRouter.get('/teacher/results', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'teacher')
    return res.json({ success: false });

  const results = db.prepare(`
    SELECT r.*, u.name as userName, u.email as userEmail, u.group_name as userGroup, t.title as testTitle
    FROM results r
    JOIN users u ON r.user_id = u.id
    JOIN tests t ON r.test_id = t.id
    WHERE t.created_by = ?
  `).all(req.session.user.email);

  res.json({ success: true, results });
});

apiRouter.delete('/teacher/test/:id', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'teacher')
    return res.json({ success: false });
  const db = getDb();
  db.prepare('DELETE FROM tests WHERE id = ? AND created_by = ?').run(req.params.id, req.session.user.email);
  res.json({ success: true });
});

// ── ADMIN ROUTES ──────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Рұқсат жоқ' });
  next();
}

apiRouter.get('/admin/users', requireAdmin, (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, name, email, phone, role, group_name, created_at as createdAt FROM users').all();
  res.json({ success: true, users: users.map(u => ({ ...u, group: u.group_name })) });
});

apiRouter.delete('/admin/user/:id', requireAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

apiRouter.get('/admin/results', requireAdmin, (req, res) => {
  const db = getDb();
  const results = db.prepare(`
    SELECT r.*, u.name as userName, u.email as userEmail, u.group_name as userGroup, t.title as testTitle
    FROM results r
    JOIN users u ON r.user_id = u.id
    JOIN tests t ON r.test_id = t.id
  `).all();
  res.json({ success: true, results });
});

apiRouter.get('/admin/export', requireAdmin, (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT * FROM users WHERE role = "student"').all();
  const results = db.prepare(`
    SELECT r.*, u.name as userName, u.email as userEmail, u.group_name as userGroup, t.title as testTitle
    FROM results r
    JOIN users u ON r.user_id = u.id
    JOIN tests t ON r.test_id = t.id
  `).all();

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    users.map(u => ({ 'Аты-жөні': u.name, 'Email': u.email, 'Телефон': u.phone, 'Тобы': u.group_name }))
  ), 'Студенттер');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    results.map(r => ({ 'Аты-жөні': r.userName, 'Email': r.userEmail, 'Тобы': r.userGroup, 'Тест': r.testTitle, 'Балл (%)': r.score }))
  ), 'Нәтижелер');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="college-results.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

apiRouter.all('*', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.url}` });
});

// ── Static & SPA ──────────────────────────────────────────────────────────────
app.use(express.static(CLIENT_DIST_DIR));

app.get('*', (req, res) => {
  const indexPath = path.join(CLIENT_DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Run: npm run build:client');
  }
});

// ── Local dev ─────────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
  });
}

module.exports = app;
