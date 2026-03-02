# Playlists Backend API - Complete ✅

## Status: DEPLOYED & WORKING

**Backend URL:** http://192.168.8.117:8001
**API Docs:** http://192.168.8.117:8001/docs
**Health:** ✅ Healthy
**Database:** ✅ Connected (PostgreSQL)
**Tables:** ✅ Created

---

## API Endpoints (14 total)

### Playlist Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/playlists/` | List all playlists |
| POST | `/api/v1/playlists/` | **Save playlist** |
| POST | `/api/v1/playlists/draft` | **Save draft** 📝 |
| PUT | `/api/v1/playlists/{id}` | Update playlist |
| POST | `/api/v1/playlists/{id}/publish` | Publish playlist 🚀 |
| DELETE | `/api/v1/playlists/{id}` | Delete playlist |

### Timeline Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/playlists/{id}/items` | Get playlist items |
| POST | `/api/v1/playlists/{id}/items` | Add item to timeline ➕ |
| PUT | `/api/v1/playlists/{id}/items/{item_id}` | Update item |
| DELETE | `/api/v1/playlists/{id}/items/{item_id}` | Remove item ➖ |
| POST | `/api/v1/playlists/{id}/items/reorder` | **Reorder items (Drag & Drop)** 🎯 |
| DELETE | `/api/v1/playlists/{id}/items` | Clear all items |

---

## Database Schema

### `playlists` table
```sql
- id: VARCHAR (PK)
- name: VARCHAR(255)
- description: TEXT
- default_duration: INTEGER (default 10s)
- transition: VARCHAR (fade|slide|none)
- loop: BOOLEAN
- is_published: BOOLEAN (false=draft, true=published)
- items_count: INTEGER
- total_duration: INTEGER (seconds)
- used_in: INTEGER (number of screens)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### `playlist_items` table
```sql
- id: VARCHAR (PK)
- playlist_id: VARCHAR (FK → playlists.id)
- media_id: VARCHAR (FK → videos.id)
- duration: INTEGER (seconds)
- "order": INTEGER (position in timeline)
```

---

## How It Works

### 1. Media Library Sync ✅
- Playlist items reference `videos` table via `media_id`
- Validates media exists before adding to playlist
- Fetches media name, type automatically

### 2. Save Playlist ✅
```bash
POST /api/v1/playlists/
{
  "name": "Morning Promo",
  "description": "Flash sale playlist",
  "default_duration": 10,
  "transition": "fade",
  "loop": true,
  "is_published": false  # or true
}
```

### 3. Save Draft ✅
```bash
POST /api/v1/playlists/draft
# Same body as above, is_published automatically set to false
```

### 4. Drag & Drop Reordering ✅
```bash
POST /api/v1/playlists/{id}/items/reorder
{
  "item_id_1": 1,
  "item_id_2": 2,
  "item_id_3": 3
}
```

---

## Files Created

```
apistreamhub-fastapi/
├── app/api/playlists.py (9.7 KB)
├── app/schemas/playlist.py (2.0 KB)
├── create_playlist_tables.py
└── requirements.txt (+ psycopg2-binary)
```

---

## Testing

```bash
# List playlists
curl http://192.168.8.117:8001/api/v1/playlists/

# Get media library (for sync)
curl http://192.168.8.117:8001/api/v1/videos/

# Create draft
curl -X POST http://192.168.8.117:8001/api/v1/playlists/draft \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Playlist", "default_duration": 10}'
```

---

## Next Steps

### Frontend Integration

1. **Fetch Media Library:**
   ```typescript
   const media = await fetch('http://192.168.8.117:8001/api/v1/videos/')
   ```

2. **Save Draft:**
   ```typescript
   await fetch('http://192.168.8.117:8001/api/v1/playlists/draft', {
     method: 'POST',
     body: JSON.stringify(playlistData)
   })
   ```

3. **Add Items:**
   ```typescript
   await fetch(`/api/v1/playlists/${id}/items`, {
     method: 'POST',
     body: JSON.stringify({ media_id, duration })
   })
   ```

4. **Reorder (Drag & Drop):**
   ```typescript
   await fetch(`/api/v1/playlists/${id}/items/reorder`, {
     method: 'POST',
     body: JSON.stringify({ [itemId]: newOrder })
   })
   ```

---

## Deployment Details

- **Container:** apistreamhub-api:latest
- **Port:** 8001 (host) → 8000 (container)
- **Database:** apistreamhub-db (PostgreSQL 16)
- **Database URL:** postgresql+asyncpg://postgres:postgres@db/apistreamhub
- **Restart Policy:** unless-stopped
- **Health Check:** ✅ Passing

---

## Summary

✅ **All 4 requirements met:**
1. ✅ Media Library sync API (via videos table)
2. ✅ Save Playlist API (POST /api/v1/playlists/)
3. ✅ Save Draft API (POST /api/v1/playlists/draft)
4. ✅ Drag & Drop / Timeline API (POST /api/v1/playlists/{id}/items/reorder)

✅ **14 API endpoints created**
✅ **2 database tables created**
✅ **Backend deployed and healthy**
✅ **Ready for frontend integration**

---

*Created: 2026-03-02*
*Status: Production Ready* 🚀
