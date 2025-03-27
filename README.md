# ✈️ Aviation Terms Preprocessing API

A simple and powerful Express.js API that preprocesses aviation-related sentences by replacing **out-of-vocabulary (OOV)** terms with standardized replacements using a SQLite database.

---

## 🚀 Features

- ✅ Preprocess aviation text with custom OOV term mappings
- ✅ Add or update OOV → replacement mappings dynamically
- ✅ Fast and lightweight SQLite backend
- ✅ Interactive Swagger API docs at `/api-docs`

---

## 📦 Tech Stack

- **Node.js + Express**
- **SQLite3**
- **Swagger UI (OpenAPI 3.0)**

---

## 📁 Project Structure

```
aviation-preprocessor/
├── aviation_terms.db         # SQLite database with `term_mappings` table
├── index.js                  # Main Express server
├── swagger.yaml              # OpenAPI definition
├── seed.js                   # Seed data to db
└── README.md                 # You're reading it 😎
```

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/aviation-preprocessor.git
cd aviation-preprocessor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database (if not already)

Use SQLite CLI or a GUI like DB Browser to create a `term_mappings` table:

```sql
CREATE TABLE term_mappings (
  oov_term TEXT PRIMARY KEY,
  replacement TEXT NOT NULL
);
```

### 4. Start the server

```bash
node index.js
```

Your API will be running at:  
👉 `http://localhost:3000`

---

## 📘 API Endpoints

### 🔹 `POST /preprocess`

Preprocess a sentence by replacing mapped OOV terms.

#### Request Body

```json
{
  "sentence": "The aircraft deployed its flaperons before landing."
}
```

#### Response

```json
{
  "original": "The aircraft deployed its flaperons before landing.",
  "processed": "The aircraft deployed its control surfaces before landing."
}
```

---

### 🔹 `POST /add-term`

Add or update a term in the mapping database.

#### Request Body

```json
{
  "oov_term": "flaperons",
  "replacement": "control surfaces"
}
```

#### Response

```json
{
  "message": "Term added successfully",
  "term": "flaperons",
  "replacement": "control surfaces"
}
```

---

## 🧪 Swagger Docs

Explore and test the API interactively at:  
🌐 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🛠️ Dev Tips

- All terms are automatically **lowercased** and **trimmed** before insertion.
- Punctuation is stripped from each word before checking it against mappings.
- You can modify the `term_mappings` table directly using any SQLite tool.

---

## 🧙 Author

Built with caffeine and lift by [Your Name]  
🔗 [yourwebsite.com](https://yourwebsite.com)  
🐦 [@yourhandle](https://twitter.com/yourhandle)

---

## 📄 License

MIT License — feel free to fork, star, and fly 🛩️

---
