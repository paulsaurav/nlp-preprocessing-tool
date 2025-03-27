const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const path = require('path');

// Load the Excel file
const workbook = xlsx.readFile(path.join(__dirname, 'OOV.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Parse worksheet data into JSON
const data = xlsx.utils.sheet_to_json(worksheet, {
  header: ['oov_term', 'replacement'],
  range: 1, // Skip header row
});

// Connect to SQLite database
const db = new sqlite3.Database('./aviation_terms.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Create table and seed data
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS term_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      oov_term TEXT UNIQUE,
      replacement TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
      process.exit(1);
    }

    const stmt = db.prepare('INSERT OR IGNORE INTO term_mappings (oov_term, replacement) VALUES (?, ?)');

    data.forEach((row) => {
      const oov = row.oov_term?.toString().trim().toLowerCase();
      const replacement = row.replacement?.toString().trim().toLowerCase();

      if (oov && replacement) {
        stmt.run(oov, replacement, (err) => {
          if (err) {
            console.error(`Error inserting ${oov}:`, err.message);
          }
        });
      }
    });

    stmt.finalize(() => {
      console.log('Database seeded successfully');
      db.close(() => {
        console.log('Database connection closed');
        process.exit(0);
      });
    });
  });
});
