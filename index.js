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

// Task 1: List all players and their scores
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

// Task 2: High scorers
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

// Task 3: Players who didn’t play any games
app.get('/inactive-players', async (req, res) => {
    try {
        const query = `
            SELECT p.name 
            FROM Players p
            LEFT JOIN Scores s ON p.id = s.player_id
            WHERE s.player_id IS NULL;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error in Task 3:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Task 4: Popular game genres
app.get('/popular-genres', async (req, res) => {
    try {
        const query = `
            SELECT g.genre, COUNT(s.id) AS play_count
            FROM Games g
            JOIN Scores s ON g.id = s.game_id
            GROUP BY g.genre
            ORDER BY play_count DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error in Task 4:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Task 5: Recently joined players
app.get('/recent-players', async (req, res) => {
    try {
        const query = `
            SELECT name, join_date 
            FROM Players 
            WHERE join_date > NOW() - INTERVAL '30 days'
            ORDER BY join_date DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Error in Task 5:", err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`http://localhost:3000/players-scores`);
    console.log(`http://localhost:3000/top-players`);
    console.log(`http://localhost:3000/inactive-players`);
    console.log(`http://localhost:3000/popular-genres`);
    console.log(`http://localhost:3000/recent-players`);
});