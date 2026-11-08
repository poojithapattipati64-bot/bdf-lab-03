// db.js  –  opens (or creates) the SQLite database using Node.js built-in sqlite
//           Requires Node.js >= 22.5.0  (available as node:sqlite)

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'books.db');

const db = new DatabaseSync(DB_PATH);

// Create the books table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    title  TEXT    NOT NULL,
    author TEXT    NOT NULL,
    price  REAL    NOT NULL CHECK(price >= 0)
  );
`);

// Seed only when the table is empty
const count = db.prepare('SELECT COUNT(*) AS cnt FROM books').get();
if (count.cnt === 0) {
  const insert = db.prepare(
    'INSERT INTO books (title, author, price) VALUES (?, ?, ?)'
  );

  const seedData = [
    ["The Alchemist",                        "Paulo Coelho",          350],
    ["Harry Potter and the Sorcerer's Stone","J.K. Rowling",          499],
    ["To Kill a Mockingbird",                "Harper Lee",            299],
    ["1984",                                 "George Orwell",         399],
    ["The Great Gatsby",                     "F. Scott Fitzgerald",   249],
    ["Clean Code",                           "Robert C. Martin",      799],
    ["You Don't Know JS",                    "Kyle Simpson",          599],
    ["Deep Work",                            "Cal Newport",           450],
    ["Atomic Habits",                        "James Clear",           549],
    ["The Pragmatic Programmer",             "Andrew Hunt",           849],
  ];

  for (const row of seedData) {
    insert.run(...row);
  }

  console.log('Database seeded with 10 sample books.');
}

module.exports = db;
