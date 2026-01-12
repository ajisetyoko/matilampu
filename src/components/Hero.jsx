import React from 'react';
import './Hero.css';

const Hero = ({ activeCount = 0 }) => {
    return (
        <section className="hero">
            <div className="container hero-content">
                <h1 className="hero-title">
                    Live <span className="highlight">Blackout</span> Tracker
                </h1>
                <p className="hero-subtitle">
                    Monitor power outages across Indonesia in real-time.
                    Stay prepared and stay safe.
                </p>
                <div className="hero-stats">
                    <div className="stat-item">
                        <span className="stat-value">{activeCount}</span>
                        <span className="stat-label">Active Outages</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">4.5k</span>
                        <span className="stat-label">Affected Users</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">2h</span>
                        <span className="stat-label">Avg. Restoration</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
