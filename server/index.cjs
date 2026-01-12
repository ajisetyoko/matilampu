require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for Vercel frontend
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Routes... (keep existing API routes)

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// Helper: Calculate distance between two coords (Haversine approximation)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat1)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

// GET /api/outages
app.get('/api/outages', async (req, res) => {
    try {
        // Postgres: interval syntax is different, but let's do simple JS time calc
        const timeThreshold = new Date(Date.now() - 30 * 60 * 1000).toISOString();

        // Postgres uses $1, $2.. placeholders
        const sql = "SELECT * FROM outages WHERE status = 'Active' AND last_updated > $1";

        const { rows } = await db.query(sql, [timeThreshold]);
        res.json({
            message: "success",
            data: rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// GET /api/leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const timeThreshold = new Date(Date.now() - 30 * 60 * 1000).toISOString();

        // Postgres: EXTRACT(EPOCH FROM ...) gets seconds
        const sql = `SELECT *, 
                (EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM created_at)) as duration_seconds 
                FROM outages 
                WHERE status = 'Active' AND last_updated > $1 
                ORDER BY duration_seconds DESC 
                LIMIT 10`;

        const { rows } = await db.query(sql, [timeThreshold]);
        res.json({
            message: "success",
            data: rows
        });
    } catch (err) {
        res.status(400).json({ "error": err.message });
    }
});

// POST /api/report
app.post('/api/report', async (req, res) => {
    const { lat, lng, city, area, cause } = req.body;

    if (!lat || !lng) {
        res.status(400).json({ error: "Latitude and Longitude required" });
        return;
    }

    try {
        const timeThreshold = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const checkSql = "SELECT * FROM outages WHERE status = 'Active' AND last_updated > $1";
        // Get all active to check distance
        const { rows } = await db.query(checkSql, [timeThreshold]);

        let foundOutage = null;
        for (const row of rows) {
            const dist = getDistanceFromLatLonInKm(lat, lng, row.lat, row.lng);
            if (dist < 2.0) { // Within 2km
                foundOutage = row;
                break;
            }
        }

        const now = new Date().toISOString();

        if (foundOutage) {
            // Heartbeat
            const updateSql = "UPDATE outages SET last_updated = $1 WHERE id = $2 RETURNING id";
            const result = await db.query(updateSql, [now, foundOutage.id]);
            res.json({ message: "Outage report renewed", id: foundOutage.id, isNew: false });
        } else {
            // New Report
            const insertSql = "INSERT INTO outages (lat, lng, city, area, cause, created_at, last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id";
            const result = await db.query(insertSql, [lat, lng, city, area, cause || "Unknown", now, now]);
            res.json({ message: "New outage reported", id: result.rows[0].id, isNew: true });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/init - Force DB initialization (useful for Vercel if race condition occurred)
app.get('/api/init', async (req, res) => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS outages (
                id SERIAL PRIMARY KEY,
                lat REAL,
                lng REAL,
                city TEXT,
                area TEXT,
                cause TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'Active'
            );
        `);
        res.json({ message: "Database initialized (Table 'outages' created/verified)." });
    } catch (err) {
        res.status(500).json({ error: "Failed to initialize DB: " + err.message });
    }
});

// Catch-all
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../dist/index.html'));
// });

// For local development and Docker
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}
module.exports = app;
