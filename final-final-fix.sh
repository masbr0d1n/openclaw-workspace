#!/bin/bash
# Final fix - remove old playlist model

cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

echo "=== STEP 1: Remove conflicting old playlist model ==="
if [ -f app/models/playlist.py ]; then
    mv app/models/playlist.py app/models/playlist.py.old
    echo "✓ Moved old playlist.py to playlist.py.old"
fi

echo ""
echo "=== STEP 2: Fix models/__init__.py ==="
# Remove playlist import
sed -i '/from app.models.playlist import/d' app/models/__init__.py
echo "✓ Removed playlist import from __init__.py"

echo ""
echo "=== STEP 3: Verify our new files ==="
ls -lh app/api/playlists.py app/schemas/playlist.py

echo ""
echo "=== STEP 4: Rebuild (fast - cache) ==="
docker stop apistreamhub-api 2>/dev/null || true
docker rm apistreamhub-api 2>/dev/null || true

docker build -t apistreamhub-api:final . 2>&1 | tail -10

echo ""
echo "=== STEP 5: Deploy ==="
docker run -d --name apistreamhub-api \
  --link apistreamhub-db:db \
  -p 8001:8000 \
  -e DATABASE_URL=postgresql+asyncpg://apistreamhub:apistreamhub@db/apistreamhub \
  --restart unless-stopped \
  apistreamhub-api:final

sleep 10

echo ""
echo "=== CHECK STATUS ==="
docker ps | grep apistreamhub-api

echo ""
echo "=== CHECK LOGS ==="
docker logs apistreamhub-api --tail 20

echo ""
echo "=== HEALTH CHECK ==="
curl -s http://localhost:8001/health && echo -e "\n✓ API is healthy!" || echo "✗ Failed"

echo ""
echo "=== CREATE TABLES (async) ==="
sleep 3

docker exec apistreamhub-api python3 << 'PYTHON'
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def create_tables():
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
        
        print("✓ Tables created")
        
        # Verify
        result = await conn.execute(text("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('playlists', 'playlist_items')
        """))
        
        tables = [row[0] for row in result]
        for table in ['playlists', 'playlist_items']:
            status = "✓" if table in tables else "✗"
            print(f"{status} {table}")
    
    await engine.dispose()

asyncio.run(create_tables())
PYTHON

echo ""
echo "=== TEST API ==="
echo "GET /api/v1/playlists/:"
curl -s http://localhost:8001/api/v1/playlists/ | head -50

echo ""
echo "=== DONE ==="
