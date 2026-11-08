# Lab 3 – Books REST API

A RESTful API for managing books, built with **Node.js**, **Express**, and **SQLite** (via `better-sqlite3`).

Covers search, sorting, pagination, price filters, input validation, and correct HTTP status codes.

---

## 🚀 Setup

```bash
npm install
npm start
```

The server starts at `http://localhost:3000`.

---

## 📦 Endpoints

### GET `/books`
Fetch all books with optional filters.

| Query Param  | Default     | Description                          |
|-------------|-------------|--------------------------------------|
| `search_q`  | `""`        | Partial title match (LIKE)           |
| `order_by`  | `"title"`   | Column to sort by (`title`, `author`, `price`) |
| `order`     | `"ASC"`     | Sort direction (`ASC` or `DESC`)     |
| `limit`     | `10`        | Max rows to return                   |
| `offset`    | `0`         | Rows to skip                         |
| `min_price` | `0`         | Minimum price filter                 |
| `max_price` | `99999`     | Maximum price filter                 |

**Example:**
```
GET /books?search_q=harry&order_by=price&order=DESC&limit=5&offset=0&min_price=200&max_price=800
```

---

### GET `/books/:id`
Get a single book by ID.

- **200** – Book found  
- **404** – Book not found

---

### POST `/books`
Create a new book.

**Request body (JSON):**
```json
{
  "title": "The Alchemist",
  "author": "Paulo Coelho",
  "price": 350
}
```

- **201** – Book created  
- **400** – Validation error (missing/invalid fields)

---

### PUT `/books/:id`
Update an existing book.

- **200** – Book updated  
- **400** – Validation error  
- **404** – Book not found

---

### DELETE `/books/:id`
Delete a book.

- **200** – Book deleted  
- **404** – Book not found

---

## 🐛 Debugging Exercise

The file `broken_app.js` contains **four intentional bugs**:

| # | Bug | Symptom |
|---|-----|---------|
| 1 | Wrong port (3000 used twice) | `EADDRINUSE` error on startup |
| 2 | Wrong import path (`./db/databse`) | `Cannot find module` crash |
| 3 | Table name typo (`boks` instead of `books`) | `no such table: boks` SQLite error |
| 4 | Missing `await` on async DB call | Undefined result / silent failure |

Fix all four bugs to make `broken_app.js` work correctly.

---

## 🧪 Viva Questions

**Q: Query parameter vs path parameter?**  
A: Path params (`/books/:id`) identify a specific resource. Query params (`?search_q=...`) filter or modify a collection.

**Q: What does stateless mean?**  
A: Each HTTP request is independent – the server holds no session state between requests. All needed data comes in the request itself.

**Q: Which status code for bad input vs a missing record?**  
A: `400 Bad Request` for invalid/missing input. `404 Not Found` when the record doesn't exist.

---

## ⚠️ Rules

- Never commit `.env` or `node_modules`
- Use only parameterised queries – no string concatenation in SQL
- Every route returns the correct status code
