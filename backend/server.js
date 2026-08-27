const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

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

app.get("/foods", (req, res) => {
    const date = req.query.date || localDateStr();
    db.query("SELECT * FROM foods WHERE logged_date = ? ORDER BY id DESC", [date], (err, result) => {
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
app.post("/foods", (req, res) => {
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
            "INSERT INTO foods (name, quantity_amount, quantity_unit, calories, protein, carbs, fat, logged_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [item.name, qty, item.default_unit, calories, protein, carbs, fat, date],
            (err) => {
                if (err) { console.error(err); return res.status(500).send("Error adding food"); }
                res.send("Food added successfully");
            }
        );
    });
});

app.delete("/foods/:id", (req, res) => {
    db.query("DELETE FROM foods WHERE id = ?", [req.params.id], (err) => {
        if (err) { console.error(err); return res.status(500).send("Error deleting food"); }
        res.send("Food deleted successfully");
    });
});

app.put("/foods/:id", (req, res) => {
    const { name, calories, protein, carbs, fat } = req.body;
    db.query("UPDATE foods SET name=?, calories=?, protein=?, carbs=?, fat=? WHERE id=?",
        [name, calories, protein, carbs, fat, req.params.id], (err, result) => {
        if (err) { console.error(err); return res.status(500).send("Error updating food"); }
        if (result.affectedRows === 0) return res.status(404).send("Food not found");
        res.send("Food updated successfully");
    });
});

app.get("/history", (req, res) => {
    db.query(`SELECT DATE_FORMAT(logged_date, '%Y-%m-%d') AS logged_date, COUNT(*) AS item_count, SUM(calories) AS total_calories,
        SUM(protein) AS total_protein, SUM(carbs) AS total_carbs, SUM(fat) AS total_fat
        FROM foods GROUP BY logged_date ORDER BY logged_date DESC LIMIT 30`,
        (err, result) => {
        if (err) { console.error(err); return res.status(500).send("Error fetching history"); }
        res.json(result);
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));