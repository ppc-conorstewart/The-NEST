const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'flyhq_jobs.db'));

const result = db.prepare(`PRAGMA table_info(jobs);`).all();

console.log('🔎 jobs table schema:');
result.forEach(col => {
  console.log(`- ${col.name} (${col.type})`);
});
