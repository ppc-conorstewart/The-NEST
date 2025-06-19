// import_assets.js
const path = require('path');
const Database = require('better-sqlite3');
const XLSX = require('xlsx');

// 1) Open the database
const dbPath = path.join(__dirname, 'flyhq_assets.db');
const db = new Database(dbPath);

// 2) Read the Excel file
const workbookPath = path.join(__dirname, 'assets.xlsx');
const workbook = XLSX.readFile(workbookPath);
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// 3) Prepare INSERT statement (including sn)
const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO assets (id, name, category, sn, status, location)
  VALUES (@id, @name, @category, @sn, @status, @location)
`);

// 4) Loop through each row and run INSERT
for (const row of data) {
  insertStmt.run({
    id: row.id,
    name: row.name,
    category: row.category,
    sn: row.sn,
    status: row.status,
    location: row.location,
  });
}

console.log('Import complete. Inserted', data.length, 'rows.');
db.close();
