// routes/books.js  –  all /books endpoints

const express = require('express');
const router  = express.Router();
const db      = require('../db');

/* ─────────────────────────────────────────────
   Helper: build a consistent error response
───────────────────────────────────────────── */
const err = (res, status, message) =>
  res.status(status).json({ message });

/* ─────────────────────────────────────────────
   Helper: validate POST / PUT body
   Returns an array of error strings (empty = OK)
───────────────────────────────────────────── */
function validateBook(body) {
  const errors = [];

  if (!body.title || String(body.title).trim() === '') {
    errors.push('title is required');
  }
  if (!body.author || String(body.author).trim() === '') {
    errors.push('author is required');
  }
  if (body.price === undefined || body.price === null || body.price === '') {
    errors.push('price is required');
  } else if (isNaN(Number(body.price)) || Number(body.price) < 0) {
    errors.push('price must be a non-negative number');
  }

  return errors;
}

/* ─────────────────────────────────────────────
   GET /books
   Query params:
     search_q  – partial title match (LIKE)
     order_by  – column: title | author | price  (default: title)
     order     – ASC | DESC                      (default: ASC)
     limit     – max rows                        (default: 10)
     offset    – rows to skip                    (default: 0)
     min_price – lower bound                     (default: 0)
     max_price – upper bound                     (default: 99999)
───────────────────────────────────────────── */
router.get('/', (req, res) => {
  // ── 1. Parse and sanitise query parameters ──────────────────
  const search_q  = req.query.search_q  || '';
  const min_price = parseFloat(req.query.min_price) || 0;
  const max_price = parseFloat(req.query.max_price) || 99999;
  const limit     = parseInt(req.query.limit)       || 10;
  const offset    = parseInt(req.query.offset)      || 0;

  // Whitelist order_by to prevent SQL injection via column name
  const allowedColumns = ['title', 'author', 'price'];
  const order_by = allowedColumns.includes(req.query.order_by)
    ? req.query.order_by
    : 'title';

  // Whitelist order direction
  const order = req.query.order === 'DESC' ? 'DESC' : 'ASC';

  // ── 2. Build parameterised query ────────────────────────────
  const sql = `
    SELECT * FROM books
    WHERE  title LIKE ?
    AND    price BETWEEN ? AND ?
    ORDER  BY ${order_by} ${order}
    LIMIT  ? OFFSET ?
  `;

  const rows = db.prepare(sql).all(
    `%${search_q}%`,
    min_price,
    max_price,
    limit,
    offset
  );

  res.status(200).json({
    total: rows.length,
    limit,
    offset,
    data: rows,
  });
});

/* ─────────────────────────────────────────────
   GET /books/:id
───────────────────────────────────────────── */
router.get('/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);

  if (!book) return err(res, 404, `Book with id ${req.params.id} not found`);

  res.status(200).json(book);
});

/* ─────────────────────────────────────────────
   POST /books  –  create a new book
───────────────────────────────────────────── */
router.post('/', (req, res) => {
  // Validate body
  const errors = validateBook(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join('; ') });
  }

  const { title, author, price } = req.body;

  const result = db
    .prepare('INSERT INTO books (title, author, price) VALUES (?, ?, ?)')
    .run(title.trim(), author.trim(), Number(price));

  const newBook = db
    .prepare('SELECT * FROM books WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json({
    message: 'Book created successfully',
    data: newBook,
  });
});

/* ─────────────────────────────────────────────
   PUT /books/:id  –  update an existing book
───────────────────────────────────────────── */
router.put('/:id', (req, res) => {
  // Check existence first
  const existing = db
    .prepare('SELECT * FROM books WHERE id = ?')
    .get(req.params.id);

  if (!existing) return err(res, 404, `Book with id ${req.params.id} not found`);

  // Validate body
  const errors = validateBook(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join('; ') });
  }

  const { title, author, price } = req.body;

  db.prepare(
    'UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?'
  ).run(title.trim(), author.trim(), Number(price), req.params.id);

  const updated = db
    .prepare('SELECT * FROM books WHERE id = ?')
    .get(req.params.id);

  res.status(200).json({
    message: 'Book updated successfully',
    data: updated,
  });
});

/* ─────────────────────────────────────────────
   DELETE /books/:id
───────────────────────────────────────────── */
router.delete('/:id', (req, res) => {
  const book = db
    .prepare('SELECT * FROM books WHERE id = ?')
    .get(req.params.id);

  if (!book) return err(res, 404, `Book with id ${req.params.id} not found`);

  db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);

  res.status(200).json({
    message: `Book "${book.title}" deleted successfully`,
  });
});

module.exports = router;
