// broken_app.js  –  Debugging Exercise (Lab 3)
//
// This file contains FOUR intentional bugs.
// Find and fix all of them.
//
// Bug 1 : Port conflict  → EADDRINUSE
// Bug 2 : Wrong import path  → Cannot find module
// Bug 3 : Table name typo  → no such table: boks
// Bug 4 : Missing function call parentheses → book is always undefined
//
// Instructions
// ─────────────
// 1.  Read the error messages carefully.
// 2.  Fix each bug one at a time and test.
// 3.  The fixed version should behave exactly like app.js.

require('dotenv').config();

const express = require('express');
const app     = express();

// BUG 1: port conflict — this tries to bind on 3000 while app.js already uses 3000
//         Fix: change this to a free port, e.g. 4000 (or stop the other server first)
const PORT = 3000;    // <-- Bug 1: change to 4000

app.use(express.json());

// BUG 2: wrong import path — 'databse' is a typo; the real file is 'db.js'
//         Fix: change './db/databse' to './db'
const db = require('./db/databse');  // <-- Bug 2: should be './db'

// ── GET /books (simplified, with bug 3) ─────────────────────────────────────
app.get('/books', (req, res) => {
  try {
    // BUG 3: table name typo — 'boks' doesn't exist; should be 'books'
    //         Fix: change 'boks' to 'books'
    const rows = db.prepare('SELECT * FROM boks').all();  // <-- Bug 3

    res.status(200).json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /books/:id (with bug 4) ──────────────────────────────────────────────
app.get('/books/:id', (req, res) => {
  try {
    // BUG 4: .get is referenced but NOT called — missing (req.params.id)
    //         Fix: change '.get' to '.get(req.params.id)'
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get;  // <-- Bug 4

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
