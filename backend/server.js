const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();

// origin: true reflects whatever origin the request came from (e.g.
// http://localhost:5500), which is what lets the browser send/receive
// the session cookie during local development, where the frontend and
// backend run on different ports. credentials: true is required for
// cookies to be included in cross-origin requests at all.
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Sessions are how the server "remembers" who's logged in between
// requests. On login we store req.session.userId; the browser then
// automatically sends a session cookie back on every later request,
// so we don't have to manually attach a token to every fetch() call.
app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,   // JavaScript on the page can't read the cookie
        secure: false,    // set to true once the app is served over HTTPS
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));

// Blocks any request that doesn't have a logged-in session. Applied to
// every food/history route below so one user can never see or change
// another user's data.
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).send("Not logged in");
    }
    next();
}

// Returns today's date as "YYYY-MM-DD" in the server's LOCAL timezone,
// matching what MySQL CURDATE() returns. Never use toISOString() for dates
// because it returns UTC, which can be a different calendar day.
function localDateStr() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

app.get("/", (req, res) => {
    res.send("Backend Running");
});

// ── authentication ───────────────────────────────────────────
// Passwords are never stored as-is. bcrypt.hash() turns a password
// into a one-way scrambled string (a "hash") — even if the database
// were leaked, the original password can't be recovered from it.
// bcrypt.compare() checks a login attempt against that hash without
// ever needing to know the original password.
app.post("/api/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || typeof username !== "string" || username.trim().length < 3) {
        return res.status(400).send("Username must be at least 3 characters");
    }
    if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).send("Password must be at least 6 characters");
    }

    const cleanUsername = username.trim();

    db.query("SELECT id FROM users WHERE username = ?", [cleanUsername], (err, rows) => {
        if (err) { console.error(err); return res.status(500).send("Error checking username"); }
        if (rows.length > 0) return res.status(409).send("That username is already taken");

        db.query("SELECT COUNT(*) AS count FROM users", [], (err, countRows) => {
            if (err) { console.error(err); return res.status(500).send("Error creating account"); }
            const isFirstUser = countRows[0].count === 0;

            const passwordHash = bcrypt.hashSync(password, 10);
            db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)",
                [cleanUsername, passwordHash], (err, result) => {
                if (err) { console.error(err); return res.status(500).send("Error creating account"); }

                const newUserId = result.insertId;

                // The very first account created "adopts" any food log rows
                // that existed before authentication was added, so that
                // data isn't orphaned once every route requires a user_id.
                const finishRegister = () => {
                    req.session.userId  = newUserId;
                    req.session.username = cleanUsername;
                    res.status(201).json({ username: cleanUsername });
                };

                if (isFirstUser) {
                    db.query("UPDATE foods SET user_id = ? WHERE user_id IS NULL", [newUserId], (err) => {
                        if (err) console.error("Could not backfill legacy food rows:", err);
                        finishRegister();
                    });
                } else {
                    finishRegister();
                }
            });
        });
    });
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send("Username and password are required");
    }

    db.query("SELECT * FROM users WHERE username = ?", [username.trim()], (err, rows) => {
        if (err) { console.error(err); return res.status(500).send("Error logging in"); }
        if (rows.length === 0) return res.status(401).send("Invalid username or password");

        const user = rows[0];
        const passwordMatches = bcrypt.compareSync(password, user.password_hash);
        if (!passwordMatches) return res.status(401).send("Invalid username or password");

        req.session.userId  = user.id;
        req.session.username = user.username;
        res.json({ username: user.username });
    });
});

app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.send("Logged out");
    });
});

// Lets the frontend ask "am I logged in, and as whom?" on page load.
app.get("/api/me", (req, res) => {
    if (!req.session.userId) return res.status(401).send("Not logged in");
    res.json({ username: req.session.username });
});

// ── food reference database (per-100g nutrition lookup) ────
// Used by the "Add Food" form to populate the food search list
// and to look up per-100g values on the server before saving.
app.get("/api/food-database", (req, res) => {
    db.query("SELECT id, name, default_unit, reference_quantity, calories_per_reference, protein_per_reference, carbs_per_reference, fat_per_reference FROM food_database ORDER BY name ASC",
        (err, result) => {
        if (err) { console.error(err); return res.status(500).send("Error fetching food database"); }
        res.json(result);
    });
});

app.get("/foods", requireAuth, (req, res) => {
    const date = req.query.date || localDateStr();
    db.query("SELECT * FROM foods WHERE logged_date = ? AND user_id = ? ORDER BY id DESC", [date, req.session.userId], (err, result) => {
        if (err) { console.error(err); return res.status(500).send("Error fetching foods"); }
        res.json(result);
    });
});

// The client sends only { name, quantity }. The unit is never taken from
// the client — it always comes from that food's row in food_database, so
// a request can't claim "200 pieces of rice" or similar. This also means
// the same formula works for every measurement type:
//   nutrition = per_reference value x (quantity / reference_quantity)
// For Rice (grams, reference_quantity=100) that's the familiar /100 math.
// For Egg (piece, reference_quantity=1) it's just "x quantity" — the
// same formula, no special-casing needed.
app.post("/foods", requireAuth, (req, res) => {
    const { name, quantity } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).send("Food is required");
    }

    const qty = Number(quantity);
    if (quantity === undefined || quantity === "" || Number.isNaN(qty)) {
        return res.status(400).send("Quantity must be a number");
    }
    if (qty <= 0) {
        return res.status(400).send("Quantity must be greater than 0");
    }

    db.query("SELECT * FROM food_database WHERE name = ?", [name.trim()], (err, rows) => {
        if (err) { console.error(err); return res.status(500).send("Error looking up food"); }
        if (rows.length === 0) return res.status(404).send("Food not found");

        const item = rows[0];

        // Sensible upper bound depends on the unit: 50 pieces of egg is
        // already unrealistic, but 5000g/5000ml of something is not.
        const maxQty = item.default_unit === "piece" ? 50 : 5000;
        if (qty > maxQty) {
            return res.status(400).send(`Quantity is too large (max ${maxQty} ${item.default_unit})`);
        }

        const factor   = qty / item.reference_quantity;
        const calories = Math.round(item.calories_per_reference * factor);
        const protein  = Math.round(item.protein_per_reference  * factor);
        const carbs    = Math.round(item.carbs_per_reference    * factor);
        const fat      = Math.round(item.fat_per_reference      * factor * 10) / 10;
        const date     = localDateStr();

        db.query(
            "INSERT INTO foods (user_id, name, quantity_amount, quantity_unit, calories, protein, carbs, fat, logged_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [req.session.userId, item.name, qty, item.default_unit, calories, protein, carbs, fat, date],
            (err) => {
                if (err) { console.error(err); return res.status(500).send("Error adding food"); }
                res.send("Food added successfully");
            }
        );
    });
});

app.delete("/foods/:id", requireAuth, (req, res) => {
    db.query("DELETE FROM foods WHERE id = ? AND user_id = ?", [req.params.id, req.session.userId], (err, result) => {
        if (err) { console.error(err); return res.status(500).send("Error deleting food"); }
        if (result.affectedRows === 0) return res.status(404).send("Food not found");
        res.send("Food deleted successfully");
    });
});

app.put("/foods/:id", requireAuth, (req, res) => {
    const { name, calories, protein, carbs, fat } = req.body;
    db.query("UPDATE foods SET name=?, calories=?, protein=?, carbs=?, fat=? WHERE id=? AND user_id=?",
        [name, calories, protein, carbs, fat, req.params.id, req.session.userId], (err, result) => {
        if (err) { console.error(err); return res.status(500).send("Error updating food"); }
        if (result.affectedRows === 0) return res.status(404).send("Food not found");
        res.send("Food updated successfully");
    });
});

app.get("/history", requireAuth, (req, res) => {
    db.query(`SELECT DATE_FORMAT(logged_date, '%Y-%m-%d') AS logged_date, COUNT(*) AS item_count, SUM(calories) AS total_calories,
        SUM(protein) AS total_protein, SUM(carbs) AS total_carbs, SUM(fat) AS total_fat
        FROM foods WHERE user_id = ? GROUP BY logged_date ORDER BY logged_date DESC LIMIT 30`,
        [req.session.userId],
        (err, result) => {
        if (err) { console.error(err); return res.status(500).send("Error fetching history"); }
        res.json(result);
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));