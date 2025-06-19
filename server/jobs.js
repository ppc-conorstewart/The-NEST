// server/jobs.js

const path = require('path');
const Database = require('better-sqlite3');

// 🔌 Connect to database
const dbPath = path.join(__dirname, 'flyhq_jobs.db');
const db = new Database(dbPath);

// ✅ Ensure table exists (with a new "status" column)
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
    valve_7_1_16 TEXT,
    valve_5_1_8 TEXT,
    valve_hyd TEXT,
    valve_man TEXT,
    gateway_pods INTEGER,
    awc_pods INTEGER,
    grease_unit INTEGER,
    coil_trees INTEGER,
    accumulator INTEGER,
    techs TEXT,
    status TEXT,          -- ← NEW: track job status (e.g. "not-locked", "in-progress", "completed")
    work_orders TEXT
  )
`).run();

// If this table was created before (without "status"), attempt to add the column.
// (If it already exists, this will fail silently because we catch any error.)
try {
  db.prepare(`ALTER TABLE jobs ADD COLUMN status TEXT`).run();
} catch (err) {
  // Column already exists or other harmless error → ignore
}

module.exports = {
  getAllJobs: () => {
    // Return every column (including new "status")
    const stmt = db.prepare(`
      SELECT
        id,
        customer,
        surface_lsd,
        products,
        rig_in_date,
        start_date,
        end_date,
        num_wells,
        valve_7_1_16,
        valve_5_1_8,
        valve_hyd,
        valve_man,
        gateway_pods,
        awc_pods,
        grease_unit,
        coil_trees,
        accumulator,
        techs,
        status,
        work_orders
      FROM jobs
      ORDER BY id DESC
    `);
    return stmt.all();
  },

  getJobById: (id) => {
    const stmt = db.prepare(`SELECT * FROM jobs WHERE id = ?`);
    return stmt.get(id);
  },

  addJob: (job) => {
    // When inserting a new job, we default status to "not-locked"
    const stmt = db.prepare(`
      INSERT INTO jobs (
        customer,
        surface_lsd,
        products,
        rig_in_date,
        start_date,
        end_date,
        num_wells,
        valve_7_1_16,
        valve_5_1_8,
        valve_hyd,
        valve_man,
        gateway_pods,
        awc_pods,
        grease_unit,
        coil_trees,
        accumulator,
        techs,
        status,
        work_orders
      ) VALUES (
        @customer,
        @surface_lsd,
        @products,
        @rig_in_date,
        @start_date,
        @end_date,
        @num_wells,
        @valve_7_1_16,
        @valve_5_1_8,
        @valve_hyd,
        @valve_man,
        @gateway_pods,
        @awc_pods,
        @grease_unit,
        @coil_trees,
        @accumulator,
        @techs,
        @status,
        @work_orders
      )
    `);

    // Provide defaults for any missing keys; at minimum, set status to "not-locked"
    const toInsert = {
      customer: job.customer || '',
      surface_lsd: job.surface_lsd || '',
      products: job.products || '',
      rig_in_date: job.rig_in_date || '',
      start_date: job.start_date || '',
      end_date: job.end_date || '',
      num_wells: job.num_wells != null ? job.num_wells : 0,
      valve_7_1_16: job.valve_7_1_16 || '',
      valve_5_1_8: job.valve_5_1_8 || '',
      valve_hyd: job.valve_hyd || '',
      valve_man: job.valve_man || '',
      gateway_pods: job.gateway_pods != null ? job.gateway_pods : 0,
      awc_pods: job.awc_pods != null ? job.awc_pods : 0,
      grease_unit: job.grease_unit != null ? job.grease_unit : 0,
      coil_trees: job.coil_trees != null ? job.coil_trees : 0,
      accumulator: job.accumulator != null ? job.accumulator : 0,
      techs: job.techs || '',
      status: job.status || 'not-locked',
      work_orders: job.work_orders || ''
    };

    stmt.run(toInsert);
  },

  updateJob: (id, fields) => {
    // 1) Fetch the existing record
    const existing = db
      .prepare(`SELECT * FROM jobs WHERE id = ?`)
      .get(id);

    if (!existing) {
      throw new Error(`Job with id ${id} not found`);
    }

    // 2) Merge only the provided fields into the existing object
    //    (Ignore any keys in `fields` that are not actual columns.)
    const merged = {
      customer: fields.customer != null ? fields.customer : existing.customer,
      surface_lsd:
        fields.surface_lsd != null ? fields.surface_lsd : existing.surface_lsd,
      products: fields.products != null ? fields.products : existing.products,
      rig_in_date:
        fields.rig_in_date != null ? fields.rig_in_date : existing.rig_in_date,
      start_date:
        fields.start_date != null ? fields.start_date : existing.start_date,
      end_date: fields.end_date != null ? fields.end_date : existing.end_date,
      num_wells: fields.num_wells != null ? fields.num_wells : existing.num_wells,
      valve_7_1_16:
        fields.valve_7_1_16 != null ? fields.valve_7_1_16 : existing.valve_7_1_16,
      valve_5_1_8:
        fields.valve_5_1_8 != null ? fields.valve_5_1_8 : existing.valve_5_1_8,
      valve_hyd: fields.valve_hyd != null ? fields.valve_hyd : existing.valve_hyd,
      valve_man: fields.valve_man != null ? fields.valve_man : existing.valve_man,
      gateway_pods:
        fields.gateway_pods != null ? fields.gateway_pods : existing.gateway_pods,
      awc_pods: fields.awc_pods != null ? fields.awc_pods : existing.awc_pods,
      grease_unit:
        fields.grease_unit != null ? fields.grease_unit : existing.grease_unit,
      coil_trees:
        fields.coil_trees != null ? fields.coil_trees : existing.coil_trees,
      accumulator:
        fields.accumulator != null ? fields.accumulator : existing.accumulator,
      techs: fields.techs != null ? fields.techs : existing.techs,
      status: fields.status != null ? fields.status : existing.status,
      work_orders:
        fields.work_orders != null ? fields.work_orders : existing.work_orders
    };

    // 3) Update with all columns (the merged object contains every column now)
    const stmt = db.prepare(`
      UPDATE jobs SET
        customer = @customer,
        surface_lsd = @surface_lsd,
        products = @products,
        rig_in_date = @rig_in_date,
        start_date = @start_date,
        end_date = @end_date,
        num_wells = @num_wells,
        valve_7_1_16 = @valve_7_1_16,
        valve_5_1_8 = @valve_5_1_8,
        valve_hyd = @valve_hyd,
        valve_man = @valve_man,
        gateway_pods = @gateway_pods,
        awc_pods = @awc_pods,
        grease_unit = @grease_unit,
        coil_trees = @coil_trees,
        accumulator = @accumulator,
        techs = @techs,
        status = @status,
        work_orders = @work_orders
      WHERE id = @id
    `);
    stmt.run({ ...merged, id });
  },

  deleteJob: (id) => {
    db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
  }
};
