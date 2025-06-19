// clear-activity-log.js
const path = require('path');
const Database = require('better-sqlite3');

// Adjust this path if your DB is in a different location
const dbPath = path.join(__dirname, 'main.db');

const db = new Database(dbPath);

// (Optional) Print how many rows exist before deletion
const before = db
  .prepare('SELECT COUNT(*) AS cnt FROM activity_log')
  .get().cnt;
console.log('Before deletion, rows in activity_log:', before);

// Delete all rows in activity_log
db.prepare('DELETE FROM activity_log').run();

// (Optional) VACUUM to reclaim space
db.prepare('VACUUM').run();

// (Optional) Print how many rows exist after deletion
const after = db
  .prepare('SELECT COUNT(*) AS cnt FROM activity_log')
  .get().cnt;
console.log('After deletion, rows in activity_log:', after);

db.close();
