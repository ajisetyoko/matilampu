import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './SearchControl.css';

const SearchControl = ({ onLocationSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            // Using OpenStreetMap Nominatim API (Free)
            // Limited to Indonesia (countrycodes=id) to keep results relevant
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id`
            );
            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error("Error fetching location:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelect = (result) => {
        const { lat, lon, display_name } = result;
        onLocationSelect({ lat: parseFloat(lat), lng: parseFloat(lon), name: display_name });
        setResults([]); // Clear results after selection
        setQuery(display_name.split(',')[0]); // Update input with valid name
    };

    return (
        <div className="search-control">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search city, district, or area..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-btn" disabled={isSearching}>
                    <Search size={20} />
                </button>
            </form>

            {results.length > 0 && (
                <ul className="search-results">
                    {results.slice(0, 5).map((result) => (
                        <li key={result.place_id} onClick={() => handleSelect(result)}>
                            {result.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchControl;
