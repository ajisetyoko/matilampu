import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import '../components/Hero.css'; // Reusing some hero styles for buttons/titles

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
                    // Ideally fetch city name from reverse geocoding here, but for now just raw coords
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.lat || !formData.lng) {
            setMessage("Please include your location.");
            return;
        }

        setLoading(true);
        try {
            const apiUrl = import.meta.env.PROD ? '' : 'http://localhost:3001';
            const response = await fetch(`${apiUrl}/api/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.isNew ? "Report Submitted!" : "Report Renewed (Heartbeat)!");
                setFormData({ city: '', area: '', cause: '', lat: '', lng: '' });
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

                <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                        {loading && !formData.lat ? "Locating..." : <><Navigation size={20} /> Use My GPS Location</>}
                    </button>

                    {formData.lat && (
                        <div style={{ fontSize: '0.9rem', color: '#00ff7f', textAlign: 'center' }}>
                            Coordinates: {parseFloat(formData.lat).toFixed(4)}, {parseFloat(formData.lng).toFixed(4)}
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
