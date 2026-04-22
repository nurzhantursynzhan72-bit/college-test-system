const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new DatabaseSync(dbPath);

console.log('=========================================');
console.log('      МӘЛІМЕТТЕР БАЗАСЫ (SQLite)         ');
console.log('=========================================\n');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();

for (const table of tables) {
  console.log(`\n--- Кесте: ${table.name.toUpperCase()} ---`);
  
  // Бағандарды алу
  const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
  const colNames = columns.map(c => c.name).join(' | ');
  console.log(`Бағандар: ${colNames}`);
  
  // Мәліметтерді алу
  const rows = db.prepare(`SELECT * FROM ${table.name} LIMIT 5`).all();
  if (rows.length === 0) {
    console.log('  (Кесте бос)');
  } else {
    console.log('  Мәліметтер (алғашқы 5 қатар):');
    console.table(rows);
  }
}

console.log('\n=========================================');
