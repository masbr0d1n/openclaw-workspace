# DATABASE SCHEMA MISMATCH FIX

## Problem Statement

**User Report:**
"error lagi" with full error details showing database schema mismatch.

**Error Details:**
```
sqlalchemy.exc.ProgrammingError: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError)
<class 'asyncpg.exceptions.UndefinedColumnError'>: column "name" of relation "playlist_items" does not exist

[SQL:
    INSERT INTO playlist_items (id, playlist_id, media_id, name, duration, "order", media_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
]
```

## Root Cause Analysis

### Database Schema vs Code Mismatch

**Actual Database Schema:**
```sql
\d playlist_items

Column    | Type
-----------+------------------
id         | character varying (PK)
playlist_id| character varying (FK)
media_id   | character varying (FK)
duration   | integer
order      | integer

-- NO 'name' column!
-- NO 'media_type' column!
```

**Code Trying to INSERT:**
```python
INSERT INTO playlist_items (id, playlist_id, media_id, name, duration, "order", media_type)
VALUES (:id, :playlist_id, :media_id, :name, :duration, :order, :media_type)
```

**Result:** PostgreSQL error - columns "name" and "media_type" don't exist!

### Why This Happened

**Assumption:** Code assumed `playlist_items` table would store `name` and `media_type` as denormalized data.

**Reality:** Table design uses normalized approach - `name` and `media_type` are stored in `videos` table and fetched via JOIN.

**GET Endpoint Already Correct:**
```sql
SELECT pi.id, pi.media_id, v.title as name, v.content_type as media_type
FROM playlist_items pi
LEFT JOIN videos v ON pi.media_id = CAST(v.id AS VARCHAR)
```

The GET query correctly fetches `name` and `media_type` from the `videos` table via JOIN, but the INSERT query tried to store them in `playlist_items`.

## Solution

### Fix Applied

**File:** `/apistreamhub-fastapi/app/api/playlists.py`

**Function:** `insert_playlist_items()`

**Before (Line 220-238):**
```python
item_name = item.name if item.name else 'Unknown'
item_media_type = item.media_type if item.media_type else 'video'

insert_query = text("""
    INSERT INTO playlist_items (id, playlist_id, media_id, name, duration, "order", media_type)
    VALUES (:id, :playlist_id, :media_id, :name, :duration, :order, :media_type)
""")

await db.execute(insert_query, {
    "id": item_id,
    "playlist_id": playlist_id,
    "media_id": item_media_id,
    "name": item_name,  # ← Column doesn't exist!
    "duration": item_duration,
    "order": item_order,
    "media_type": item_media_type,  # ← Column doesn't exist!
})
```

**After:**
```python
# Removed item_name and item_media_type variables

insert_query = text("""
    INSERT INTO playlist_items (id, playlist_id, media_id, duration, "order")
    VALUES (:id, :playlist_id, :media_id, :duration, :order)
""")

await db.execute(insert_query, {
    "id": item_id,
    "playlist_id": playlist_id,
    "media_id": item_media_id,
    "duration": item_duration,
    "order": item_order,
    # Removed name and media_type parameters
})
```

### Why This Works

**Normalized Database Design:**

**playlist_items table (junction table):**
- Stores relationship between playlists and videos
- Only essential fields: id, playlist_id, media_id, duration, order
- Lightweight - stores minimal data

**videos table (lookup table):**
- Stores video metadata: title, content_type, file_path, etc.
- Single source of truth for video information
- Avoids data duplication

**JOIN for Complete Data:**
```sql
SELECT
    pi.id,           -- From playlist_items
    pi.playlist_id,  -- From playlist_items
    pi.media_id,     -- From playlist_items
    pi.duration,     -- From playlist_items
    pi.order,        -- From playlist_items
    v.title as name, -- From videos (JOIN)
    v.content_type as media_type  -- From videos (JOIN)
FROM playlist_items pi
LEFT JOIN videos v ON pi.media_id = CAST(v.id AS VARCHAR)
```

## Deployment

### Backend Build
```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi
docker build -t apistreamhub-api:schema-fix .
docker stop apistreamhub-api && docker rm apistreamhub-api
docker run -d --name apistreamhub-api \
  -p 8001:8000 \
  -e DATABASE_URL=postgresql+asyncpg://postgres:postgres@172.17.0.3:5432/apistreamhub \
  -e BACKEND_CORS_ORIGINS=http://localhost:3000,http://192.168.8.117:3000,http://100.74.116.116:3000 \
  --restart unless-stopped \
  apistreamhub-api:schema-fix
```

### Deployment Details
- **Image:** `apistreamhub-api:schema-fix`
- **Container:** `b10d54368e67`
- **Status:** Up (healthy) ✅
- **Port:** 8001 → 8000
- **Database:** 172.17.0.3:5432

### Git Commit
- **Commit:** 1b73f3f
- **Branch:** master
- **Remote:** Forgejo
- **Files Changed:** 1 file, 4 insertions(+), 6 deletions(-)

## Test Results

### Before Fix
```
POST /api/playlists (with items)
Request: {"items": [{"media_id": "18", "name": "test", "duration": 60, ...}]}
Backend: Pydantic validates ✅
Processing: insert_playlist_items()
SQL: INSERT INTO playlist_items (..., name, ..., media_type)
Error: UndefinedColumnError - column "name" does not exist
Response: 500 Internal Server Error
Result: Draft NOT saved ❌
```

### After Fix
```
POST /api/playlists (with items)
Request: {"items": [{"media_id": "18", "name": "test", "duration": 60, ...}]}
Backend: Pydantic validates ✅
Processing: insert_playlist_items()
SQL: INSERT INTO playlist_items (id, playlist_id, media_id, duration, order)
Database: Insert successful ✅
Response: 201 Created
Result: Draft saved with items ✅

GET /api/playlists/{id}
SQL: SELECT pi.*, v.title as name, v.content_type as media_type
     FROM playlist_items pi LEFT JOIN videos v ON ...
Response: Items with name and media_type from videos table ✅
Result: Edit draft shows populated timeline ✅
```

## Related Issues

This is the fifth bug fix in the "empty timeline when editing drafts" issue series:
- **Part 1:** Backend not saving items (commit 853eea1)
- **Part 2:** Frontend sending media_id as number (commit 752f59f)
- **Part 3:** Frontend sending duration as float (commit 2c84bc1)
- **Part 4:** Backend using dict.get() on Pydantic models (commit e0f3e81)
- **Part 5:** INSERT trying to use non-existent columns (commit 1b73f3f) ← **THIS**

## Lessons Learned

1. **Always check actual database schema** - Don't assume, verify with \d command
2. **Match code to database design** - Normalized vs denormalized data approach
3. **Use JOINs for lookup data** - Don't duplicate data across tables
4. **SELECT and INSERT must match** - If INSERT excludes columns, SELECT should use JOIN
5. **Test with real database** - Mock data or different schema won't reveal mismatches

## Database Schema Reference

### playlist_items Table
```sql
CREATE TABLE playlist_items (
    id         CHARACTER VARYING PRIMARY KEY,
    playlist_id CHARACTER VARYING NOT NULL,
    media_id   CHARACTER VARYING NOT NULL,
    duration   INTEGER NOT NULL,
    "order"    INTEGER NOT NULL,
    CONSTRAINT playlist_items_playlist_id_fkey
        FOREIGN KEY (playlist_id)
        REFERENCES playlists(id)
        ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_playlist_items_order ON playlist_items(playlist_id, "order");
CREATE INDEX idx_playlist_items_playlist_id ON playlist_items(playlist_id);
```

### videos Table (for JOIN reference)
```sql
CREATE TABLE videos (
    id           BIGINT PRIMARY KEY,
    title        CHARACTER VARYING,
    content_type CHARACTER VARYING,
    file_path    TEXT,
    duration     INTEGER,
    created_at   TIMESTAMP
);
```

## Quick Reference

| Operation | SQL Pattern |
|-----------|-------------|
| INSERT items | `INSERT INTO playlist_items (id, playlist_id, media_id, duration, order)` |
| SELECT items | `SELECT pi.*, v.title as name, v.content_type as media_type FROM playlist_items pi LEFT JOIN videos v ON pi.media_id = CAST(v.id AS VARCHAR)` |
| Get item name | `v.title as name` (from videos table) |
| Get media type | `v.content_type as media_type` (from videos table) |

## Files Changed

- `apistreamhub-fastapi/app/api/playlists.py`
  - Function: `insert_playlist_items()`
  - Lines 220-238: Removed name and media_type from INSERT
  - Removed item_name and item_media_type variables
  - Removed name and media_type from parameters dict

---
**Status:** ✅ FIXED
**Date:** 2026-03-02 17:16
**Deployed:** apistreamhub-api:schema-fix
**Commit:** 1b73f3f
**Previous Fixes:**
  - 853eea1 (backend item processing)
  - 752f59f (media_id string conversion)
  - 2c84bc1 (duration integer conversion)
  - e0f3e81 (Pydantic attribute access)
