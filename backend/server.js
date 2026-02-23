const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const db = new sqlite3.Database('quotes.db');

db.run(`CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id INTEGER UNIQUE,
  completed BOOLEAN DEFAULT 0
)`);

// GET stats
app.get('/api/stats', (req, res) => {
  db.get(`SELECT COUNT(*) as total, SUM(completed) as completed FROM progress`, (err, row) => {
    if (err) {
      console.error('Stats error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({
      total: 30,
      completed: row?.completed || 0,
      remaining: 30 - (row?.completed || 0)
    });
  });
});

// POST complete quote
app.post('/api/complete/:id', (req, res) => {
  db.run(`INSERT OR IGNORE INTO progress (quote_id, completed) VALUES (?, 1)`, [req.params.id], function(err) {
    if (err) {
      console.error('Complete error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// *** NEW: RESET endpoint ***
app.post('/api/reset', (req, res) => {
  db.run(`DELETE FROM progress`, function(err) {
    if (err) {
      console.error('Reset error:', err);
      return res.status(500).json({ error: 'Database reset failed' });
    }
    res.json({ success: true });
  });
});

app.get('/api/progress', (req, res) => {
    db.all(`SELECT quote_id FROM progress WHERE completed=1`, (err, rows) => {
        res.json(rows ? rows.map(row => row.quote_id) : []);
    });
});

app.listen(3000, () => console.log('🚀 http://localhost:3000'));
