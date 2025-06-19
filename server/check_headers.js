// check_headers.js
const path = require('path');
const XLSX = require('xlsx');

const workbookPath = path.join(__dirname, 'assets.xlsx');
const workbook = XLSX.readFile(workbookPath);
const sheetName = workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

// Log the very first row (headers)
if (rows.length > 0) {
  console.log('Headers:', rows[0]);
} else {
  console.log('No data found in first sheet.');
}
