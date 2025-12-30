#!/bin/bash

# RealEst8 Setup Script

echo "Setting up RealEst8 Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Starting services with Docker Compose..."
docker-compose up -d

echo "Waiting for database to be ready..."
sleep 10

echo "Running database migrations..."
docker-compose exec -T backend python manage.py migrate

echo "Creating media directory..."
docker-compose exec -T backend mkdir -p media/properties

echo ""
echo "Setup complete! 🎉"
echo ""
echo "Access the application:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API: http://localhost:8000/api"
echo "  - Admin Panel: http://localhost:8000/admin"
echo ""
echo "To create a superuser, run:"
echo "  docker-compose exec backend python manage.py createsuperuser"
echo ""
