// server/initJobsTable.js
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'client', 'Main.db'); // ✅ correct relative path
const db = new Database(dbPath);


db.prepare(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT,
    surface_lsd TEXT,
    products TEXT,
    rig_in_date TEXT,
    start_date TEXT,
    end_date TEXT,
    num_wells INTEGER,
    valve_7_1_16 INTEGER,
    valve_5_1_8 INTEGER,
    valve_hyd INTEGER,
    valve_man INTEGER,
    gateway_pods INTEGER,
    awc_pods INTEGER,
    grease_unit TEXT,
    coil_trees TEXT,
    accumulator TEXT,
    techs TEXT,
    work_orders TEXT
  )
`).run();

console.log('✅ Jobs table created successfully.');
