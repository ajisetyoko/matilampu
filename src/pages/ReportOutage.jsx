import React, { useState } from 'react';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';
import SearchControl from '../components/SearchControl';
import '../components/Hero.css';

const ReportOutage = () => {
    const [formData, setFormData] = useState({
        city: '',
        area: '',
        cause: '',
        lat: '',
        lng: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [locationSource, setLocationSource] = useState(null); // 'gps' or 'manual'

    const handleLocate = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }));
                    setLocationSource('gps');
                    setLoading(false);
                },
                (error) => {
                    console.error(error);
                    setMessage('Error getting location. Please allow location access.');
                    setLoading(false);
                }
            );
        } else {
            setMessage('Geolocation is not supported by this browser.');
        }
    };

    const handleSearchSelect = (location) => {
        setFormData(prev => ({
            ...prev,
            lat: location.lat,
            lng: location.lng,
            // Simple heuristic to split name, user can edit
            city: location.name.split(',')[0],
            area: location.name.split(',').slice(1, 3).join(',').trim()
        }));
        setLocationSource('manual');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.lat || !formData.lng) {
            setMessage("Please set your location (GPS or Search).");
            return;
        }

        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.isNew ? "Report Submitted!" : "Report Renewed (Heartbeat)!");
                setFormData({ city: '', area: '', cause: '', lat: '', lng: '' });
                setLocationSource(null);
            } else {
                setMessage("Error: " + data.error);
            }
        } catch (err) {
            setMessage("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h2 className="section-title">Report Outage</h2>
            <div className="map-wrapper" style={{ height: 'auto', padding: '2rem', flexDirection: 'column' }}>
                <p style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    Help others by reporting a blackout in your area.
                    Reports will be shown on the map for 30 minutes.
                </p>

                <div style={{ width: '100%', maxWidth: '500px', marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa' }}>Option 1: Search Location</label>
                    <SearchControl onLocationSelect={handleSearchSelect} className="embedded" />
                </div>

                <div style={{ width: '100%', maxWidth: '500px', display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                    <span style={{ color: '#666' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
                </div>

                <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '-0.5rem', color: '#aaa' }}>Option 2: Use GPS</label>
                    <button
                        type="button"
                        onClick={handleLocate}
                        className="btn-primary"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '0.5rem', background: 'var(--primary-color)', color: '#000',
                            border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold'
                        }}
                    >
                        {loading && !formData.lat ? "Locating..." : <><Navigation size={20} /> Use My Current Location</>}
                    </button>

                    {formData.lat && (
                        <div style={{
                            padding: '1rem', borderRadius: '8px',
                            background: locationSource === 'gps' ? 'rgba(0, 255, 127, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                            border: `1px solid ${locationSource === 'gps' ? '#00ff7f' : 'orange'}`,
                            textAlign: 'center'
                        }}>
                            <div style={{ color: locationSource === 'gps' ? '#00ff7f' : 'orange', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                {locationSource === 'gps' ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><MapPin size={16} /> GPS Location Locked</span> :
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}><AlertTriangle size={16} /> Manual Location Selected</span>}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#ccc' }}>
                                {parseFloat(formData.lat).toFixed(4)}, {parseFloat(formData.lng).toFixed(4)}
                            </div>
                            {locationSource === 'manual' && (
                                <div style={{ fontSize: '0.8rem', color: 'orange', marginTop: '0.5rem' }}>
                                    Note: Manual reports may be less accurate than GPS.
                                </div>
                            )}
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder="City (e.g., Jakarta Selatan)"
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        required
                        style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#0d1117', color: '#fff' }}
                    />
                    <input
                        type="text"
                        placeholder="Area/Street Name"
                        value={formData.area}
                        onChange={e => setFormData({ ...formData, area: e.target.value })}
                        style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#0d1117', color: '#fff' }}
                    />
                    <select
                        value={formData.cause}
                        onChange={e => setFormData({ ...formData, cause: e.target.value })}
                        style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#0d1117', color: '#fff' }}
                    >
                        <option value="">Select Cause (Optional)</option>
                        <option value="Heavy Rain">Heavy Rain/Storm</option>
                        <option value="Flood">Flood</option>
                        <option value="Tree Interference">Tree Interference</option>
                        <option value="Explosion">Transformer Explosion</option>
                        <option value="Unknown">I don't know</option>
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: 'var(--danger-color)', color: '#fff',
                            border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem'
                        }}
                    >
                        {loading ? "Submitting..." : "Submit Report"}
                    </button>

                    {message && <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--primary-color)' }}>{message}</p>}
                </form>
            </div>
        </div>
    );
};

export default ReportOutage;
