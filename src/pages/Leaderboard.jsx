import React, { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';

const Leaderboard = () => {
    const [outages, setOutages] = useState([]);

    useEffect(() => {
        fetch(`/api/leaderboard`)
            .then(res => res.json())
            .then(data => {
                if (data.data) setOutages(data.data);
            })
            .catch(err => console.error(err));
    }, []);

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h2 className="section-title">Longest Active Outages</h2>
            <div className="map-wrapper" style={{ height: 'auto', padding: '0', background: 'transparent', boxShadow: 'none', border: 'none' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {outages.map((outage, index) => (
                        <div key={outage.id} style={{
                            background: 'var(--surface-color)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{
                                    fontSize: '2rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.1)',
                                    width: '40px'
                                }}>#{index + 1}</span>
                                <div>
                                    <h3 style={{ color: 'var(--primary-color)', margin: 0 }}>{outage.city}</h3>
                                    <p style={{ color: 'var(--text-color)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={14} /> {outage.area}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    color: 'var(--text-bright)', fontWeight: 'bold', fontSize: '1.2rem'
                                }}>
                                    <Clock size={20} />
                                    {formatDuration(outage.duration_seconds)}
                                </div>
                                <span className={`status-badge active`} style={{ marginTop: '0.5rem' }}>Active</span>
                            </div>
                        </div>
                    ))}
                    {outages.length === 0 && <p style={{ textAlign: 'center' }}>No active outages reported.</p>}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
