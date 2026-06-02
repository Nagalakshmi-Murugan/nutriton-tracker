const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.post("/foods", (req, res) => {
    const { name, calories, protein, carbs, fat } = req.body;

    const sql = "INSERT INTO foods (name, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [name, calories, protein, carbs, fat], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error adding food");
        }
        res.send("Food added successfully");
    });
});
app.get("/foods", (req, res) => {
    const sql = "SELECT * FROM foods";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error fetching foods");
        }

        res.json(result);
    });
});
app.delete("/foods/:id", (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM foods WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error deleting food");
        }

        res.send("Food deleted successfully");
    });
});
app.put("/foods/:id", (req, res) => {
    const id = req.params.id;
    const { name, calories, protein, carbs, fat } = req.body;

    const sql = `
        UPDATE foods
        SET name = ?, calories = ?, protein = ?, carbs = ?, fat = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, calories, protein, carbs, fat, id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.send("Error updating food");
            }

            if (result.affectedRows === 0) {
                return res.send("Food not found");
            }

            res.send("Food updated successfully");
        }
    );
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});