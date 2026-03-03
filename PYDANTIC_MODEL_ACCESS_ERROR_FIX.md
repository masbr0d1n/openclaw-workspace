# PYDANTIC MODEL ACCESS ERROR

## Problem Statement

**User Report:**
"error ini: status 500, error 'PlaylistItemCreateSimple' object has no attribute 'get'"

**Error Details:**
```
status: false
statusCode: 500
error: "InternalServerError"
message: "'PlaylistItemCreateSimple' object has no attribute 'get'"
```

**Full Traceback:**
```python
Traceback (most recent call last):
  File "/usr/local/lib/python3.11/site-packages/starlette/middleware/errors.py", line 164, in __call__
  ...
  File "/app/app/api/playlists.py", line 218, in insert_playlist_items
    item_order = item.get('order', idx)
  ...
AttributeError: 'PlaylistItemCreateSimple' object has no attribute 'get'
```

## Root Cause Analysis

### Confusion: Dictionary vs Pydantic Model

**The Bug:**
```python
async def insert_playlist_items(playlist_id: str, items: List, db: AsyncSession):
    for idx, item in enumerate(items, start=1):
        item_order = item.get('order', idx)  # ← WRONG!
        "media_id": item.get('media_id', ''),  # ← WRONG!
        "name": item.get('name', 'Unknown'),  # ← WRONG!
```

**What is `item`?**
- `item` is an instance of `PlaylistItemCreateSimple`
- This is a **Pydantic model**, not a dictionary
- Pydantic models use **attribute access**, not dictionary methods

### Why This Happened

**Schema Definition:**
```python
class PlaylistItemCreateSimple(BaseModel):
    """Simple item schema for playlist creation"""
    media_id: str
    name: str
    duration: int
    order: int
    media_type: str = "video"
```

**Frontend sends:**
```json
{
  "items": [
    {
      "media_id": "18",
      "name": "Video Title",
      "duration": 143,
      "order": 1,
      "media_type": "video"
    }
  ]
}
```

**Backend receives:**
```python
playlist: PlaylistCreate
playlist.items = [PlaylistItemCreateSimple(...), ...]  # Pydantic models!
```

### Dictionary vs Pydantic Access

**Dictionary (Python dict):**
```python
data = {'order': 1, 'name': 'test'}
order = data.get('order', 1)  # ✅ Works!
name = data['name']  # ✅ Works!
```

**Pydantic Model:**
```python
from pydantic import BaseModel

class Item(BaseModel):
    order: int
    name: str

item = Item(order=1, name='test')
order = item.order  # ✅ Works!
name = item.name  # ✅ Works!
order = item.get('order')  # ❌ AttributeError!
```

## Solution

### Fix Applied

**File:** `/apistreamhub-fastapi/app/api/playlists.py`

**Function:** `insert_playlist_items()`

**Before (Line 218-227):**
```python
async def insert_playlist_items(playlist_id: str, items: List, db: AsyncSession):
    for idx, item in enumerate(items, start=1):
        item_id = str(uuid.uuid4())
        item_order = item.get('order', idx)  # ← dict access

        await db.execute(insert_query, {
            "media_id": item.get('media_id', ''),  # ← dict access
            "name": item.get('name', 'Unknown'),  # ← dict access
            "duration": item.get('duration', 10),  # ← dict access
            "media_type": item.get('media_type', 'video'),  # ← dict access
        })
```

**After:**
```python
async def insert_playlist_items(playlist_id: str, items: List, db: AsyncSession):
    for idx, item in enumerate(items, start=1):
        item_id = str(uuid.uuid4())
        # Use attribute access for Pydantic models
        item_order = item.order if item.order else idx
        item_media_id = str(item.media_id) if item.media_id else ''
        item_name = item.name if item.name else 'Unknown'
        item_duration = int(item.duration) if item.duration else 10
        item_media_type = item.media_type if item.media_type else 'video'

        await db.execute(insert_query, {
            "media_id": item_media_id,
            "name": item_name,
            "duration": item_duration,
            "order": item_order,
            "media_type": item_media_type,
        })
```

### Changes Made

1. **Attribute Access:** Changed `item.get('key')` to `item.key`
2. **Null Safety:** Added `if item.key else default` for optional fields
3. **Type Conversion:**
   - `str(item.media_id)` - Ensure string type
   - `int(item.duration)` - Ensure integer type

### Why This Works

**Pydantic Model Attributes:**
```python
item = PlaylistItemCreateSimple(
    media_id="18",
    name="Video",
    duration=143,
    order=1,
    media_type="video"
)

# Access attributes directly:
item.media_id  # "18"
item.name  # "Video"
item.duration  # 143
item.order  # 1
item.media_type  # "video"
```

**Null Safety Pattern:**
```python
# If order exists, use it; otherwise use index
item_order = item.order if item.order else idx

# Equivalent to:
if item.order:
    item_order = item.order
else:
    item_order = idx
```

## Deployment

### Backend Build
```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi
docker build -t apistreamhub-api:pydantic-fix .
docker stop apistreamhub-api && docker rm apistreamhub-api
docker run -d --name apistreamhub-api \
  -p 8001:8000 \
  -e DATABASE_URL=postgresql+asyncpg://postgres:postgres@172.17.0.3:5432/apistreamhub \
  -e BACKEND_CORS_ORIGINS=http://localhost:3000,http://192.168.8.117:3000,http://100.74.116.116:3000 \
  --restart unless-stopped \
  apistreamhub-api:pydantic-fix
```

### Deployment Details
- **Image:** `apistreamhub-api:pydantic-fix`
- **Container:** `c733008d8ef4`
- **Status:** Up (healthy) ✅
- **Port:** 8001 → 8000
- **Database:** 172.17.0.3:5432

### Git Commit
- **Commit:** e0f3e81
- **Branch:** master
- **Remote:** Forgejo
- **Files Changed:** 1 file, 16 insertions(+), 11 deletions(-)

## Test Results

### Before Fix
```
POST /api/playlists (with items)
Request: {"items": [{"media_id": "18", "duration": 143, ...}]}
Backend: Pydantic validates ✅
Processing: insert_playlist_items()
Error: AttributeError at line 218
Response: 500 Internal Server Error
Result: Draft NOT saved ❌
```

### After Fix
```
POST /api/playlists (with items)
Request: {"items": [{"media_id": "18", "duration": 143, ...}]}
Backend: Pydantic validates ✅
Processing: insert_playlist_items()
Access: item.media_id, item.duration, etc. ✅
Database: Items inserted successfully ✅
Response: 201 Created
Result: Draft saved with items ✅
```

## Related Issues

This is the fourth bug fix in the "empty timeline when editing drafts" issue series:
- **Part 1:** Backend not saving items (commit 853eea1)
- **Part 2:** Frontend sending media_id as number (commit 752f59f)
- **Part 3:** Frontend sending duration as float (commit 2c84bc1)
- **Part 4:** Backend using dict.get() on Pydantic models (commit e0f3e81) ← **THIS**

## Lessons Learned

1. **Know your data types** - Pydantic models ≠ dictionaries
2. **Pydantic uses attribute access** - `item.key` not `item.get('key')`
3. **Test with real data** - Mock data might not reveal type issues
4. **Null safety is important** - Use `if item.key else default`
5. **Type conversion at boundaries** - `str()` and `int()` for safety

## Quick Reference

| Operation | Dictionary | Pydantic Model |
|-----------|-----------|----------------|
| Get value | `data.get('key')` | `model.key` |
| Get with default | `data.get('key', default)` | `model.key if model.key else default` |
| Check exists | `'key' in data` | `model.key is not None` |
| Type conversion | `str(data['key'])` | `str(model.key)` |

## Files Changed

- `apistreamhub-fastapi/app/api/playlists.py`
  - Function: `insert_playlist_items()`
  - Lines 218-241: Changed from dict.get() to attribute access
  - Added type conversion: str() and int()

---
**Status:** ✅ FIXED
**Date:** 2026-03-02 17:12
**Deployed:** apistreamhub-api:pydantic-fix
**Commit:** e0f3e81
**Previous Fixes:**
  - 853eea1 (backend item processing)
  - 752f59f (media_id string conversion)
  - 2c84bc1 (duration integer conversion)
