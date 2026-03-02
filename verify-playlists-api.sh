#!/bin/bash
# Verify Playlists API is separate and test

cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

echo "=== CHECK ROUTES ===" && \
echo "" && \
echo "Our Playlists API:" && \
grep -n "prefix.*playlists" app/api/playlists.py && \
echo "" && \
echo "=== CHECK FOR CONFLICTS ===" && \
echo "" && \
echo "Searching for any other playlist endpoints..." && \
grep -r "router.*playlist" app/ --include="*.py" | grep -v "__pycache__" | grep -v "playlists.py" || echo "✓ No conflicts found" && \
echo "" && \
echo "=== LIST ALL ROUTES ===" && \
docker logs apistreamhub-api 2>&1 | grep -i "route.*playlists" || echo "Checking container..." && \
echo "" && \
echo "=== TEST ENDPOINTS ===" && \
echo "1. GET /api/v1/playlists/:" && \
curl -s http://localhost:8001/api/v1/playlists/ && \
echo "" && \
echo "" && \
echo "2. POST /api/v1/playlists/draft:" && \
curl -s -X POST http://localhost:8001/api/v1/playlists/draft \
  -H "Content-Type: application/json" \
  -d '{"name":"Verify API","default_duration":10}' | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"✓ Created: {data['name']} (ID: {data['id'][:8]}...)\" if 'id' in data else '✗ Failed')"
