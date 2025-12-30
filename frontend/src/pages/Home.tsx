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
      <header className="hero">
        <h1>RealEst8</h1>
        <p className="tagline">Affordable Properties & Vendor Terms</p>
        <p className="commission-info">Flat $1,000 Commission on Every Sale</p>
      </header>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="price-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
      </div>

      <div className="property-grid">
        {loading ? (
          <p>Loading properties...</p>
        ) : properties.length === 0 ? (
          <p>No properties found.</p>
        ) : (
          properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
