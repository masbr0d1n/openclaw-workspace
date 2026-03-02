#!/bin/bash
# Setup playlists API in backend

cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi

echo "=== SETUP PLAYLISTS API ==="
echo ""

# 1. Create playlist files
echo "✓ Created playlist API files:"
echo "  - app/api/playlists.py (routes)"
echo "  - app/schemas/playlist.py (Pydantic models)"
echo "  - app/models/playlist.py (DB models)"
echo ""

# 2. Register routes in main.py
echo "2. Registering routes in main.py..."

# Check if already registered
if grep -q "from app.api.playlists import router as playlists_router" app/main.py; then
    echo "  ✓ Routes already registered"
else
    # Add import after other API imports
    sed -i '/from app.api.videos/a\from app.api.playlists import router as playlists_router' app/main.py

    # Include router
    sed -i '/app.include_router(videos_router/a\app.include_router(playlists_router)' app/main.py

    echo "  ✓ Routes registered"
fi

echo ""
echo "3. Creating database tables..."
python3 create_playlist_tables.py

echo ""
echo "=== SETUP COMPLETE ==="
echo ""
echo "Available endpoints:"
echo "  GET    /api/v1/playlists/ - List all playlists"
echo "  GET    /api/v1/playlists/{id} - Get playlist with items"
echo "  POST   /api/v1/playlists/ - Create playlist"
echo "  POST   /api/v1/playlists/draft - Save draft"
echo "  PUT    /api/v1/playlists/{id} - Update playlist"
echo "  POST   /api/v1/playlists/{id}/publish - Publish playlist"
echo "  DELETE /api/v1/playlists/{id} - Delete playlist"
echo ""
echo "Playlist Items (Timeline):"
echo "  GET    /api/v1/playlists/{id}/items - List items"
echo "  POST   /api/v1/playlists/{id}/items - Add item"
echo "  PUT    /api/v1/playlists/{id}/items/{item_id} - Update item"
echo "  DELETE /api/v1/playlists/{id}/items/{item_id} - Remove item"
echo "  POST   /api/v1/playlists/{id}/items/reorder - Reorder (DnD)"
echo "  DELETE /api/v1/playlists/{id}/items - Clear all items"
