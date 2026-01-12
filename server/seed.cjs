const db = require('./database.cjs');

const mockOutages = [
    {
        lat: -6.2088, lng: 106.8456,
        city: "Jakarta Pusat",
        area: "Menteng, Cikini",
        cause: "Substation Maintenance"
    },
    {
        lat: -6.9175, lng: 107.6191,
        city: "Bandung",
        area: "Dago, Coblong",
        cause: "Tree interference"
    },
    {
        lat: -7.2575, lng: 112.7521,
        city: "Surabaya",
        area: "Gubeng",
        cause: "Cable Fault",
        status: "Resolved"
    },
    {
        lat: -8.3405, lng: 115.0920,
        city: "Bali",
        area: "Tabanan",
        cause: "Heavy Rain"
    },
    {
        lat: -3.3194, lng: 114.5908,
        city: "Banjarmasin",
        area: "Banjarmasin Tengah",
        cause: "Grid Stabilization"
    }
];

const seed = async () => {
    console.log("Seeding database (PostgreSQL)...");

    const now = new Date().toISOString();
    const older = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    for (let i = 0; i < mockOutages.length; i++) {
        const o = mockOutages[i];
        const status = o.status || 'Active';
        const createdAt = i % 2 === 0 ? older : now;

        const query = 'INSERT INTO outages (lat, lng, city, area, cause, created_at, last_updated, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
        const values = [o.lat, o.lng, o.city, o.area, o.cause, createdAt, now, status];

        try {
            await db.query(query, values);
        } catch (err) {
            console.error("Error inserting seed data:", err);
        }
    }
    console.log("Seeding complete.");
    process.exit(0);
};

// Wait a bit for connection
setTimeout(seed, 1000);
