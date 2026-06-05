# Nutrition Tracker

# Caloriq — Smart Nutrition Tracker

A full-stack nutrition tracking web app. Started as a C++ CLI app, evolved into a modern web dashboard with a Node.js backend and MySQL database.

## Features

- Log daily food entries (calories, protein, carbs, fat)
- Dashboard with live macro totals and health score
- Date navigator — browse any past day's meals
- Meal history — last 30 days grouped by date
- Daily calorie goal tracker
- Smart nutrition suggestions
- Real-time food search
- Edit and delete food entries

## Folder Structure

```
nutrition-tracker-web/
├── frontend/
│   ├── index.html        # Dashboard UI
│   ├── script.js         # Frontend logic
│   └── style.css         # Styling
├── db.js                 # MySQL connection
├── server.js             # Express API server
├── main.cpp              # Original C++ CLI version
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Original CLI | C++ |

## Prerequisites

- Node.js v16+
- MySQL 8.0+

## Setup & Installation

### 1. Clone the repo

```bash
git clone https://github.com/Nagalakshmi-Murugan/nutriton-tracker.git
cd nutriton-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MySQL database

```sql
CREATE DATABASE nutrition_tracker;
USE nutrition_tracker;

CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    calories INT,
    protein INT,
    carbs INT,
    fat INT,
    logged_date DATE NOT NULL DEFAULT (CURDATE())
);
```

### 4. Update database credentials

Edit `db.js`:

```javascript
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "nutrition_tracker"
});
```

### 5. Start the server

```bash
node server.js
```

### 6. Open the app

Open `frontend/index.html` in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/foods?date=YYYY-MM-DD` | Get foods for a date |
| POST | `/foods` | Add a food entry |
| PUT | `/foods/:id` | Update a food entry |
| DELETE | `/foods/:id` | Delete a food entry |
| GET | `/history` | Get last 30 days summary |

## Author

**Nagalakshmi Murugan**  
[GitHub](https://github.com/Nagalakshmi-Murugan)
