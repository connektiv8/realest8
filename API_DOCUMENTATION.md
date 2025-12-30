# RealEst8 API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

The API uses session-based authentication via Django REST Framework.

### Login
```
POST /auth/login/
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

### Logout
```
POST /auth/logout/
```

## Accounts

### Register New User/Vendor
```
POST /accounts/register/
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "first_name": "string",
  "last_name": "string",
  "is_vendor": boolean,
  "phone": "string" (optional),
  "company_name": "string" (optional)
}
```

**Response:** 201 Created
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_vendor": true,
  "phone": "555-1234",
  "company_name": "John's Properties"
}
```

### Get Current User Profile
```
GET /accounts/profile/
Authorization: Session
```

**Response:** 200 OK
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_vendor": true,
  "phone": "555-1234",
  "company_name": "John's Properties"
}
```

### Update User Profile
```
PUT /accounts/profile/
Authorization: Session
Content-Type: application/json

{
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "company_name": "string"
}
```

## Properties

### List All Properties
```
GET /listings/properties/
```

**Query Parameters:**
- `search` (string): Search in title, description, address, city
- `max_price` (number): Filter by maximum price
- `min_price` (number): Filter by minimum price
- `is_vendor_terms` (boolean): Filter by vendor terms availability
- `is_deceased_estate` (boolean): Filter deceased estates
- `city` (string): Filter by city
- `state` (string): Filter by state
- `status` (string): Filter by status (available, pending, sold)
- `ordering` (string): Sort by field (price, -price, created_at, -created_at)
- `page` (number): Page number for pagination
- `page_size` (number): Results per page (default: 20, max: 100)

**Response:** 200 OK
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/listings/properties/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "vendor_name": "John Doe",
      "title": "Cozy 2BR Home",
      "address": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "price": 150000.00,
      "is_vendor_terms": false,
      "is_deceased_estate": false,
      "bedrooms": 2,
      "bathrooms": 1.0,
      "square_feet": 1200,
      "status": "available",
      "primary_image": "http://localhost:8000/media/properties/image.jpg"
    }
  ]
}
```

### Get Property Details
```
GET /listings/properties/{id}/
```

**Response:** 200 OK
```json
{
  "id": 1,
  "vendor": 1,
  "vendor_name": "John Doe",
  "title": "Cozy 2BR Home",
  "description": "Beautiful home in great condition...",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zip_code": "62701",
  "price": 150000.00,
  "is_vendor_terms": false,
  "is_deceased_estate": false,
  "bedrooms": 2,
  "bathrooms": 1.0,
  "square_feet": 1200,
  "status": "available",
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "is_eligible": true,
  "images": [
    {
      "id": 1,
      "image": "http://localhost:8000/media/properties/image.jpg",
      "caption": "Front view",
      "is_primary": true,
      "uploaded_at": "2024-01-01T12:00:00Z"
    }
  ],
  "commission": {
    "id": 1,
    "amount": 1000.00,
    "paid": false,
    "paid_date": null,
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

### Create Property (Vendor Only)
```
POST /listings/properties/
Authorization: Session
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zip_code": "string",
  "price": number,
  "is_vendor_terms": boolean,
  "is_deceased_estate": boolean,
  "bedrooms": number,
  "bathrooms": number,
  "square_feet": number
}
```

**Validation Rules:**
- Price must be ≤ $200,000 OR `is_vendor_terms` must be true
- User must be authenticated and have `is_vendor = true`
- A commission record is automatically created with $1,000 flat rate

**Response:** 201 Created

### Update Property (Vendor Only)
```
PUT /listings/properties/{id}/
Authorization: Session
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "price": number,
  // ... other fields
}
```

**Permissions:**
- Only the property owner (vendor) can update

**Response:** 200 OK

### Delete Property (Vendor Only)
```
DELETE /listings/properties/{id}/
Authorization: Session
```

**Permissions:**
- Only the property owner (vendor) can delete

**Response:** 204 No Content

### Get My Listings (Vendor Only)
```
GET /listings/properties/my_listings/
Authorization: Session
```

**Permissions:**
- User must be authenticated and have `is_vendor = true`

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "vendor_name": "John Doe",
    "title": "Cozy 2BR Home",
    // ... other property fields
  }
]
```

## Property Images

### Upload Property Image
```
POST /listings/images/
Authorization: Session
Content-Type: multipart/form-data

{
  "property": number,
  "image": file,
  "caption": "string" (optional),
  "is_primary": boolean (optional)
}
```

**Response:** 201 Created

## Commission Structure

All properties listed on RealEst8 have a **flat-rate commission of $1,000** per sale.

- Commission records are automatically created when a property is listed
- The commission amount is always $1,000 (cannot be modified)
- Vendors pay this commission when the property is sold
- No negotiation or variable commission rates

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Properties over $200,000 must be available on vendor terms."
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "Only vendors can access this endpoint."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

## Rate Limiting

Currently no rate limiting is enforced in development. In production, consider implementing rate limiting to prevent abuse.

## CORS

The API allows CORS requests from:
- `http://localhost:3000`
- `http://localhost:5173`

Additional origins can be configured in the backend settings.
