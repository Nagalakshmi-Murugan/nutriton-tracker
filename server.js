const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.get("/foods", (req, res) => {
    const date = req.query.date || new Date().toISOString().split("T")[0];
    db.query("SELECT * FROM foods WHERE logged_date = ? ORDER BY id DESC", [date], (err, result) => {
        if (err) { console.error(err); return res.status(500).send("Error fetching foods"); }
        res.json(result);
    });
});

app.post("/foods", (req, res) => {
    const { name, calories, protein, carbs, fat } = req.body;
    const date = new Date().toISOString().split("T")[0];
    db.query("INSERT INTO foods (name, calories, protein, carbs, fat, logged_date) VALUES (?, ?, ?, ?, ?, ?)",
        [name, calories, protein, carbs, fat, date], (err) => {
        if (err) { console.error(err); return res.status(500).send("Error adding food"); }
        res.send("Food added successfully");
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
    db.query(`SELECT logged_date, COUNT(*) AS item_count, SUM(calories) AS total_calories,
        SUM(protein) AS total_protein, SUM(carbs) AS total_carbs, SUM(fat) AS total_fat
        FROM foods GROUP BY logged_date ORDER BY logged_date DESC LIMIT 30`,
        (err, result) => {
        if (err) { console.error(err); return res.status(500).send("Error fetching history"); }
        res.json(result);
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));