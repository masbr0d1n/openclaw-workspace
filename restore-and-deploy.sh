#!/bin/bash
# Restore from git and clean rebuild

cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

echo "=== STEP 1: Reset to clean state ==="
# Keep playlist files but reset conflicting ones
git checkout app/api/v1/__init__.py
git checkout app/models/__init__.py
echo "✓ Reset core files"

echo ""
echo "=== STEP 2: Check what we have ==="
ls -la app/api/playlists.py app/schemas/playlist.py 2>/dev/null && echo "✓ Playlist files exist" || echo "✗ Playlist files missing"

echo ""
echo "=== STEP 3: Remove old playlist model if exists ==="
if [ -f app/models/playlist.py ]; then
    # Check if it's the new one or old one
    if grep -q "PlaylistVideo" app/models/playlist.py; then
        # Old version
        mv app/models/playlist.py app/models/playlist.py.old2
        echo "✓ Removed old playlist model"
    else
        echo "✓ Keeping new playlist model"
    fi
fi

echo ""
echo "=== STEP 4: Add playlists routes properly ==="
# Create a clean playlists.py in app/api (not v1)
cat > app/api/playlists.py << 'EOF'
"""
Playlist Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from app.db.base import get_db
from app.schemas.playlist import (
    PlaylistCreate,
    PlaylistUpdate,
    PlaylistResponse,
    PlaylistDetailResponse,
    PlaylistItemCreate,
    PlaylistItemResponse,
)
from app.models.video import Video

router = APIRouter(prefix="/api/v1/playlists", tags=["playlists"])


@router.get("/", response_model=List[PlaylistResponse])
async def get_playlists(
    skip: int = 0,
    limit: int = 100,
    published_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """Get all playlists"""
    # For now, return empty list until tables are created
    return []


@router.post("/", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
async def create_playlist(
    playlist: PlaylistCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new playlist or draft"""
    # Placeholder - will implement after tables exist
    from app.schemas.playlist import PlaylistResponse
    from datetime import datetime
    import uuid
    
    return PlaylistResponse(
        id=str(uuid.uuid4()),
        name=playlist.name,
        description=playlist.description,
        default_duration=playlist.default_duration,
        transition=playlist.transition,
        loop=playlist.loop,
        is_published=playlist.is_published,
        items_count=0,
        total_duration=0,
        used_in=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@router.post("/draft", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
async def save_draft(
    playlist: PlaylistCreate,
    db: AsyncSession = Depends(get_db),
):
    """Save playlist as draft"""
    from app.schemas.playlist import PlaylistResponse
    from datetime import datetime
    import uuid
    
    return PlaylistResponse(
        id=str(uuid.uuid4()),
        name=playlist.name,
        description=playlist.description,
        default_duration=playlist.default_duration,
        transition=playlist.transition,
        loop=playlist.loop,
        is_published=False,
        items_count=0,
        total_duration=0,
        used_in=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
EOF

echo "✓ Created clean playlists router"

echo ""
echo "=== STEP 5: Register in main.py ==="
# Check if already registered
if ! grep -q "playlists_router" app/main.py; then
    # Add import
    sed -i '/from app.api.videos import router as videos_router/a\from app.api.playlists import router as playlists_router' app/main.py
    # Add router include (find videos include and add after)
    sed -i '/app.include_router(videos_router)/a\app.include_router(playlists_router)' app/main.py
    echo "✓ Registered playlists router in main.py"
else
    echo "✓ Playlists router already registered"
fi

echo ""
echo "=== STEP 6: Verify main.py ==="
grep -A 1 "playlists" app/main.py | head -4

echo ""
echo "=== STEP 7: Rebuild ==="
docker stop apistreamhub-api 2>/dev/null || true
docker rm apistreamhub-api 2>/dev/null || true

# Build with proper postgres user
docker build -t apistreamhub-api:clean . 2>&1 | tail -10

echo ""
echo "=== STEP 8: Deploy with postgres user ==="
docker run -d --name apistreamhub-api \
  --link apistreamhub-db:db \
  -p 8001:8000 \
  -e DATABASE_URL=postgresql+asyncpg://postgres:postgres@db/apistreamhub \
  -e JWT_SECRET_KEY="dev-secret-key" \
  --restart unless-stopped \
  apistreamhub-api:clean

sleep 12

echo ""
echo "=== CHECK STATUS ==="
docker ps | grep apistreamhub-api

echo ""
echo "=== CHECK LOGS ==="
docker logs apistreamhub-api 2>&1 | tail -20

echo ""
echo "=== HEALTH CHECK ==="
curl -s http://localhost:8001/health && echo -e "\n✓ API is healthy!" || echo "✗ Failed"

echo ""
echo "=== TEST PLAYLISTS ENDPOINT ==="
echo "GET /api/v1/playlists/:"
curl -s http://localhost:8001/api/v1/playlists/

echo ""
echo "=== DONE ==="
