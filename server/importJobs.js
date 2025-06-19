const path = require('path');
const Database = require('better-sqlite3');
const xlsx = require('xlsx');

// === Load database ===
const db = new Database(path.join(__dirname, 'flyhq_jobs.db'));

// === Load Excel ===
const workbook = xlsx.readFile(path.join(__dirname, '../import_jobs.xlsx'));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawJobs = xlsx.utils.sheet_to_json(sheet, { raw: false }); // Read values as text

// === Clean value
const clean = (val, fallback = '') => {
  if (!val || val === '-' || val === 'TBD' || val === 'N/A') return fallback;
  return typeof val === 'string' ? val.trim() : val;
};

// === Convert Excel date serial to yyyy-mm-dd
const toDate = (val) => {
  if (!val || typeof val !== 'string') return '';
  const parsed = Date.parse(val);
  if (isNaN(parsed)) return '';
  return new Date(parsed).toISOString().slice(0, 10);
};

// === Convert to integer
const toInt = (val, fallback = 0) => {
  if (!val || typeof val === 'boolean') return fallback;
  const str = String(val).replace(/[^\d]/g, '');
  const num = parseInt(str, 10);
  return isNaN(num) ? fallback : num;
};

// === Prepare insert
const insert = db.prepare(`
  INSERT INTO jobs (
    customer, surface_lsd, products, rig_in_date,
    start_date, end_date, num_wells, valve_7_1_16,
    valve_5_1_8, valve_hyd, valve_man, gateway_pods,
    awc_pods, grease_unit, coil_trees, accumulator,
    techs, work_orders
  ) VALUES (
    @customer, @surface_lsd, @products, @rig_in_date,
    @start_date, @end_date, @num_wells, @valve_7_1_16,
    @valve_5_1_8, @valve_hyd, @valve_man, @gateway_pods,
    @awc_pods, @grease_unit, @coil_trees, @accumulator,
    @techs, @work_orders
  )
`);

let imported = 0;
let skipped = 0;

for (const row of rawJobs) {
  const required = row['Customer'] && row['Start'] && row['# Wells'];
  if (!required) {
    skipped++;
    continue;
  }

  const job = {
    customer: clean(row['Customer']),
    surface_lsd: clean(row['LSD']),
    products: clean(row['Product(s)']),
    rig_in_date: toDate(row['Rig-In']),
    start_date: toDate(row['Start']),
    end_date: toDate(row['End']),
    num_wells: toInt(row['# Wells']),
    valve_7_1_16: clean(row['7-1/16']),
    valve_5_1_8: clean(row['5-1/8']),
    valve_hyd: clean(row['HYD']),
    valve_man: clean(row['MAN']),
    gateway_pods: toInt(row['G-Pods']),
    awc_pods: toInt(row['AWC']),
    grease_unit: toInt(row['Grease']),
    coil_trees: toInt(row['Coil']),
    accumulator: toInt(row['Acc']),
    techs: clean(row['Techs']),
    work_orders: clean(row['W.O.'])
  };

  try {
    insert.run(job);
    imported++;
  } catch (err) {
    console.warn('⚠️ Failed to import row:', job);
    console.error(err.message);
    skipped++;
  }
}

console.log(`\n✅ Imported ${imported} job(s) into flyhq_jobs.db`);
if (skipped > 0) {
  console.warn(`⚠️ Skipped ${skipped} row(s) due to missing or malformed data\n`);
}
