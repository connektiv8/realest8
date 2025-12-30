import { useState, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import { PropertyListItem } from '../types';
import PropertyForm from '../components/PropertyForm';
import './VendorPortal.css';

function VendorPortal() {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getMyListings();
      setProperties(data);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyCreated = () => {
    setShowForm(false);
    loadMyListings();
  };

  return (
    <div className="vendor-portal">
      <header className="portal-header">
        <h1>Vendor Portal</h1>
        <p>Manage your property listings</p>
      </header>

      <div className="portal-actions">
        <button 
          className="add-property-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Property'}
        </button>
      </div>

      {showForm && (
        <PropertyForm 
          onSuccess={handlePropertyCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="commission-notice">
        <h3>Commission Structure</h3>
        <p>Flat rate of <strong>$1,000</strong> per property sale</p>
      </div>

      <div className="my-listings">
        <h2>My Listings ({properties.length})</h2>
        {loading ? (
          <p>Loading your listings...</p>
        ) : properties.length === 0 ? (
          <p>You haven't listed any properties yet.</p>
        ) : (
          <div className="listings-grid">
            {properties.map((property) => (
              <div key={property.id} className="listing-card">
                <h3>{property.title}</h3>
                <p>{property.address}, {property.city}, {property.state}</p>
                <p className="price">${property.price.toLocaleString()}</p>
                <div className="listing-details">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.square_feet} sq ft</span>
                </div>
                <div className="listing-badges">
                  {property.is_vendor_terms && <span className="badge">Vendor Terms</span>}
                  {property.is_deceased_estate && <span className="badge">Deceased Estate</span>}
                </div>
                <div className="status">Status: {property.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorPortal;
