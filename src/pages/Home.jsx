import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import MapSection from '../components/MapSection';

const Home = () => {
    const [outages, setOutages] = useState([]);

    useEffect(() => {
        const fetchOutages = async () => {
            try {
                const apiUrl = import.meta.env.PROD ? '' : 'http://localhost:3001';
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

    return (
        <>
            <Hero activeCount={outages.length} />
            <MapSection outages={outages} />
        </>
    );
};

export default Home;
