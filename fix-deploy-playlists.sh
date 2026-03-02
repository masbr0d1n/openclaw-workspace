#!/bin/bash
# Fix and deploy playlists API

cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

echo "=== STEP 1: Fix imports in playlists.py ==="
# Fix the import
sed -i 's/from app.db.base import get_db/from app.database import get_db/' app/api/playlists.py
sed -i 's/from app.models.playlist import Playlist, PlaylistItem/from app.models.playlist import Playlist, PlaylistItem/' app/api/playlists.py
sed -i 's/from app.models.video import Video/from app.models.video import Video/' app/api/playlists.py

echo "✓ Imports fixed"

echo ""
echo "=== STEP 2: Register router in main.py ==="

# Check if already registered
if ! grep -q "playlists_router" app/main.py; then
    # Add import after videos import
    sed -i '/from app.api.videos import router as videos_router/a\from app.api.playlists import router as playlists_router' app/main.py
    
    # Add router include
    sed -i '/app.include_router(videos_router)/a\app.include_router(playlists_router)' app/main.py
    
    echo "✓ Router registered"
else
    echo "✓ Router already registered"
fi

echo ""
echo "=== STEP 3: Verify main.py ==="
grep -A 1 "playlists" app/main.py | head -4

echo ""
echo "=== STEP 4: Rebuild backend ==="
docker stop apistreamhub-api 2>/dev/null || true
docker rm apistreamhub-api 2>/dev/null || true

docker build -t apistreamhub-api:playlists-fixed . 2>&1 | tail -10

echo ""
echo "=== STEP 5: Deploy backend ==="
docker run -d --name apistreamhub-api \
  --link apistreamhub-db:db \
  -p 8001:8000 \
  -e DATABASE_URL=postgresql://apistreamhub:apistreamhub@db/apistreamhub \
  --restart unless-stopped \
  apistreamhub-api:playlists-fixed

sleep 5

echo "✓ Backend deployed!"
docker logs apistreamhub-api --tail 15

echo ""
echo "=== STEP 6: Create database tables ==="
# We'll need to run this inside the container
docker exec apistreamhub-api python3 -c "
from app.database import engine, Base
from app.models.playlist import Playlist, PlaylistItem
Base.metadata.create_all(bind=engine)
print('✓ Tables created')
" 2>&1

echo ""
echo "=== STEP 7: Verify tables ==="
docker exec apistreamhub-api python3 -c "
from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    result = db.execute(text(\"\"\"
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('playlists', 'playlist_items')
    \"\"\"))
    tables = [row[0] for row in result]
    
    print('Tables created:')
    for table in ['playlists', 'playlist_items']:
        if table in tables:
            print(f'  ✓ {table}')
        else:
            print(f'  ✗ {table} NOT found')
    db.commit()
except Exception as e:
    print(f'Error: {e}')
finally:
    db.close()
" 2>&1

echo ""
echo "=== DONE ==="
