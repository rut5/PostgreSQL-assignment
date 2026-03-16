import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(express.json());

// Task 1: List All Players and Their Scores
app.get('/players-scores', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT Players.name, Games.title, Scores.score 
            FROM Players 
            JOIN Scores ON Players.id = Scores.player_id 
            JOIN Games ON Scores.game_id = Games.id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Task 2: High Scorers
app.get('/top-players', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT Players.name, SUM(Scores.score) AS total_score
            FROM Players 
            JOIN Scores ON Players.id = Scores.player_id
            GROUP BY Players.name
            ORDER BY total_score DESC
            LIMIT 3
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`http://localhost:3000/players-scores`);
    console.log(`http://localhost:3000/top-players`);
});