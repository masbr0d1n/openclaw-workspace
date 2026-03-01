#!/bin/bash

echo "=== COMPLETE DATABASE PERMISSION FIX ==="
echo ""

# Check all tables
echo "1. Checking table ownership..."
docker exec apistreamhub-db psql -U postgres -d apistreamhub -c "
SELECT 
    tablename, 
    tableowner,
    CASE 
        WHEN tableowner = 'apistreamhub' THEN '✅'
        ELSE '❌'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

echo ""
echo "2. Checking sequence ownership..."
docker exec apistreamhub-db psql -U postgres -d apistreamhub -c "
SELECT 
    sequencename,
    sequenceowner,
    CASE 
        WHEN sequenceowner = 'apistreamhub' THEN '✅'
        ELSE '❌'
    END as status
FROM pg_sequences 
WHERE schemaname = 'public'
ORDER BY sequencename;
"

echo ""
echo "3. Testing login API..."
LOGIN_RESULT=$(curl -s -X POST http://192.168.8.117:8001/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123")

if echo "$LOGIN_RESULT" | grep -q "access_token"; then
    echo "   ✅ Login SUCCESS!"
    TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
    echo "   Token: ${TOKEN:0:20}..."
elif echo "$LOGIN_RESULT" | grep -q "permission denied"; then
    echo "   ❌ Login FAILED: Permission denied"
    echo "$LOGIN_RESULT" | python3 -m json.tool 2>&1 | head -10
else
    echo "   ⚠️  Login response:"
    echo "$LOGIN_RESULT" | python3 -m json.tool 2>&1 | head -10
fi

echo ""
echo "4. Testing videos API..."
VIDEOS_RESULT=$(curl -s http://192.168.8.117:8001/api/v1/videos/)
if echo "$VIDEOS_RESULT" | grep -q "permission denied"; then
    echo "   ❌ Videos API: Permission denied"
else
    COUNT=$(echo "$VIDEOS_RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data) if isinstance(data, list) else 'N/A')" 2>/dev/null)
    echo "   ✅ Videos API: Working ($COUNT videos)"
fi

echo ""
echo "=== SUMMARY ==="
echo "All tables should be owned by 'apistreamhub' user."
echo "If any ❌ appear, run manual fix:"
echo "  docker exec apistreamhub-db psql -U postgres -d apistreamhub -c 'ALTER TABLE <table_name> OWNER TO apistreamhub;'"
