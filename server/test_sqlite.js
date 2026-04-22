const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('test.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS test (
    id INTEGER PRIMARY KEY,
    name TEXT
  )
`);
const insert = db.prepare('INSERT INTO test (name) VALUES (?)');
insert.run('Hello Node SQLite');
const result = db.prepare('SELECT * FROM test').all();
console.log(result);
