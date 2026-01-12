import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';
import './Header.css';

const Header = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <header className="header">
            <div className="container header-content">
                <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                    <Zap className="logo-icon" size={24} />
                    <span className="logo-text">Mati Lampu</span>
                </Link>
                <nav className="nav">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>Map</Link>
                    <Link to="/report" className={`nav-link ${isActive('/report')}`}>Report Outage</Link>
                    <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>Leaderboard</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
