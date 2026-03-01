# 🐳 Docker Deployment Guide

## Quick Start

### Option 1: Full Stack (Recommended)

Deploy everything (Frontend + Backend + Database):

```bash
cd /home/sysop/.openclaw/workspace
./deploy-docker.sh
# Choose option 1
```

This will:
- Start PostgreSQL database
- Start FastAPI backend (port 8001)
- Start Next.js frontend (port 3000)
- Connect everything automatically

### Option 2: Frontend Only

If backend is already running:

```bash
cd /home/sysop/.openclaw/workspace
./deploy-docker.sh
# Choose option 2
```

### Option 3: Manual Commands

**Full stack:**
```bash
cd /home/sysop/.openclaw/workspace
docker-compose -f docker-compose-full.yml up -d
```

**Frontend only:**
```bash
cd /home/sysop/.openclaw/workspace
docker-compose -f docker-compose-frontend.yml up -d
```

---

## Access URLs

After deployment:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs
- **Database:** localhost:5432

---

## Docker Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose-full.yml logs -f

# Specific service
docker-compose -f docker-compose-full.yml logs -f frontend
docker-compose -f docker-compose-full.yml logs -f backend
docker-compose -f docker-compose-full.yml logs -f postgres
```

### Stop Services
```bash
# Stop all
docker-compose -f docker-compose-full.yml down

# Stop and remove volumes
docker-compose -f docker-compose-full.yml down -v
```

### Restart Services
```bash
docker-compose -f docker-compose-full.yml restart
```

### Rebuild Services
```bash
# Rebuild specific service
docker-compose -f docker-compose-full.yml build frontend
docker-compose -f docker-compose-full.yml up -d frontend

# Rebuild all
docker-compose -f docker-compose-full.yml build --no-cache
docker-compose -f docker-compose-full.yml up -d
```

### Enter Container
```bash
# Frontend
docker exec -it streamhub-frontend sh

# Backend
docker exec -it streamhub-backend sh

# Database
docker exec -it streamhub-postgres psql -U streamhub -d streamhub
```

---

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://backend:8000/api/v1
NODE_ENV=production
```

### Backend (apistreamhub-fastapi/.env)
```env
DATABASE_URL=postgresql://streamhub:streamhub_password@postgres:5432/streamhub
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## Production Deployment

### Deploy to VPS

1. **Copy files to server:**
```bash
scp -r streamhub-nextjs user@server:/var/www/
scp -r apistreamhub-fastapi user@server:/var/www/
scp docker-compose-full.yml user@server:/var/www/
```

2. **SSH into server:**
```bash
ssh user@server
cd /var/www
```

3. **Deploy:**
```bash
docker-compose -f docker-compose-full.yml up -d
```

4. **Setup reverse proxy (Nginx):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### Deploy to Cloud Platforms

**AWS ECS:**
- Push images to ECR
- Create ECS task definition
- Deploy to ECS cluster

**Google Cloud Run:**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/streamhub-frontend
gcloud run deploy streamhub-frontend --image gcr.io/PROJECT_ID/streamhub-frontend
```

**Azure Container Instances:**
```bash
az container create \
  --resource-group myResourceGroup \
  --name streamhub-frontend \
  --image myregistry.azurecr.io/streamhub-frontend \
  --dns-name-label streamhub-frontend \
  --ports 3000
```

---

## Troubleshooting

### Frontend can't connect to backend

**Problem:** Frontend shows "Network Error"

**Solution:**
- Check if backend is running: `docker ps`
- Check backend logs: `docker-compose logs backend`
- Verify API URL in frontend environment

### Database connection failed

**Problem:** Backend can't connect to PostgreSQL

**Solution:**
- Check if database is healthy: `docker-compose ps`
- Wait for database to be ready: `docker-compose logs postgres`
- Restart backend: `docker-compose restart backend`

### Container exits immediately

**Problem:** Container stops after starting

**Solution:**
- Check logs: `docker-compose logs SERVICE_NAME`
- Check if port is already in use: `netstat -tulpn | grep PORT`
- Rebuild image: `docker-compose build --no-cache SERVICE_NAME`

---

## Performance Optimization

### Reduce Image Size

Current sizes:
- Frontend: ~200MB (Node.js Alpine)
- Backend: ~300MB (Python Alpine)
- Database: ~200MB (PostgreSQL Alpine)

**Optimization tips:**
- Use multi-stage builds (already implemented)
- Remove unnecessary dependencies
- Use .dockerignore to exclude files

### Increase Performance

1. **Enable caching:**
```yaml
services:
  frontend:
    volumes:
      - /app/.next/cache
```

2. **Increase memory:**
```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 1G
```

3. **Use CDN for static assets:**
   - Upload `public/` folder to CDN
   - Configure Next.js to use CDN

---

## Security Best Practices

1. **Use secrets manager:**
   - Don't commit .env files
   - Use Docker secrets or AWS Secrets Manager

2. **Scan images for vulnerabilities:**
```bash
docker scan streamhub-frontend:latest
```

3. **Run as non-root user:**
   - Already configured in Dockerfiles

4. **Enable HTTPS:**
   - Use Let's Encrypt with Nginx
   - Configure SSL certificates

5. **Limit container privileges:**
   - Don't use --privileged flag
   - Drop capabilities in Dockerfile

---

## Backup & Restore

### Backup Database
```bash
docker exec streamhub-postgres pg_dump -U streamhub streamhub > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker exec -i streamhub-postgres psql -U streamhub streamhub
```

### Backup Volumes
```bash
docker run --rm -v streamhub_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz /data
```

---

## Monitoring

### Health Checks
```bash
# Check all services
docker-compose ps

# Check specific service
docker inspect streamhub-frontend | grep -A 10 Health
```

### Metrics
- Install Prometheus + Grafana
- Export container metrics
- Setup alerts

### Logs
```bash
# View logs in real-time
docker-compose logs -f

# Export logs
docker-compose logs > app.log
```

---

## Cost Estimation (Cloud Deployment)

**Small instance (1 vCPU, 1GB RAM):**
- AWS ECS: ~$20/month
- Google Cloud Run: ~$15/month
- Azure Container Instances: ~$18/month

**Large instance (4 vCPU, 8GB RAM):**
- AWS ECS: ~$80/month
- Google Cloud Run: ~$70/month
- Azure Container Instances: ~$75/month

---

## Support

If you encounter issues:

1. Check logs: `docker-compose logs`
2. Check documentation: `NEXTJS_COMPLETE.md`
3. Check backend docs: `apistreamhub-fastapi/README.md`
4. Open GitHub issue

---

**Status:** 🟢 Production Ready with Docker
**Last Updated:** 2026-02-25
