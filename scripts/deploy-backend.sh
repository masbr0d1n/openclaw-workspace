#!/bin/bash

# Complete Backend Deployment with Permission Check
# Use this script when deploying backend

set -e

BACKEND_IMAGE="${1:-apistreamhub-api:latest}"
CONTAINER_NAME="${2:-apistreamhub-api}"

echo "=== Backend Deployment with Permission Check ==="
echo ""
echo "Image: $BACKEND_IMAGE"
echo "Container: $CONTAINER_NAME"
echo ""

# Step 1: Check database permissions
echo "Step 1: Checking database permissions..."
if ! bash /home/sysop/.openclaw/workspace/scripts/check-db-permissions.sh > /dev/null 2>&1; then
    echo "⚠️  Permission issues found, fixing..."
    bash /home/sysop/.openclaw/workspace/scripts/fix-db-permissions.sh
    echo "✅ Permissions fixed"
else
    echo "✅ Permissions OK"
fi

echo ""

# Step 2: Stop and remove old container
echo "Step 2: Removing old container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true
echo "✅ Old container removed"

echo ""

# Step 3: Start new container
echo "Step 3: Starting new container..."
docker run -d --name "$CONTAINER_NAME" \
  -p 8001:8000 \
  -e POSTGRES_USER=apistreamhub \
  -e POSTGRES_PASSWORD=apistreamhub_permission \
  -e DATABASE_URL="postgresql+asyncpg://apistreamhub:apistreamhub_password@172.17.0.3:5432/apistreamhub" \
  -e SECRET_KEY=your-secret-key-change-this-in-production \
  -e ALGORITHM=HS256 \
  -e ACCESS_TOKEN_EXPIRE_MINUTES=30 \
  -v apistreamhub-uploads:/app/uploads \
  "$BACKEND_IMAGE"

echo "✅ Container started"

echo ""

# Step 4: Wait for backend to be healthy
echo "Step 4: Waiting for backend to be healthy..."
sleep 5

for i in {1..12}; do
    if curl -s http://192.168.8.117:8001/health | grep -q "healthy"; then
        echo "✅ Backend is healthy"
        break
    fi
    echo "   Waiting... ($i/12)"
    sleep 5
done

echo ""

# Step 5: Test login
echo "Step 5: Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://192.168.8.117:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo "✅ Login working"
else
    echo "⚠️  Login test failed"
    echo "$LOGIN_RESPONSE" | head -5
fi

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Backend URL: http://192.168.8.117:8001"
echo "API Docs: http://192.168.8.117:8001/docs"
echo ""
echo "To view logs:"
echo "  docker logs -f $CONTAINER_NAME"
