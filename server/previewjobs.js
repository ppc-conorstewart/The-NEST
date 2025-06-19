const path = require('path');
const Database = require('better-sqlite3');

// Load the database
const dbPath = path.join(__dirname, 'flyhq_jobs.db');
const db = new Database(dbPath);

// Fetch first 10 jobs
const jobs = db.prepare('SELECT * FROM jobs ORDER BY id ASC LIMIT 10').all();

console.log(`\n📋 Previewing first ${jobs.length} job(s) from the database:\n`);

if (jobs.length === 0) {
  console.log('⚠️  No jobs found in the database.\n');
  process.exit(0);
}

// Display each job
jobs.forEach((job, index) => {
  console.log(`ROW ${index + 1}`);
  console.log('----------------------------------------');
  console.log(`🧾 Customer      : ${job.customer}`);
  console.log(`📍 Surface LSD   : ${job.surface_lsd}`);
  console.log(`📦 Products      : ${job.products}`);
  console.log(`🛠️  Rig-In Date   : ${job.rig_in_date}`);
  console.log(`📅 Start Date    : ${job.start_date}`);
  console.log(`📅 End Date      : ${job.end_date}`);
  console.log(`🔢 Wells         : ${job.num_wells}`);
  console.log(`🔩 7-1/16        : ${job.valve_7_1_16}`);
  console.log(`🔩 5-1/8         : ${job.valve_5_1_8}`);
  console.log(`⚙️ HYD           : ${job.valve_hyd}`);
  console.log(`⚙️ MAN           : ${job.valve_man}`);
  console.log(`📡 G-Pods        : ${job.gateway_pods}`);
  console.log(`🛢️ AWC Pods      : ${job.awc_pods}`);
  console.log(`🧴 Grease Units  : ${job.grease_unit}`);
  console.log(`🌲 Coil Trees    : ${job.coil_trees}`);
  console.log(`🔋 Accumulator   : ${job.accumulator}`);
  console.log(`👷 Techs         : ${job.techs}`);
  console.log(`📄 Work Orders   : ${job.work_orders}`);
  console.log('\n');
});
