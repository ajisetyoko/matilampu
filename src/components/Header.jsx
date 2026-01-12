import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Github } from 'lucide-react';
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
                    <a
                        href="https://github.com/ajisetyoko/matilampu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Github size={18} />
                        GitHub
                    </a>
                </nav>
            </div>
        </header>
    );
};

export default Header;
