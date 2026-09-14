# Caloriq — Smart Nutrition Tracker

> A full-stack nutrition tracking web application with user authentication, daily meal logging, automatic nutrition calculation, macro analytics, meal history, and a responsive dark-mode dashboard — evolved from a C++ console application into a modern web application.

[Dashboard](https://github.com/Nagalakshmi-Murugan/nutriton-tracker/blob/main/screenshots/image.png) ([image](https://github.com/Nagalakshmi-Murugan/nutriton-tracker/raw/main/screenshots/image.png))

---

## Table of Contents

* [Project Overview](#project-overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Architecture Overview](#architecture-overview)
* [Project Structure](#project-structure)
* [Database Schema](#database-schema)
* [Installation Guide](#installation-guide)
* [Environment Setup](#environment-setup)
* [Running the Application](#running-the-application)
* [API Endpoints](#api-endpoints)
* [Screenshots](#screenshots)
* [Future Improvements](#future-improvements)
* [Learning Outcomes](#learning-outcomes)
* [Author](#author)

---

## Project Overview

**Caloriq** is a full-stack nutrition tracking web application that allows users to create an account, securely log in, record daily food intake, automatically calculate nutrition values based on food and quantity, view macro-nutrient data, browse 30 days of meal history, and monitor live dashboard analytics.

This project began as a **C++ console application** (`docs/main.cpp`) with file-based persistence and a text menu. It was then re-architected into a modern web application with a **Node.js/Express REST API**, **MySQL database**, and a **vanilla JavaScript frontend**.

The application now includes session-based authentication and user-specific data isolation, allowing each registered user to maintain their own food logs and nutrition history.

Key engineering decisions made during the transition:

* Replaced flat-file storage (`foods.txt`) with a relational MySQL database
* Replaced the console I/O loop with a REST API serving JSON to a dynamic frontend
* Added date-based data isolation so meals are tracked per day
* Added user-based data isolation so each authenticated user can access only their own food logs
* Added session-based authentication using `express-session`
* Added password hashing using `bcryptjs`
* Added a reusable food reference database containing nutrition values
* Added automatic nutrition calculation based on food, quantity, measurement unit, and reference quantity
* Added support for grams, millilitres, and pieces depending on the selected food
* Built a responsive dark-mode UI with sidebar navigation, live statistics, and a 30-day history view

---

## Features

### User Authentication

* **User registration** — create an account using a unique username and password
* **Password hashing** — passwords are hashed using `bcryptjs` before being stored
* **Session-based authentication** — logged-in users are identified through a server-side session
* **Protected routes** — food logging, editing, deletion, and history require authentication
* **User-specific data** — every food log is associated with a `user_id`
* **Session cookie** — the browser receives an HTTP-only session cookie
* **Seven-day session** — authenticated sessions are configured to last up to seven days
* **Logout** — users can destroy their active session

### Dashboard

* **Live macro cards** — total calories, protein, carbs, and fat for the selected day
* **Highest calorie food** — identifies the most calorie-dense item logged that day
* **Average calories per item** — running average across entries for the day
* **Health Score** — a 0–100 rule-based score derived from calorie, protein, fat, and carb targets
* **Daily calorie goal** — set a custom calorie target and track remaining or exceeded calories

### Meal Logging

* **Food selection** — choose a food from the predefined food database
* **Quantity-based logging** — enter the amount consumed
* **Automatic nutrition calculation** — calories and macros are calculated by the backend
* **Automatic measurement unit** — the unit comes from the food database rather than being trusted from the client
* **Multiple measurement types** — supports grams, millilitres, and pieces
* **Add food entries** — save calculated nutrition values to the user's food log
* **Edit entries** — update the nutrition information of an existing entry
* **Delete entries** — remove individual food entries
* **Search / filter** — filter logged foods by name

### Automatic Nutrition Calculation

The backend uses the following general formula:

```text
nutrition value =
    value per reference quantity
    ×
    (entered quantity / reference quantity)
```

For example, if Rice has a reference quantity of 100 grams:

```text
130 calories per 100g

200g Rice
= 130 × (200 / 100)
= 260 calories
```

For a food measured in pieces, such as an Egg:

```text
70 calories per 1 piece

2 Eggs
= 70 × (2 / 1)
= 140 calories
```

The same calculation logic works for all supported measurement types without requiring separate calculation code for each food.

### Food Reference Database

The application includes a predefined nutrition database containing:

| Food    | Unit  | Reference Quantity | Calories | Protein | Carbs |  Fat |
| ------- | ----- | -----------------: | -------: | ------: | ----: | ---: |
| Rice    | grams |                100 |      130 |     2.7 |  28.0 |  0.3 |
| Roti    | piece |                  1 |      120 |     3.0 |  18.0 |  3.7 |
| Egg     | piece |                  1 |       70 |     6.0 |   0.6 |  5.0 |
| Chicken | grams |                100 |      165 |    31.0 |   0.0 |  3.6 |
| Milk    | ml    |                100 |       61 |     3.2 |   4.8 |  3.3 |
| Banana  | piece |                  1 |      105 |     1.3 |  27.0 |  0.4 |
| Apple   | piece |                  1 |       95 |     0.5 |  25.0 |  0.3 |
| Oats    | grams |                100 |      389 |    17.0 |  66.0 |  7.0 |
| Dal     | grams |                100 |      116 |     9.0 |  20.0 |  0.4 |
| Potato  | grams |                100 |       87 |     1.9 |  20.0 |  0.1 |
| Tomato  | grams |                100 |       18 |     0.9 |   3.9 |  0.2 |
| Paneer  | grams |                100 |      265 |    18.0 |   1.2 | 21.0 |
| Curd    | grams |                100 |       60 |     3.5 |   4.7 |  3.3 |
| Bread   | grams |                100 |      265 |     9.0 |  49.0 |  3.2 |

### Date Navigation

* **Date picker** — jump to any past date
* **Previous / Next day buttons** — navigate between dates
* **Today restriction** — forward navigation beyond the current date is blocked
* **Friendly date labels** — dates can be displayed as Today, Yesterday, or a formatted date

### Meal History

* **30-day history panel** — displays daily calories, protein, carbs, fat, and item count
* **One-click drill-down** — select a history date to view that day's entries
* **User-specific history** — history is generated only from the authenticated user's records

### Health Pulse

* **Contextual nutrition tips** — recommendations based on daily nutrition totals
* **Health Score** — rule-based score based on calorie and macro targets

### UI / UX

* **Dark-mode design** — deep navy/charcoal visual design
* **Sidebar navigation** — navigation between dashboard sections
* **Responsive layout** — adapts to different screen sizes
* **Client-side rendering** — data is fetched and rendered using the Fetch API
* **Authentication interface** — separate login and registration page

---

## Tech Stack

| Layer                  | Technology                               |
| ---------------------- | ---------------------------------------- |
| **Frontend**           | HTML5, CSS3, Vanilla JavaScript          |
| **Backend**            | Node.js, Express.js                      |
| **Database**           | MySQL 8+                                 |
| **Database Driver**    | mysql2                                   |
| **Authentication**     | express-session, bcryptjs                |
| **API**                | REST API, Fetch API                      |
| **Session Management** | Express session cookies                  |
| **Runtime**            | Node.js, CommonJS modules                |
| **Fonts**              | Google Fonts — DM Sans, Playfair Display |

> No frontend framework is used. The UI is built with plain HTML, CSS, and JavaScript to demonstrate browser and frontend fundamentals.

---

## Architecture Overview

```text
                         Browser
                            |
             +--------------+--------------+
             |                             |
        login.html                     index.html
             |                             |
         auth.js                       script.js
             |                             |
             +--------------+--------------+
                            |
                       Fetch API
                  credentials: include
                            |
                            | HTTP
                            v
                   Node.js / Express
                       server.js
                            |
        +-------------------+-------------------+
        |                   |                   |
   Authentication       Food Routes        Food Database
        |                   |                   |
   /api/register        /foods          /api/food-database
   /api/login           /history
   /api/logout
   /api/me
        |
   express-session
        |
      bcryptjs
        |
        +-------------------+
                            |
                           db.js
                            |
                         mysql2
                            |
                            v
                         MySQL
                            |
          +-----------------+------------------+
          |                 |                  |
        users             foods        food_database
```

### Authentication Flow

```text
Register
   |
   v
Validate username/password
   |
   v
bcrypt password hashing
   |
   v
Store user in MySQL
   |
   v
Create session
   |
   v
Session cookie sent to browser
   |
   v
Authenticated requests
```

During login:

```text
Username + Password
        |
        v
Find user by username
        |
        v
bcrypt.compareSync()
        |
        +---- Invalid ----> 401
        |
        v
Create session
        |
        v
Authenticated user
```

### Food Logging Flow

```text
Select Food
    |
    v
Enter Quantity
    |
    v
POST /foods
    |
    v
Check Authentication
    |
    v
Look up food_database
    |
    v
Get reference quantity + nutrition values
    |
    v
Calculate calories/macros
    |
    v
Insert into foods with user_id
    |
    v
Dashboard updated
```

The measurement unit is determined by the server from `food_database`, rather than being accepted from the client.

---

## Project Structure

```text
nutriton-tracker/
│
├── backend/
│   ├── server.js              # Express server, authentication and REST API
│   ├── db.js                  # MySQL database connection
│   ├── package.json           # Node dependencies
│   └── package-lock.json      # Locked dependency tree
│
├── frontend/
│   ├── index.html             # Main nutrition dashboard
│   ├── login.html             # Login and registration page
│   ├── auth.js                # Authentication frontend logic
│   ├── script.js              # Dashboard and food logging logic
│   └── style.css              # Application styling
│
├── database/
│   ├── schema.sql                     # Initial database schema
│   ├── food_database_migration.sql    # Food reference database migration
│   ├── food_units_migration.sql       # Measurement unit migration
│   └── auth_migration.sql             # Authentication migration
│
├── docs/
│   └── main.cpp               # Original C++ console application
│
├── screenshots/               # UI screenshots
├── README.md
└── .gitignore
```

---

## Database Schema

The application uses three main tables:

```text
nutrition_tracker
│
├── users
│   ├── id
│   ├── username
│   ├── password_hash
│   └── created_at
│
├── foods
│   ├── id
│   ├── user_id
│   ├── name
│   ├── quantity_amount
│   ├── quantity_unit
│   ├── calories
│   ├── protein
│   ├── carbs
│   ├── fat
│   └── logged_date
│
└── food_database
    ├── id
    ├── name
    ├── default_unit
    ├── reference_quantity
    ├── calories_per_reference
    ├── protein_per_reference
    ├── carbs_per_reference
    └── fat_per_reference
```

### Users Table

Stores registered users.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Passwords are never stored directly. The application stores a bcrypt hash in `password_hash`.

### Foods Table

Stores food entries logged by users.

The `user_id` column associates each entry with the authenticated user.

The `logged_date` column allows the application to retrieve food entries for a specific day.

The `quantity_amount` and `quantity_unit` columns store the quantity and measurement used when the food was logged.

### Food Database Table

Stores reusable nutrition reference information.

```text
food_database
├── id
├── name
├── default_unit
├── reference_quantity
├── calories_per_reference
├── protein_per_reference
├── carbs_per_reference
└── fat_per_reference
```

Unlike the logged `foods` table, this table stores reference nutrition values used to calculate the values for newly logged entries.

### User Data Isolation

Every protected food query uses the authenticated user's ID.

For example:

```sql
SELECT *
FROM foods
WHERE logged_date = ?
AND user_id = ?;
```

The same ownership check is used for update and delete operations.

This prevents a logged-in user from accessing or modifying another user's food entries.

---

## Database Migrations

The database was developed incrementally through migrations.

Run the files in this order:

```text
1. schema.sql
        |
        v
2. food_database_migration.sql
        |
        v
3. food_units_migration.sql
        |
        v
4. auth_migration.sql
```

### Phase 1 — Initial Schema

Creates the original `foods` table and adds `logged_date` for date-based meal tracking.

### Phase 2 — Food Database

Adds the reusable `food_database` table containing reference nutrition values.

### Phase 3 — Measurement Units

Adds:

* `default_unit`
* `reference_quantity`
* `quantity_amount`
* `quantity_unit`

It also converts selected foods to their natural measurement units.

Examples:

* Rice → grams
* Chicken → grams
* Milk → ml
* Egg → piece
* Apple → piece
* Banana → piece
* Roti → piece

### Phase 4 — Authentication

Adds the `users` table and associates food entries with users through `user_id`.

The migration is non-destructive and does not delete existing food logs.

When the first user registers, existing legacy food rows where `user_id IS NULL` are assigned to that first account.

---

## Installation Guide

### Prerequisites

| Tool    | Minimum Version |
| ------- | --------------- |
| Node.js | 18.x or higher  |
| npm     | 9.x or higher   |
| MySQL   | 8.0 or higher   |

### Step 1 — Clone the repository

```bash
git clone https://github.com/Nagalakshmi-Murugan/nutriton-tracker.git
cd nutriton-tracker
```

### Step 2 — Create the database

Run the initial schema:

```bash
mysql -u root -p < database/schema.sql
```

Or open `database/schema.sql` in MySQL Workbench and execute it.

### Step 3 — Run the food database migration

```bash
mysql -u root -p nutrition_tracker < database/food_database_migration.sql
```

### Step 4 — Run the measurement-unit migration

```bash
mysql -u root -p nutrition_tracker < database/food_units_migration.sql
```

### Step 5 — Run the authentication migration

```bash
mysql -u root -p nutrition_tracker < database/auth_migration.sql
```

The migrations must be executed in the specified order.

### Step 6 — Install backend dependencies

```bash
cd backend
npm install
```

---

## Environment Setup

Create a `.env` file inside the `backend/` directory.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nutrition_tracker
PORT=3000
SESSION_SECRET=your_session_secret
```

### Environment Variables

| Variable         | Description                         |
| ---------------- | ----------------------------------- |
| `DB_HOST`        | MySQL host                          |
| `DB_USER`        | MySQL username                      |
| `DB_PASSWORD`    | MySQL password                      |
| `DB_NAME`        | Database name                       |
| `PORT`           | Backend server port                 |
| `SESSION_SECRET` | Secret used to sign session cookies |

The application also contains a development fallback for `SESSION_SECRET`, but a real secret should always be configured before deployment.

Never commit `.env` to GitHub.

Your `.gitignore` should include:

```text
.env
node_modules/
```

---

## Running the Application

### Start the backend

```bash
cd backend
node server.js
```

Expected output:

```text
Server running on port 3000
```

### Start the frontend

Open another terminal from the project root:

```bash
npx serve frontend
```

Open the URL provided by the static server.

The application starts with the authentication page.

```text
Login / Register
        |
        v
Nutrition Dashboard
```

---

## API Endpoints

Base URL:

```text
http://localhost:3000
```

### Health Check

| Method | Endpoint | Authentication | Description                          |
| ------ | -------- | -------------- | ------------------------------------ |
| `GET`  | `/`      | No             | Confirms that the backend is running |

Response:

```text
Backend Running
```

---

### Authentication

#### `POST /api/register`

Creates a new user account.

**Request body:**

```json
{
  "username": "nagalakshmi",
  "password": "password123"
}
```

Validation:

* Username must contain at least 3 characters
* Password must contain at least 6 characters
* Username must be unique

The password is hashed using `bcryptjs` before being stored.

**Response:**

```json
{
  "username": "nagalakshmi"
}
```

Returns `201 Created` after successful registration.

---

#### `POST /api/login`

Authenticates an existing user.

**Request body:**

```json
{
  "username": "nagalakshmi",
  "password": "password123"
}
```

The backend retrieves the user's password hash and verifies the password using `bcrypt.compareSync()`.

**Response:**

```json
{
  "username": "nagalakshmi"
}
```

An authenticated session is created after successful login.

---

#### `POST /api/logout`

Destroys the current session.

Response:

```text
Logged out
```

---

#### `GET /api/me`

Checks whether the current session belongs to a logged-in user.

**Authenticated response:**

```json
{
  "username": "nagalakshmi"
}
```

Returns `401 Unauthorized` if no active session exists.

---

## Food Database API

### `GET /api/food-database`

Returns the public food reference database.

The endpoint returns:

* Food name
* Default measurement unit
* Reference quantity
* Calories per reference
* Protein per reference
* Carbohydrates per reference
* Fat per reference

Example:

```json
[
  {
    "id": 1,
    "name": "Rice",
    "default_unit": "grams",
    "reference_quantity": 100,
    "calories_per_reference": 130,
    "protein_per_reference": 2.7,
    "carbs_per_reference": 28,
    "fat_per_reference": 0.3
  }
]
```

This endpoint does not expose user-specific information and therefore does not require authentication.

---

## Foods API

All `/foods` endpoints require an authenticated session.

### `GET /foods`

Returns food entries for the authenticated user for a selected date.

**Query parameter:**

```text
date=YYYY-MM-DD
```

Example:

```text
GET /foods?date=2026-06-20
```

The query filters by both:

```text
logged_date
+
user_id
```

---

### `POST /foods`

Adds a new food entry.

The client sends only:

```json
{
  "name": "Chicken",
  "quantity": 200
}
```

The backend then:

1. Validates the food name.
2. Validates the quantity.
3. Finds the food in `food_database`.
4. Reads its reference quantity and nutrition values.
5. Determines the correct measurement unit.
6. Calculates the nutritional values.
7. Stores the result with the authenticated user's `user_id`.
8. Stores the current local date.

For example:

```text
Chicken
Reference quantity = 100g
Calories = 165

Quantity = 200g

Calories = 165 × (200 / 100)
         = 330 kcal
```

The server determines the measurement unit from the database rather than trusting a client-provided unit.

---

### `PUT /foods/:id`

Updates an existing food entry belonging to the authenticated user.

**Request body:**

```json
{
  "name": "Chicken",
  "calories": 330,
  "protein": 62,
  "carbs": 0,
  "fat": 7.2
}
```

The SQL query includes both the food ID and authenticated user's ID:

```sql
UPDATE foods
SET name=?, calories=?, protein=?, carbs=?, fat=?
WHERE id=? AND user_id=?
```

This prevents users from modifying another user's food entries.

---

### `DELETE /foods/:id`

Deletes a food entry belonging to the authenticated user.

The backend checks both:

```text
food id
+
authenticated user id
```

before deleting the row.

---

## History API

### `GET /history`

Returns the latest 30 days of aggregated food history for the authenticated user.

The endpoint calculates:

* Item count
* Total calories
* Total protein
* Total carbohydrates
* Total fat

Example response:

```json
[
  {
    "logged_date": "2026-06-20",
    "item_count": 4,
    "total_calories": 1820,
    "total_protein": 112,
    "total_carbs": 198,
    "total_fat": 54
  }
]
```

The query groups records by `logged_date` and limits the result to the latest 30 days.

---

## Error Responses

Common responses include:

| Status | Meaning                                              |
| ------ | ---------------------------------------------------- |
| `201`  | Account created successfully                         |
| `200`  | Request completed successfully                       |
| `400`  | Invalid input                                        |
| `401`  | User is not authenticated or credentials are invalid |
| `404`  | Food not found                                       |
| `409`  | Username already exists                              |
| `500`  | Server or database error                             |

Examples:

```text
Username must be at least 3 characters
```

```text
Password must be at least 6 characters
```

```text
That username is already taken
```

```text
Invalid username or password
```

```text
Not logged in
```

```text
Food not found
```

---

## Screenshots

### Dashboard — Live Macro Stats

[Dashboard](./screenshots/imagedashboard2.png)

### Meal History — 30-Day Log

[Meal History](./screenshots/history.png)

### Log Food Entry — Add Form

[Add Food Form](./screenshots/add-food.png)

### Food Table — Edit and Delete

[Food Table](./screenshots/food-table.png) 

---

## Future Improvements

### Backend & Data

* Add stronger server-side validation middleware
* Add `DECIMAL` support for logged nutrition values where fractional precision is required
* Switch from a single MySQL connection to a connection pool
* Expand the food database with more food items
* Add additional nutrition information such as fibre, sugar, sodium, and micronutrients

### Authentication & Security

* Add password reset functionality
* Add username recovery
* Add stronger authentication rate limiting
* Use a persistent session store for production deployment
* Enable secure HTTPS cookies in production
* Add additional security middleware

### Frontend

* Add macro progress rings or charts
* Persist calorie goals per user
* Add bulk food logging
* Add customizable nutrition targets
* Add more detailed analytics
* Add additional dashboard visualizations

### Infrastructure

* Add automated API tests
* Add CI/CD using GitHub Actions
* Deploy the backend and database
* Deploy the frontend
* Add production logging and monitoring

---

## Learning Outcomes

Building Caloriq covered the following areas of software engineering.

### Full-Stack Development

* Designed and implemented REST API endpoints using Express.js
* Connected a Node.js backend to MySQL using the `mysql2` driver
* Built a dynamic frontend using HTML, CSS, and Vanilla JavaScript
* Used the Fetch API for asynchronous client-server communication
* Implemented CRUD operations across frontend, backend, and database layers

### Authentication & Security

* Implemented user registration and login
* Used `bcryptjs` for password hashing
* Implemented session-based authentication with `express-session`
* Used HTTP-only session cookies
* Protected application routes with authentication middleware
* Associated food records with authenticated users
* Prevented users from reading, modifying, or deleting another user's food entries

### Database Design

* Designed relational tables for users, food logs, and nutrition reference data
* Used primary keys and foreign keys
* Added schema changes through incremental migrations
* Used parameterized SQL queries
* Used aggregation functions such as `SUM()` and `COUNT()`
* Used `GROUP BY` and date filtering for meal history
* Implemented user-specific data isolation at the database query level

### Nutrition Data Processing

* Created a reusable food reference database
* Implemented reference-quantity-based nutrition calculations
* Supported multiple measurement units
* Used a single calculation formula for grams, millilitres, and pieces
* Separated reference nutrition data from user-specific food logs

### Debugging & Problem Solving

* Diagnosed and fixed a timezone bug where `Date.toISOString()` produced a different calendar date than the local timezone
* Traced the issue across MySQL, Node.js, and frontend JavaScript
* Fixed the date handling at the appropriate application layers
* Debugged frontend-backend communication during authentication development
* Tested REST API behavior using Thunder Client

### Software Design

* Re-architected a C++ console application into a full-stack web application
* Replaced file-based persistence with relational database storage
* Separated frontend, backend, authentication, and database responsibilities
* Used incremental database migrations as requirements evolved
* Designed reusable nutrition reference data rather than requiring users to manually enter nutrition values

---

## Author

NAGALAKSHMI

* GitHub: [Nagalakshmi-Murugan](https://github.com/Nagalakshmi-Murugan)
* Email: [n4772754@gmail.com](mailto:n4772754@gmail.com)

---

> This project was built as a portfolio project to demonstrate full-stack web development skills including REST API design, relational database integration, authentication, session management, frontend-backend communication, database migrations, nutrition data processing, and real-world debugging.
