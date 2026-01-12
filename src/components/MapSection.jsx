import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import SearchControl from './SearchControl';
import './MapSection.css';

// Fix for default marker icon in Leaflet + Vite/Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Component to handle map movement
const FlyToLocation = ({ destination }) => {
    const map = useMap();
    useEffect(() => {
        if (destination) {
            map.flyTo([destination.lat, destination.lng], 13, {
                duration: 2 // smooth animation duration in seconds
            });
        }
    }, [destination, map]);
    return null;
};

const MapSection = ({ outages = [] }) => {
    // Indonesia Center Coordinates
    const center = [-2.5489, 118.0149];
    const zoom = 5;
    const [flyToDest, setFlyToDest] = useState(null);

    const handleLocationSelect = (location) => {
        setFlyToDest(location);
    };

    return (
        <section className="map-section container">
            <h2 className="section-title">Current Outages Map</h2>
            <div className="map-wrapper" style={{ position: 'relative' }}>
                <SearchControl onLocationSelect={handleLocationSelect} />
                <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <FlyToLocation destination={flyToDest} />
                    {outages.map((outage) => (
                        <Marker key={outage.id} position={outage.position}>
                            <Popup>
                                <div className="popup-content">
                                    <h3>{outage.city}</h3>
                                    <p className="area">{outage.area}</p>
                                    <div className={`status-badge ${outage.status.toLowerCase()}`}>
                                        {outage.status}
                                    </div>
                                    <div className="details">
                                        {/* Removed Affected info as requested */}
                                        <p><strong>Restoration:</strong> {outage.cause === "Grid Stabilization" ? "Unknown" : "Est. 2 hrs"}</p>
                                        <p><strong>Cause:</strong> {outage.cause}</p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </section>
    );
};

export default MapSection;
