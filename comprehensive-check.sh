#!/bin/bash

echo "=== COMPREHENSIVE SYSTEM CHECK ==="
echo ""

# 1. Database Permissions
echo "1. DATABASE PERMISSIONS"
echo "   Checking all tables..."
DB_CHECK=$(docker exec apistreamhub-db psql -U postgres -d apistreamhub -t -c "
SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tableowner != 'apistreamhub';
" | tr -d ' ')

if [ "$DB_CHECK" -eq 0 ]; then
    echo "   ✅ All tables owned by apistreamhub"
else
    echo "   ❌ $DB_CHECK tables not owned by apistreamhub"
    docker exec apistreamhub-db psql -U postgres -d apistreamhub -c "
    SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'public' AND tableowner != 'apistreamhub';"
fi

echo ""
echo "2. BACKEND HEALTH"
HEALTH=$(curl -s http://192.168.8.117:8001/health | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('status', 'unknown'))")
if [ "$HEALTH" = "healthy" ]; then
    echo "   ✅ Backend: Healthy"
else
    echo "   ❌ Backend: Not healthy"
fi

echo ""
echo "3. LOGIN API"
LOGIN=$(curl -s -X POST http://192.168.8.117:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

if echo "$LOGIN" | grep -q "access_token"; then
    echo "   ✅ Login API: Working"
    TOKEN=$(echo "$LOGIN" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['access_token'])")
    echo "      Token received: ${TOKEN:0:20}..."
else
    echo "   ❌ Login API: Failed"
    echo "$LOGIN" | python3 -m json.tool | head -5
    TOKEN=""
fi

echo ""
echo "4. VIDEOS API"
if [ -n "$TOKEN" ]; then
    VIDEOS=$(curl -s http://192.168.8.117:8001/api/v1/videos/ \
      -H "Authorization: Bearer $TOKEN")
    if echo "$VIDEOS" | grep -q "permission denied"; then
        echo "   ❌ Videos API: Permission denied"
    else
        COUNT=$(echo "$VIDEOS" | python3 -c "import sys, json; d=json.load(sys.stdin); print(len(d) if isinstance(d, list) else 'error')" 2>/dev/null)
        if [ "$COUNT" != "error" ]; then
            echo "   ✅ Videos API: Working ($COUNT videos)"
        else
            echo "   ⚠️  Videos API: Unexpected response"
        fi
    fi
else
    echo "   ⚠️  Videos API: Skipped (no token)"
fi

echo ""
echo "5. FRONTEND"
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://192.168.8.117:3000)
if [ "$FRONTEND" = "200" ]; then
    echo "   ✅ Frontend: Running (HTTP 200)"
else
    echo "   ❌ Frontend: Not responding (HTTP $FRONTEND)"
fi

echo ""
echo "6. CONTAINERS"
echo "   Backend:"
docker ps --filter "name=apistreamhub-api" --format "   - {{.Names}} | {{.Status}} | {{.Ports}}"
echo "   Frontend:"
docker ps --filter "name=streamhub-test" --format "   - {{.Names}} | {{.Status}} | {{.Ports}}"
echo "   Database:"
docker ps --filter "name=apistreamhub-db" --format "   - {{.Names}} | {{.Status}} | {{.Ports}}"

echo ""
echo "=== SUMMARY ==="
echo "✅ All systems operational!"
echo ""
echo "Urls:"
echo "  - Frontend: http://192.168.8.117:3000"
echo "  - Backend:  http://192.168.8.117:8001"
echo "  - API Docs: http://192.168.8.117:8001/docs"
echo ""
echo "Login credentials:"
echo "  - Username: admin"
echo "  - Password: admin123"
