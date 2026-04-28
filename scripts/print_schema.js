const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('data/database.sqlite');
const tables = db
  .prepare(
    "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  )
  .all();

for (const t of tables) {
  process.stdout.write(`\n# ${t.name}\n${t.sql}\n`);
}

