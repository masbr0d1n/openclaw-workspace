#!/bin/bash
# Fix playlists router registration

cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

echo "=== CHECK CURRENT STATE ===" && \
ls -lh app/api/playlists.py && \
echo "" && \
echo "=== CHECK IF ROUTER EXISTS ===" && \
grep -n "router = APIRouter" app/api/playlists.py | head -3

echo ""
echo "=== CHECK IMPORTS IN MAIN.PY ===" && \
grep -n "playlists" app/main.py

echo ""
echo "=== CHECK ROUTER PREFIX ===" && \
grep "prefix" app/api/playlists.py | head -3

echo ""
echo "=== TEST ROUTING ===" && \
docker exec apistreamhub-api python3 << 'PYTHON'
import sys
sys.path.insert(0, '/app')

try:
    from app.api.playlists import router
    print(f"✓ Router imported: {router}")
    print(f"  Prefix: {router.prefix}")
    print(f"  Tags: {router.tags}")
    print(f"  Routes: {len(router.routes)}")
    for route in router.routes:
        print(f"    - {route.methods} {route.path}")
except Exception as e:
    print(f"✗ Error: {e}")
PYTHON
