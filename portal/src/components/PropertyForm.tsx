import { useState } from 'react';
import { propertyService } from '../services/propertyService';
import './PropertyForm.css';

interface PropertyFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function PropertyForm({ onSuccess, onCancel }: PropertyFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    price: '',
    is_vendor_terms: false,
    is_deceased_estate: false,
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseFloat(formData.bathrooms),
        square_feet: parseInt(formData.square_feet),
      };

      // Validate price
      if (propertyData.price > 200000 && !propertyData.is_vendor_terms) {
        setError('Properties over $200,000 must be available on vendor terms.');
        setLoading(false);
        return;
      }

      await propertyService.createProperty(propertyData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="property-form-container">
      <h2>List New Property</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Zip Code *</label>
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Price * (USD)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
          <small>Properties over $200,000 must be on vendor terms</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Bedrooms *</label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Bathrooms *</label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              min="0"
              step="0.5"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Square Feet *</label>
            <input
              type="number"
              name="square_feet"
              value={formData.square_feet}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_vendor_terms"
              checked={formData.is_vendor_terms}
              onChange={handleChange}
            />
            Available on Vendor Terms
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_deceased_estate"
              checked={formData.is_deceased_estate}
              onChange={handleChange}
            />
            Deceased Estate
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PropertyForm;
