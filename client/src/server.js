
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./flyhq_assets.db', (err) => {
  if (err) return console.error(err.message);
  console.log('✅ Connected to the SQLite database.');
});

// Create assets table if not exists
db.run(
  'CREATE TABLE IF NOT EXISTS assets (' +
  'id TEXT PRIMARY KEY,' +
  'name TEXT NOT NULL,' +
  'category TEXT,' +
  'location TEXT,' +
  'status TEXT,' +
  'last_modified DATETIME DEFAULT CURRENT_TIMESTAMP' +
  ')'
);

// GET all assets
app.get('/api/assets', (req, res) => {
  db.all('SELECT * FROM assets', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});


// POST a new asset
app.post('/api/assets', (req, res) => {
  const { id, name, category, location, status } = req.body;
  const query = `
    INSERT INTO assets (id, name, category, location, status)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(query, [id, name, category, location, status], function(err) {
    if (err) return res.status(500).send(err.message);
    res.status(201).json({ id });
  });
});

// PUT update asset
app.put('/api/assets/:id', (req, res) => {
  const { name, category, location, status } = req.body;
  const query = `
    UPDATE assets
    SET name = ?, category = ?, location = ?, status = ?, last_modified = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  db.run(query, [name, category, location, status, req.params.id], function(err) {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(204);
  });
});

// DELETE an asset
app.delete('/api/assets/:id', (req, res) => {
  const query = 'DELETE FROM assets WHERE id = ?';
  db.run(query, [req.params.id], function(err) {
    if (err) return res.status(500).send(err.message);
    res.sendStatus(204);
  });
});

app.listen(3002, () => {
  console.log('🔧 Asset API running on http://localhost:3002');
});

