// app.js  –  Lab 3: REST API, query parameters, validation, debugging

require('dotenv').config();

const express = require('express');
const app     = express();
const PORT    = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());                 // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────────────────────
const booksRouter = require('./routes/books');
app.use('/books', booksRouter);

// ── 404 handler for unknown routes ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Lab 3 Books API running at http://localhost:${PORT}`);
});
