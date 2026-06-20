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