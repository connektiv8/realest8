import api from './api';
import type { Property, PropertyListItem } from '../types';

export const propertyService = {
  // Get all properties (public view)
  getProperties: async (params?: {
    search?: string;
    max_price?: number;
    min_price?: number;
    is_vendor_terms?: boolean;
    is_deceased_estate?: boolean;
    city?: string;
    state?: string;
  }) => {
    const response = await api.get<{ results: PropertyListItem[] }>('/listings/properties/', { params });
    return response.data;
  },

  // Get single property details
  getProperty: async (id: number) => {
    const response = await api.get<Property>(`/listings/properties/${id}/`);
    return response.data;
  },

  // Get vendor's own listings
  getMyListings: async () => {
    const response = await api.get<PropertyListItem[]>('/listings/properties/my_listings/');
    return response.data;
  },

  // Create new property (vendor only)
  createProperty: async (propertyData: Partial<Property>) => {
    const response = await api.post<Property>('/listings/properties/', propertyData);
    return response.data;
  },

  // Update property (vendor only)
  updateProperty: async (id: number, propertyData: Partial<Property>) => {
    const response = await api.put<Property>(`/listings/properties/${id}/`, propertyData);
    return response.data;
  },

  // Delete property (vendor only)
  deleteProperty: async (id: number) => {
    await api.delete(`/listings/properties/${id}/`);
  },
};
