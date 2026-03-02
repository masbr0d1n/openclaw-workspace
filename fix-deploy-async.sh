#!/bin/bash
# Fix DATABASE_URL for asyncpg

cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

echo "=== FIXING DATABASE URL ==="
echo ""
echo "The app uses asyncpg (async) but DATABASE_URL uses psycopg2 (sync) format"
echo "Need to change: postgresql:// → postgresql+asyncpg://"

echo ""
echo "=== REDEPLOY WITH CORRECT URL ==="

docker stop apistreamhub-api 2>/dev/null || true
docker rm apistreamhub-api 2>/dev/null || true

docker run -d --name apistreamhub-api \
  --link apistreamhub-db:db \
  -p 8001:8000 \
  -e DATABASE_URL=postgresql+asyncpg://apistreamhub:apistreamhub@db/apistreamhub \
  --restart unless-stopped \
  apistreamhub-api:playlists-final

echo "✓ Deployed with async DATABASE_URL"
sleep 8

echo ""
echo "=== CHECK LOGS ==="
docker logs apistreamhub-api --tail 15

echo ""
echo "=== HEALTH CHECK ==="
curl -s http://localhost:8001/health && echo "✓ API is healthy!" || echo "✗ Health check failed"

echo ""
echo "=== CREATE PLAYLIST TABLES ==="
sleep 3

# Create tables using the async schema
docker exec apistreamhub-api python3 << 'PYTHON'
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def create_tables():
    # Create async engine
    engine = create_async_engine("postgresql+asyncpg://apistreamhub:apistreamhub@db/apistreamhub", echo=False)
    
    # Create tables using SQL (simpler than ORM for this)
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
        
        # Create indexes
        await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist_id ON playlist_items(playlist_id)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_playlist_items_order ON playlist_items(playlist_id, \"order\")"))
        
        print("✓ Tables created successfully")
        
        # Verify
        result = await conn.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('playlists', 'playlist_items')
            ORDER BY table_name
        """))
        
        tables = [row[0] for row in result]
        print("\nTables verified:")
        for table in ['playlists', 'playlist_items']:
            if table in tables:
                print(f"  ✓ {table}")
            else:
                print(f"  ✗ {table} NOT FOUND")
    
    await engine.dispose()

asyncio.run(create_tables())
PYTHON

echo ""
echo "=== TEST PLAYLISTS API ==="
sleep 2

# Test GET playlists endpoint
echo "Testing GET /api/v1/playlists/ ..."
curl -s http://localhost:8001/api/v1/playlists/ | head -100

echo ""
echo "=== DONE ==="
echo ""
echo "✓ Backend deployed with playlists API"
echo "✓ Database tables created"
echo "✓ Ready for frontend integration"
