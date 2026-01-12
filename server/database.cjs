require('dotenv').config();
const { Pool } = require('pg');

// Use DATABASE_URL from environment (Vercel standard)
const connectionString = process.env.DATABASE_URL;

// SSL is usually required for cloud DBs (Neon/Turso/Heroku)
const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper to init DB (Create table if not exists)
const initDB = async () => {
    try {
        await pool.query(`
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
        console.log("PostgreSQL: Table 'outages' ensures.");
    } catch (err) {
        console.error("Error creating table:", err);
    }
};

// Initialize on require (or call explicitly in index)
if (connectionString) {
    initDB();
} else {
    console.warn("No DATABASE_URL found. Database features will fail.");
}

module.exports = {
    query: (text, params) => pool.query(text, params),
};
