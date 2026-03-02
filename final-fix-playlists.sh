#!/bin/bash
# Proper fix and deploy

cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

echo "=== FIXING PSYCOPG2 ISSUE ==="

# The project uses asyncpg but playlists need sync psycopg2
# Add psycopg2-binary
if ! grep -q "psycopg2-binary" requirements.txt; then
    echo "psycopg2-binary>=2.9.0" >> requirements.txt
    echo "✓ Added psycopg2-binary to requirements.txt"
fi

echo ""
echo "=== REBUILDING ==="
docker stop apistreamhub-api 2>/dev/null || true
docker rm apistreamhub-api 2>/dev/null || true

# Build with no cache
docker build --no-cache -t apistreamhub-api:playlists-final . 2>&1 | tail -20

echo ""
echo "=== DEPLOYING ==="
docker run -d --name apistreamhub-api \
  --link apistreamhub-db:db \
  -p 8001:8000 \
  -e DATABASE_URL=postgresql://apistreamhub:apistreamhub@db/apistreamhub \
  --restart unless-stopped \
  apistreamhub-api:playlists-final

echo "✓ Deployed, waiting for startup..."
sleep 8

echo ""
echo "=== CHECK LOGS ==="
docker logs apistreamhub-api --tail 20

echo ""
echo "=== CHECK HEALTH ==="
curl -s http://localhost:8001/health || echo "Health check failed"

echo ""
echo "=== CREATE TABLES ==="
# Wait a bit more for DB connection
sleep 3

docker exec apistreamhub-api python3 -c "
import sys
sys.path.insert(0, '/app')

try:
    # Try sync first
    from sqlalchemy import create_engine, text
    
    # Create sync engine for table creation
    engine = create_engine('postgresql://apistreamhub:apistreamhub@db/apistreamhub')
    
    # Import models
    from app.models.playlist import Playlist, PlaylistItem
    from app.db.base import Base
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print('✓ Tables created successfully')
    
    # Verify
    with engine.connect() as conn:
        result = conn.execute(text(\"\"\"
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('playlists', 'playlist_items')
        \"\"\"))
        tables = [row[0] for row in result]
        
        print('Tables verified:')
        for table in ['playlists', 'playlist_items']:
            if table in tables:
                print(f'  ✓ {table}')
            else:
                print(f'  ✗ {table} NOT FOUND')
    
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
" 2>&1

echo ""
echo "=== TEST API ==="
curl -s http://localhost:8001/api/v1/playlists/ || echo "API test"

echo ""
echo "=== DONE ==="
