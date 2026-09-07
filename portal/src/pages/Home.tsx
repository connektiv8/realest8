import { useState, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import type { PropertyListItem } from '../types';
import PropertyCard from '../components/PropertyCard';
import './Home.css';

function Home() {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getProperties({
        max_price: maxPrice,
        search: searchTerm || undefined,
      });
      setProperties(data.results || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProperties();
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Properties to call home</h1>
          
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search suburb, postcode or state"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <button 
                type="button" 
                className="filters-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Filters
              </button>
              
              <button type="submit" className="search-button">
                Search
              </button>
            </form>

            {showFilters && (
              <div className="filters-panel">
                <label>
                  Max Price
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="filter-input"
                  />
                </label>
              </div>
            )}

            <div className="commission-banner">
              <span className="commission-text">💰 Flat $1,000 USD Commission on Every Sale</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="content-wrapper">
          <h2 className="section-title">Available Properties</h2>
          
          <div className="property-grid">
            {loading ? (
              <div className="loading-message">Loading properties...</div>
            ) : properties.length === 0 ? (
              <div className="no-results">No properties found.</div>
            ) : (
              properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
