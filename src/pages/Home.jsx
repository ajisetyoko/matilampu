import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import MapSection from '../components/MapSection';

const Home = () => {
    const [outages, setOutages] = useState([]);

    useEffect(() => {
        const fetchOutages = async () => {
            try {
                // Use env var for separate backend, or localhost for local dev
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${apiUrl}/api/outages`);
                const data = await response.json();
                if (data.data) {
                    // DB has lat, lng columns.
                    const formattedDetails = data.data.map(o => ({
                        ...o,
                        position: [o.lat, o.lng]
                    }));
                    setOutages(formattedDetails);
                }
            } catch (error) {
                console.error("Failed to fetch outages:", error);
            }
        };

        fetchOutages();
        // Poll every 60 seconds
        const interval = setInterval(fetchOutages, 60000);
        return () => clearInterval(interval);
    }, []);

    // Calculate dynamic stats from outages
    const activeCount = outages.length;
    // Mock: Approx 150-1200 users per outage
    const affectedCount = outages.reduce((acc, curr) => acc + (Math.floor(curr.id * 13 % 1000) + 150), 0);
    // Mock: Avg Restoration is hard to guess, but let's say 2.5h avg
    const avgRestoration = activeCount > 0 ? "2.5h" : "-";

    return (
        <>
            <Hero activeCount={activeCount} affectedCount={affectedCount} avgRestoration={avgRestoration} />
            <MapSection outages={outages} />
        </>
    );
};

export default Home;
