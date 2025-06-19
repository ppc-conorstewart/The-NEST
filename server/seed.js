const path = require('path');
const Database = require('better-sqlite3');

// === Seed Jobs ===
const jobsDB = new Database(path.join(__dirname, 'flyhq_jobs.db'));

jobsDB.prepare(`
  INSERT INTO jobs (
    customer, surface_lsd, products, rig_in_date, start_date, end_date, num_wells,
    valve_7_1_16, valve_5_1_8, valve_hyd, valve_man,
    gateway_pods, awc_pods, grease_unit, coil_trees, accumulator,
    techs, work_orders
  ) VALUES (
    'Cenovus', '10-34-049-07W5', 'Frac Valves', '2025-06-10',
    '2025-06-12', '2025-06-18', 2, 'Y', 'N', 'Y', 'Y',
    1, 1, 1, 2, 1, '3', 'WO-0001'
  )
`).run();

console.log('✅ Seeded flyhq_jobs.db with 1 job');

// === Seed Assets (safely detect actual columns) ===
const assetsDB = new Database(path.join(__dirname, 'flyhq_assets.db'));

// Fetch schema
const assetColumns = assetsDB.prepare(`PRAGMA table_info(assets);`).all();
const columnNames = assetColumns.map(col => col.name);

// Dynamically seed based on available columns
const insertableColumns = [];
const insertableValues = [];

// Sample asset data (adjust as needed)
const testAsset = {
  name: 'Grease Unit',
  serial_number: 'GU-123',
  status: 'Available',
  location: 'Yard A',
  notes: 'Recently serviced',
  category: 'Pressure Control',
  asset_tag: 'TAG-0001',
  date_added: '2024-05-30'
};

// Match only columns that actually exist in DB
for (const key in testAsset) {
  if (columnNames.includes(key)) {
    insertableColumns.push(key);
    insertableValues.push(testAsset[key]);
  }
}

if (insertableColumns.length) {
  const placeholders = insertableColumns.map(() => '?').join(', ');
  const insertSQL = `INSERT INTO assets (${insertableColumns.join(', ')}) VALUES (${placeholders})`;

  assetsDB.prepare(insertSQL).run(...insertableValues);
  console.log(`✅ Seeded flyhq_assets.db with 1 asset using columns: ${insertableColumns.join(', ')}`);
} else {
  console.warn('⚠️ No matching columns found for seeding assets');
}
