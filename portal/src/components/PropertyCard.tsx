import type { PropertyListItem } from '../types';
import './PropertyCard.css';

interface PropertyCardProps {
  property: PropertyListItem;
}

function PropertyCard({ property }: PropertyCardProps) {
  return (
    <div className="property-card">
      {property.primary_image && (
        <img 
          src={property.primary_image} 
          alt={property.title}
          className="property-image"
        />
      )}
      <div className="property-content">
        <h3>{property.title}</h3>
        <p className="location">{property.city}, {property.state} ({property.country})</p>
        <p className="price">${Math.round(property.price).toLocaleString()} USD</p>
        
        <div className="property-details">
          <span>{property.bedrooms} bed</span>
          <span>{property.bathrooms} bath</span>
          <span>{property.square_feet} sq ft</span>
        </div>
        
        <div className="property-badges">
          {property.is_vendor_terms && (
            <span className="badge vendor-terms">Vendor Terms Available</span>
          )}
          {property.is_deceased_estate && (
            <span className="badge deceased">Deceased Estate</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;
