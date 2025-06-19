// server/initSourcingTable.js
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'client', 'Main.db'); // ✅ correct relative path
const db = new Database(dbPath);


db.prepare(`
  CREATE TABLE IF NOT EXISTS sourcing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    base TEXT,
    neededBy TEXT,
    project TEXT,
    vendor TEXT,
    category TEXT,
    priority TEXT,
    status TEXT,
    itemDescription TEXT,
    quantity INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`).run();

console.log('✅ Sourcing table created successfully.');
