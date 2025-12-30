export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_vendor: boolean;
  phone?: string;
  company_name?: string;
}

export interface Property {
  id: number;
  vendor: number;
  vendor_name: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  price: number;
  is_vendor_terms: boolean;
  is_deceased_estate: boolean;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  status: 'available' | 'pending' | 'sold';
  created_at: string;
  updated_at: string;
  images?: PropertyImage[];
  commission?: Commission;
  is_eligible: boolean;
}

export interface PropertyImage {
  id: number;
  image: string;
  caption?: string;
  is_primary: boolean;
  uploaded_at: string;
}

export interface Commission {
  id: number;
  amount: number;
  paid: boolean;
  paid_date?: string;
  created_at: string;
}

export interface PropertyListItem {
  id: number;
  vendor_name: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  is_vendor_terms: boolean;
  is_deceased_estate: boolean;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  status: string;
  primary_image?: string;
}
