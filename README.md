# RealEst8 - Real Estate Listing Platform

A modern real estate listing platform for properties under $200k or available on vendor terms, featuring a flat-rate $1,000 commission structure and a vendor self-service portal.

## Features

- **Multi-listing Platform**: Browse affordable properties and deceased estates
- **Flat $1,000 Commission**: Simple, transparent pricing for every property sale
- **Vendor Portal**: Self-service backend for vendors to list and manage properties
- **Price Filtering**: Properties under $200k or available on vendor terms
- **Property Types**: Support for deceased estates and vendor-financed properties

## Tech Stack

### Backend
- **Django 5.0**: Web framework
- **Django REST Framework**: API development
- **PostgreSQL**: Database
- **django-cors-headers**: CORS support
- **Pillow**: Image handling

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **React Router**: Navigation
- **Axios**: HTTP client

## Quick Start

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/connektiv8/realest8.git
cd realest8
```

2. Start all services:
```bash
docker-compose up -d
```

3. Run database migrations:
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

4. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin

### Manual Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

5. Set up database:
```bash
# Make sure PostgreSQL is running
python manage.py migrate
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env if needed
```

4. Run development server:
```bash
npm run dev
```

## API Endpoints

### Properties
- `GET /api/listings/properties/` - List all available properties
- `GET /api/listings/properties/{id}/` - Get property details
- `POST /api/listings/properties/` - Create new property (vendors only)
- `PUT /api/listings/properties/{id}/` - Update property (vendor only)
- `DELETE /api/listings/properties/{id}/` - Delete property (vendor only)
- `GET /api/listings/properties/my_listings/` - Get vendor's own listings

### Accounts
- `POST /api/accounts/register/` - Register new user/vendor
- `GET /api/accounts/profile/` - Get current user profile
- `PUT /api/accounts/profile/` - Update user profile

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout

## Database Schema

### User Model
- Custom user model extending AbstractUser
- Fields: is_vendor, phone, company_name

### Property Model
- Fields: title, description, address, city, state, zip_code
- Pricing: price, is_vendor_terms, is_deceased_estate
- Details: bedrooms, bathrooms, square_feet
- Status: available, pending, sold

### PropertyImage Model
- Multiple images per property
- Primary image designation

### Commission Model
- Flat $1,000 per sale
- Automatic creation on property listing
- Payment tracking

## Business Rules

1. **Price Limit**: Properties must be under $200,000 OR available on vendor terms
2. **Commission**: Flat $1,000 rate for all sales (no negotiation)
3. **Self-Service**: Vendors can list properties without admin intervention
4. **Multi-listing**: Support for multiple properties per vendor

## Development

### Running Tests
```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm test
```

### Code Style
```bash
# Backend
cd backend
black .
flake8

# Frontend
cd frontend
npm run lint
```

## License

MIT License - see LICENSE file for details

## Support

For support, email support@realest8.com or create an issue on GitHub.