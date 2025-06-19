// assets.js

const path = require('path');
const Database = require('better-sqlite3');

// 1) Open (or create) flyhq_assets.db in this folder
const dbPath = path.join(__dirname, 'flyhq_assets.db');

const db = new Database(dbPath);

// 2) Create (if needed) the assets table with these columns (including sn)
db.prepare(`
  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    sn TEXT,
    status TEXT,
    location TEXT
  )
`).run();

// 3) Create (if needed) the activity_log table with these columns
db.prepare(`
  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    action TEXT,
    asset_id TEXT,
    details TEXT,
    user TEXT
  )
`).run();

module.exports = {
  /** Retrieve all assets sorted by ID */
  getAllAssets: () => {
    return db.prepare(`
      SELECT *
      FROM assets
      ORDER BY id ASC
    `).all();
  },

  /**
   * Insert a new asset (id, name, category, sn, status, location), then log "Added Asset".
   * @param {Object} asset — { id, name, category, sn, status, location }
   * @param {String} user  — Discord username
   */
  addAsset: (asset, user) => {
    db.prepare(`
      INSERT INTO assets (
        id, name, category, sn, status, location
      ) VALUES (
        @id, @name, @category, @sn, @status, @location
      )
    `).run({
      id: asset.id,
      name: asset.name || '',
      category: asset.category || '',
      sn: asset.sn || '',
      status: asset.status || '',
      location: asset.location || '',
    });

    const now = new Date().toISOString();
    const action = 'Added Asset';      // ✔ matches ActivityLogTable.jsx
    const asset_id = asset.id;
    const details = JSON.stringify({
      name: asset.name,
      category: asset.category,
      sn: asset.sn,
      status: asset.status,
      location: asset.location,
    });

    db.prepare(`
      INSERT INTO activity_log (
        timestamp, action, asset_id, details, user
      ) VALUES (?, ?, ?, ?, ?)
    `).run(now, action, asset_id, details, user);
  },

  /**
   * Update (transfer) an existing asset by ID, then log "Updated Asset".
   * @param {String} id       — e.g. "PPC 000127"
   * @param {Object} changes  — e.g. { location: "Grand Prairie", sn: "12345" }
   * @param {String} user     — Discord username
   */
  updateAsset: (id, changes, user) => {
    const oldAsset = db.prepare(`
      SELECT *
      FROM assets
      WHERE id = ?
    `).get(id);
    if (!oldAsset) {
      throw new Error(`Asset with ID "${id}" not found.`);
    }

    const fields = Object.keys(changes);
    if (fields.length === 0) return;
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => changes[f]);
    values.push(id);

    db.prepare(`
      UPDATE assets
      SET ${setClause}
      WHERE id = ?
    `).run(...values);

    const now = new Date().toISOString();
    const action = 'Updated Asset';
    const details = JSON.stringify({
      name: oldAsset.name,
      category: oldAsset.category,
      sn: oldAsset.sn,
      ...changes,
    });

    db.prepare(`
      INSERT INTO activity_log (
        timestamp, action, asset_id, details, user
      ) VALUES (?, ?, ?, ?, ?)
    `).run(now, action, id, details, user);
  },

  /**
   * Transfer multiple assets at once; log a single "Transferred Multiple Assets".
   * @param {Array<String>} assetIds
   * @param {String} newLocation
   * @param {String} user
   */
  transferMultipleAssets: (assetIds, newLocation, user) => {
    if (!Array.isArray(assetIds) || assetIds.length === 0) return;

    const placeholder = assetIds.map(() => '?').join(',');
    const oldRows = db
      .prepare(`
        SELECT id, name, sn
        FROM assets
        WHERE id IN (${placeholder})
      `)
      .all(...assetIds);

    if (oldRows.length === 0) return;

    const updateStmt = db.prepare(`
      UPDATE assets
      SET location = ?
      WHERE id = ?
    `);
    assetIds.forEach((aid) => {
      updateStmt.run(newLocation, aid);
    });

    const items = oldRows.map((row) => ({
      id: row.id,
      name: row.name,
      sn: row.sn,
    }));

    const now = new Date().toISOString();
    const action = 'Transferred Multiple Assets';  // ✔ matches ActivityLogTable.jsx
    const details = JSON.stringify({
      items,
      newLocation,
    });

    db.prepare(`
      INSERT INTO activity_log (
        timestamp, action, asset_id, details, user
      ) VALUES (?, ?, ?, ?, ?)
    `).run(now, action, items[0].id, details, user);
  },

  /**
   * Delete a single asset by ID, then log "Deleted Asset" with full details.
   * @param {String} id       — e.g. "PPC 000127"
   * @param {String} user     — Discord username
   */
  deleteAsset: (id, user) => {
    // 1) Retrieve the existing asset details before deleting
    const oldAsset = db.prepare(`
      SELECT *
      FROM assets
      WHERE id = ?
    `).get(id);

    if (!oldAsset) {
      throw new Error(`Asset with ID "${id}" not found.`);
    }

    // 2) Delete the asset from the table
    const deleteInfo = db.prepare(`
      DELETE FROM assets
      WHERE id = ?
    `).run(id);

    if (deleteInfo.changes === 0) {
      throw new Error(`Asset with ID "${id}" could not be deleted.`);
    }

    // 3) Log the deletion in activity_log with full asset details
    const now = new Date().toISOString();
    const action = 'Deleted Asset';   // ✔ matches ActivityLogTable.jsx
    const details = JSON.stringify({
      name: oldAsset.name,
      category: oldAsset.category,
      sn: oldAsset.sn,
      status: oldAsset.status,
      location: oldAsset.location,
    });

    db.prepare(`
      INSERT INTO activity_log (
        timestamp, action, asset_id, details, user
      ) VALUES (?, ?, ?, ?, ?)
    `).run(now, action, id, details, user);
  },

  /**
   * Retrieve the full activity log with raw fields intact.
   */
  getActivityLog: () => {
    return db.prepare(`
      SELECT
        id,
        timestamp,
        action,
        asset_id,
        details,
        user
      FROM activity_log
      ORDER BY timestamp DESC
    `).all();
  },
};
