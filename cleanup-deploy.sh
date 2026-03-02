#!/bin/bash
# Final cleanup and deploy

cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

echo "=== STEP 1: Clean up conflicting files ==="
# Remove old v1 playlists file
if [ -f app/api/v1/playlists.py ]; then
    rm app/api/v1/playlists.py
    echo "✓ Removed app/api/v1/playlists.py"
fi

# Remove from v1 __init__.py
sed -i '/playlists,/d' app/api/v1/__init__.py
sed -i '/playlists/d' app/api/v1/__init__.py
echo "✓ Removed playlists from v1/__init__.py"

echo ""
echo "=== STEP 2: Rebuild ==="
docker stop apistreamhub-api 2>/dev/null || true
docker rm apistreamhub-api 2>/dev/null || true

docker build -t apistreamhub-api:playlists-ready . 2>&1 | tail -10

echo ""
echo "=== STEP 3: Deploy ==="
docker run -d --name apistreamhub-api \
  --link apistreamhub-db:db \
  -p 8001:8000 \
  -e DATABASE_URL=postgresql+asyncpg://apistreamhub:apistreamhub@db/apistreamhub \
  --restart unless-stopped \
  apistreamhub-api:playlists-ready

sleep 12

echo ""
echo "=== STATUS ==="
docker ps | grep apistreamhub-api

echo ""
echo "=== LOGS ==="
docker logs apistreamhub-api 2>&1 | tail -25

echo ""
echo "=== HEALTH ==="
curl -s http://localhost:8001/health && echo -e "\n✓ Healthy!" || echo "✗ Failed"

echo ""
echo "=== CREATE TABLES ==="
sleep 3

docker exec apistreamhub-api python3 << 'PYTHON'
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def create_and_verify():
    engine = create_async_engine("postgresql+asyncpg://apistreamhub:apistreamhub@db/apistreamhub")
    
    async with engine.begin() as conn:
        # Create playlists table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS playlists (
                id VARCHAR PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                default_duration INTEGER DEFAULT 10,
                transition VARCHAR(50) DEFAULT 'fade',
                loop BOOLEAN DEFAULT TRUE,
                is_published BOOLEAN DEFAULT FALSE,
                items_count INTEGER DEFAULT 0,
                total_duration INTEGER DEFAULT 0,
                used_in INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        
        # Create playlist_items table  
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS playlist_items (
                id VARCHAR PRIMARY KEY,
                playlist_id VARCHAR NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
                media_id VARCHAR NOT NULL REFERENCES videos(id),
                duration INTEGER NOT NULL,
                "order" INTEGER NOT NULL
            )
        """))
        
        print("✓ Tables created successfully\n")
        
        # Verify
        result = await conn.execute(text("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('playlists', 'playlist_items')
            ORDER BY table_name
        """))
        
        tables = [row[0] for row in result]
        print("Tables verification:")
        for table in ['playlists', 'playlist_items']:
            status = "✓" if table in tables else "✗"
            print(f"  {status} {table}")
    
    await engine.dispose()

asyncio.run(create_and_verify())
PYTHON

echo ""
echo "=== TEST PLAYLISTS ENDPOINT ==="
sleep 2
echo "GET /api/v1/playlists/:"
curl -s http://localhost:8001/api/v1/playlists/ | python3 -m json.tool 2>/dev/null || echo "[]"

echo ""
echo "=== DOCUMENTATION ==="
echo "✓ Playlists API available at: http://192.168.8.117:8001/docs"
echo ""
echo "=== DONE ==="
