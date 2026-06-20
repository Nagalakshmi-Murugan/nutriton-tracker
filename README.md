# 🥗 Caloriq — Smart Nutrition Tracker

> A full-stack nutrition tracking web application with daily meal logging, macro analytics, meal history, and a responsive dark-mode dashboard — evolved from a C++ console application into a production-ready web app.

![Dashboard](screenshots/dashboard.png)

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Installation Guide](#-installation-guide)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Future Improvements](#-future-improvements)
- [Learning Outcomes](#-learning-outcomes)
- [Author](#-author)

---

## 🧭 Project Overview

**Caloriq** is a full-stack nutrition tracking web application that lets users log daily food entries with macro-nutrient data (calories, protein, carbs, and fat), browse 30 days of meal history, and view live dashboard analytics.

This project began as a **C++ console application** (`docs/main.cpp`) with file-based persistence and a text menu. It was then re-architected into a modern web application with a **Node.js/Express REST API**, **MySQL database**, and a **vanilla JS single-page frontend** — demonstrating the full software development lifecycle from a terminal program to a browser-based product.

Key engineering decisions made during the transition:

- Replaced flat-file storage (`foods.txt`) with a relational MySQL database for persistent, queryable data
- Replaced the console I/O loop with a REST API serving JSON to a dynamic frontend
- Added date-based data isolation so meals are tracked per day, not in a single global list
- Built a responsive dark-mode UI with sidebar navigation, live stats, and a 30-day history view

---

## ✨ Features

### Dashboard
- **Live macro cards** — total calories, protein, carbs, and fat for the selected day, updated instantly on every add/edit/delete
- **Highest calorie food** — identifies the most calorie-dense item logged that day
- **Average calories per item** — running average across all entries for the day
- **Health Score** — a 0–100 rule-based score derived from calorie, protein, fat, and carb targets
- **Daily calorie goal** — set a custom kcal target; the UI shows remaining or exceeded calories in real time

### Meal Logging
- **Add food entries** — log a food item with name, calories, protein, carbs, and fat in one form submission
- **Edit entries** — update any field of any logged item inline
- **Delete entries** — remove individual food items from the log
- **Search / filter** — live search bar filters the food table by name as you type

### Date Navigation
- **Date picker** — jump to any past date to view or edit its log
- **Prev / Next day buttons** — step through days with arrow buttons; forward navigation is blocked beyond today
- **Friendly date labels** — dates display as "Today", "Yesterday", or a formatted date (e.g. "Mon, Jun 16")

### Meal History
- **30-day history panel** — each past day shown as a card with total kcal, protein, carbs, fat, and item count
- **One-click drill-down** — click "View" on any history card to jump the dashboard to that date

### Health Pulse
- **Contextual nutrition tips** — rule-based recommendations that react to your daily totals (e.g. low protein, high fat, excess calories)

### UI / UX
- **Dark-mode design** — deep navy/charcoal palette with colour-coded macro badges
- **Sidebar navigation** — sticky sidebar with smooth-scroll section links and live today's stats
- **Responsive layout** — fluid grid adapts to different screen sizes
- **Zero page reloads** — all data fetched and rendered client-side via the Fetch API

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3 (custom properties, CSS Grid, Flexbox), Vanilla JavaScript (ES2017+) |
| **Backend** | Node.js, Express.js v5 |
| **Database** | MySQL 8+ with `mysql2` driver |
| **Fonts** | Google Fonts — DM Sans, Playfair Display |
| **Runtime** | Node.js (CommonJS modules) |
| **HTTP** | REST API, Fetch API (client-side), CORS enabled |

> No frontend framework is used — the entire UI is built with plain HTML, CSS, and JavaScript to demonstrate a strong understanding of browser fundamentals.

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  index.html  ──loads──►  style.css                      │
│      │                                                  │
│      └──loads──►  script.js                             │
│                      │                                  │
│              Fetch API calls (JSON)                     │
│                      │                                  │
└──────────────────────┼──────────────────────────────────┘
                       │ HTTP  (port 3000)
┌──────────────────────▼──────────────────────────────────┐
│                  Node.js / Express                       │
│                    server.js                            │
│                                                         │
│   GET  /foods?date=   POST /foods                       │
│   PUT  /foods/:id     DELETE /foods/:id                 │
│   GET  /history                                         │
│                      │                                  │
│                    db.js                                │
└──────────────────────┼──────────────────────────────────┘
                       │ mysql2
┌──────────────────────▼──────────────────────────────────┐
│                     MySQL 8+                            │
│               database: nutrition_tracker               │
│                   table: foods                          │
└─────────────────────────────────────────────────────────┘
```

**Request flow for "Add Food":**
1. User fills in the form and clicks "Add Entry"
2. `script.js` collects form values and sends `POST /foods` with a JSON body
3. `server.js` receives the request, reads today's local date, and runs an `INSERT` query
4. MySQL persists the row with `logged_date = CURDATE()`
5. The frontend reloads the food list and history panel via two follow-up `GET` calls

---

## 📁 Project Structure

```
nutrition-tracker-web/
│
├── backend/
│   ├── server.js          # Express app — all REST route handlers
│   ├── db.js              # MySQL connection (mysql2)
│   ├── package.json       # Node dependencies
│   └── package-lock.json  # Locked dependency tree
│
├── frontend/
│   ├── index.html         # Single-page app shell — layout, sections, nav
│   ├── style.css          # Full dark-mode design system (CSS variables, grid, components)
│   └── script.js          # All frontend logic — fetch calls, DOM rendering, date helpers
│
├── database/
│   └── schema.sql         # MySQL DDL — CREATE DATABASE, CREATE TABLE, ALTER TABLE
│
├── docs/
│   └── main.cpp           # Original C++ console application (v1 of the project)
│
├── screenshots/           # UI screenshots for README
├── README.md
└── .gitignore
```

---

## 🗄 Database Schema

The database uses a single table. The schema was built incrementally — the `logged_date` column was added via `ALTER TABLE` after the initial version, reflecting a real-world iterative schema migration.

```sql
CREATE DATABASE nutrition_tracker;
USE nutrition_tracker;

CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    calories INT,
    protein INT,
    carbs INT,
    fat INT
);
USE nutrition_tracker;

ALTER TABLE foods ADD COLUMN logged_date DATE NOT NULL DEFAULT (CURDATE());
```

| Column | Type | Description |
|---|---|---|
| `id` | INT, PK, AUTO_INCREMENT | Unique row identifier |
| `name` | VARCHAR(100) | Food item name |
| `calories` | INT | Energy in kilocalories |
| `protein` | INT | Protein in grams |
| `carbs` | INT | Carbohydrates in grams |
| `fat` | INT | Fat in grams |
| `logged_date` | DATE | Calendar date the entry was logged (defaults to today) |

The `logged_date` column is the key to date-based isolation — every `GET /foods` query filters by this column, and `GET /history` groups by it to produce the 30-day summary.

---

## ⚙️ Installation Guide

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 18.x or higher |
| npm | 9.x or higher |
| MySQL | 8.0 or higher |

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/nutrition-tracker-web.git
cd nutrition-tracker-web
```

### Step 2 — Set up the database

Open your MySQL client and run the schema file:

```bash
mysql -u root -p < database/schema.sql
```

Or paste the contents of `database/schema.sql` directly into MySQL Workbench / DBeaver.

### Step 3 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 4 — Configure the database connection

Open `backend/db.js` and update the credentials to match your MySQL setup:

```js
const db = mysql.createConnection({
    host:     "localhost",
    user:     "root",        // your MySQL username
    password: "your_password",
    database: "nutrition_tracker"
});
```

> **Security note:** For production or any public repository, move these values into a `.env` file and load them with `dotenv`. Never commit database credentials to version control.

---

## 🔐 Environment Setup (Recommended)

To avoid hardcoding credentials, use environment variables:

**1. Create a `.env` file in the `backend/` folder:**

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nutrition_tracker
PORT=3000
```

**2. Update `backend/db.js` to read from the environment:**

```js
require("dotenv").config();

const db = mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
```

**3. Add `.env` to `.gitignore`:**

```
.env
node_modules/
```

The `dotenv` package is already listed in `package.json` — no extra install needed.

---

## 🚀 Running the Application

### Start the backend server

```bash
cd backend
node server.js
```

Expected output:
```
MySQL Connected
Server running on port 3000
```

### Open the frontend

Open `frontend/index.html` directly in your browser:

```bash
# macOS
open frontend/index.html

# Windows
start frontend/index.html

# Linux
xdg-open frontend/index.html
```

Or serve it with any static file server:

```bash
npx serve frontend
```

The app will be available at `http://localhost:3000` (backend) and the frontend file in your browser.

> **Note:** Both the backend server and the frontend file must be running at the same time. The frontend communicates with the backend at `http://localhost:3000`.

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Returns `"Backend Running"` — confirms the server is alive |

---

### Foods

#### `GET /foods`

Returns all food entries for a specific date, ordered newest first.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `date` | `YYYY-MM-DD` | No | Today (server local date) | The date to fetch entries for |

**Example request:**
```
GET /foods?date=2026-06-20
```

**Example response:**
```json
[
  {
    "id": 12,
    "name": "Chicken Breast",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 4,
    "logged_date": "2026-06-20"
  },
  {
    "id": 11,
    "name": "Brown Rice",
    "calories": 216,
    "protein": 5,
    "carbs": 45,
    "fat": 2,
    "logged_date": "2026-06-20"
  }
]
```

---

#### `POST /foods`

Creates a new food entry. The entry is always saved to today's date (server local time).

**Request body (JSON):**

```json
{
  "name": "Chicken Breast",
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fat": 4
}
```

**Response:** `200 OK` — `"Food added successfully"`

---

#### `PUT /foods/:id`

Updates an existing food entry by ID.

**URL Parameter:** `id` — the integer ID of the food row.

**Request body (JSON):**

```json
{
  "name": "Grilled Chicken",
  "calories": 155,
  "protein": 30,
  "carbs": 0,
  "fat": 3
}
```

**Responses:**
- `200 OK` — `"Food updated successfully"`
- `404 Not Found` — `"Food not found"` (if no row matched the given ID)

---

#### `DELETE /foods/:id`

Deletes a food entry by ID.

**URL Parameter:** `id` — the integer ID of the food row.

**Response:** `200 OK` — `"Food deleted successfully"`

---

### History

#### `GET /history`

Returns a 30-day aggregated meal history, grouped by date. Each row contains the date, item count, and summed macros for that day.

**Example response:**
```json
[
  {
    "logged_date": "2026-06-20",
    "item_count": 4,
    "total_calories": 1820,
    "total_protein": 112,
    "total_carbs": 198,
    "total_fat": 54
  },
  {
    "logged_date": "2026-06-19",
    "item_count": 3,
    "total_calories": 1540,
    "total_protein": 88,
    "total_carbs": 162,
    "total_fat": 47
  }
]
```

---

### Error Responses

All endpoints return `500 Internal Server Error` with a plain-text message if a database query fails. Validation (e.g. missing fields) is currently handled on the frontend via HTML5 `required` attributes.

---

## 📸 Screenshots

> Add your screenshots to the `screenshots/` folder and update the paths below.

### Dashboard — Live Macro Stats
![Dashboard](screenshots/dashboard.png)

### Meal History — 30-Day Log
![Meal History](screenshots/history.png)

### Log Food Entry — Add Form
![Add Food Form](screenshots/add-food.png)

### Food Table — Edit and Delete
![Food Table](screenshots/food-table.png)

---

## 🚧 Future Improvements

These are planned enhancements that would make the project more robust and feature-complete:

**Backend & Data**
- [ ] Move database credentials to `.env` (currently hardcoded in `db.js`)
- [ ] Add input validation middleware on the server (e.g. reject negative calories, empty names)
- [ ] Add `DECIMAL` types for macros to support fractional gram values
- [ ] Add user authentication (JWT) so multiple users can have separate logs
- [ ] Switch from a single DB connection to a connection pool (`mysql2/promise` + pool) for reliability

**Frontend**
- [ ] Add macro progress rings / doughnut charts (Chart.js or D3.js) for visual intake targets
- [ ] Store the calorie goal in `localStorage` so it persists across page reloads
- [ ] Add a "Bulk log" feature to add multiple foods at once from a preset library
- [ ] Add dark/light mode toggle

**Infrastructure**
- [ ] Add a `start` script to `package.json` and document `npm start`
- [ ] Deploy backend to Railway or Render; frontend to Vercel or Netlify
- [ ] Add basic Jest unit tests for API route handlers

---

## 📚 Learning Outcomes

Building Caloriq covered the following areas of software engineering:

**Full-Stack Development**
- Designed and implemented a REST API with Express.js following standard HTTP verb conventions (GET, POST, PUT, DELETE)
- Connected a Node.js backend to a MySQL database using the `mysql2` driver with parameterised queries to prevent SQL injection
- Built a dynamic single-page UI using the Fetch API for asynchronous client-server communication without page reloads

**Database Design**
- Modelled a relational schema and wrote DDL (`CREATE TABLE`, `ALTER TABLE`)
- Used `GROUP BY`, `SUM()`, `COUNT()`, and `DATE_FORMAT()` in aggregate queries for the history endpoint
- Understood the difference between `DATE` and `DATETIME` types and how MySQL serialises them

**Debugging & Problem Solving**
- Diagnosed and fixed a timezone bug where `Date.toISOString()` (UTC) produced a different calendar date than the local timezone, causing food entries to appear under the wrong day in history
- Traced the bug across three layers: MySQL serialisation → Node.js JSON response → frontend date comparison
- Applied the fix at the correct layer (`DATE_FORMAT()` in SQL + local date construction in JS) rather than masking it with workarounds

**Software Design**
- Re-architected a C++ console application with file I/O into a full-stack web application, retaining the same core domain model (Food entity with name, calories, protein, carbs, fat) while replacing every implementation layer
- Separated concerns across frontend, backend, and database layers

---

## 👤 Author

NAGALAKSHMI
- GitHub: [Nagalakshmi-Murugan](https://github.com/Nagalakshmi-Murugan)
- Email: n4772754@gmail.com

---

> *This project was built as a portfolio project to demonstrate full-stack web development skills including REST API design, relational database integration, frontend-backend communication, and real-world debugging.*