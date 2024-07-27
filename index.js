import express from "express";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import healthController from "./controllers/health.js";
import pool from "./controllers/connection.js";
import db from "./controllers/init.js";
import createUserTable from "./controllers/users.js";

const app = express();
const PORT = 3000;
1;

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", healthController.getHealth);
app.post("/health", healthController.postHealth);

// Database connection and create table
db().then(() => {
  createUserTable();
});

// Route to register a new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING username",
      [username, hashedPassword]
    );
    res.status(201).json({ username: result.rows[0].username });
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Username already exists" });
    } else {
      res.status(500).json({ error: "Database error" });
    }
  }
});

// Route to shorten a URL
app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;
  const shortUrl = nanoid(10);

  try {
    const result = await pool.query(
      "INSERT INTO urls (short_url, original_url) VALUES ($1, $2) RETURNING short_url",
      [shortUrl, originalUrl]
    );
    res.status(201).json({ shortUrl: result.rows[0].short_url });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// Route to redirect to the original URL
app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const result = await pool.query(
      "SELECT original_url FROM urls WHERE short_url = $1",
      [shortUrl]
    );

    if (result.rows.length > 0) {
      res.redirect(result.rows[0].original_url);
    } else {
      res.status(404).json({ error: "URL not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
