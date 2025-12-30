# RealEst8 Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Ports 5173, 8000, and 5432 available

## Production Deployment

### 1. Environment Configuration

**Backend (.env)**
```bash
SECRET_KEY=your-production-secret-key-here-min-50-chars
DEBUG=False
DATABASE_NAME=realest8_prod
DATABASE_USER=realest8_prod_user
DATABASE_PASSWORD=secure-password-here
DATABASE_HOST=db
DATABASE_PORT=5432
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

**Frontend (.env)**
```bash
VITE_API_URL=https://yourdomain.com/api
```

### 2. Security Checklist

- [ ] Generate strong SECRET_KEY (min 50 characters)
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS with your domain
- [ ] Set up HTTPS/SSL certificates
- [ ] Enable SECURE_SSL_REDIRECT=True
- [ ] Set SESSION_COOKIE_SECURE=True
- [ ] Set CSRF_COOKIE_SECURE=True
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure media file storage (S3, etc.)

### 3. Database Setup

```bash
# Create production database
docker-compose -f docker-compose.prod.yml up -d db

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### 4. Application Deployment

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Nginx Configuration (Optional)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://frontend:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /admin {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /media {
        proxy_pass http://backend:8000;
    }

    location /static {
        proxy_pass http://backend:8000;
    }
}
```

## Maintenance

### Backup Database
```bash
docker-compose exec db pg_dump -U realest8_user realest8_db > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker-compose exec -T db psql -U realest8_user realest8_db < backup_20240101.sql
```

### Update Application
```bash
git pull origin main
docker-compose down
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Monitor Resources
```bash
docker stats
```

## Scaling

For production scaling, consider:

1. **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
2. **Media Storage**: Use object storage (AWS S3, Google Cloud Storage)
3. **Caching**: Add Redis for session storage and caching
4. **Load Balancing**: Use multiple backend instances with Nginx/HAProxy
5. **CDN**: Serve static/media files through CloudFlare or AWS CloudFront

## Support

For deployment issues, consult:
- Django Deployment Checklist: https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/
- React Production Build: https://react.dev/learn/start-a-new-react-project#production-grade-react-frameworks
