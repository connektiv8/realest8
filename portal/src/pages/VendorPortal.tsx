import { useState, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import { authService } from '../services/authService';
import type { PropertyListItem, User } from '../types';
import PropertyForm from '../components/PropertyForm';
import './VendorPortal.css';

function VendorPortal() {
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string>('all');

  useEffect(() => {
    loadUserAndListings();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [selectedVendor, allProperties]);

  const loadUserAndListings = async () => {
    try {
      setLoading(true);
      const userProfile = await authService.getProfile();
      setUser(userProfile);
      
      // Global Admins see all properties, regular vendors see only theirs
      let data;
      if (userProfile.is_superuser || userProfile.is_staff) {
        data = await propertyService.getProperties({ max_price: 1000000 });
      } else {
        data = await propertyService.getMyListings();
      }
      setAllProperties(data);
      setProperties(data);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    if (selectedVendor === 'all') {
      setProperties(allProperties);
    } else {
      setProperties(allProperties.filter(p => p.vendor_name === selectedVendor));
    }
  };

  const handlePropertyCreated = () => {
    setShowForm(false);
    loadUserAndListings();
  };

  const uniqueVendors = Array.from(new Set(allProperties.map(p => p.vendor_name))).sort();
  const isGlobalAdmin = user?.is_superuser || user?.is_staff;

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
        
        {isGlobalAdmin && uniqueVendors.length > 0 && (
          <div className="vendor-filter">
            <label htmlFor="vendor-select">Filter by Vendor:</label>
            <select 
              id="vendor-select"
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
            >
              <option value="all">All Vendors</option>
              {uniqueVendors.map(vendor => (
                <option key={vendor} value={vendor}>{vendor}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {showForm && (
        <PropertyForm 
          onSuccess={handlePropertyCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="commission-notice">
        <h3>Commission Structure</h3>
        <p>Flat rate of <strong>$1,000 USD</strong> per property sale</p>
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
                {isGlobalAdmin && (
                  <p className="vendor-info">Listed by: {property.vendor_name}</p>
                )}
                <p>{property.address}, {property.city}, {property.state} ({property.country})</p>
                <p className="price">${Math.round(property.price).toLocaleString()} USD</p>
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
