# VALIDATION ERROR: media_id TYPE MISMATCH

## Problem Statement

**User Report:**
"Masih failed: Ada response ini: {"detail":[{"type":"string_type","loc":["body","items",0,"media_id"],"msg":"Input should be a valid string","input":18},{"type":"string_type","loc":["body","items",1,"media_id"],"msg":"Input should be a valid string","input":16}]}"

**Translation:**
Still failing: Got this response when saving draft with items.

**Validation Error:**
```json
{
  "detail": [
    {
      "type": "string_type",
      "loc": ["body", "items", 0, "media_id"],
      "msg": "Input should be a valid string",
      "input": 18
    },
    {
      "type": "string_type",
      "loc": ["body", "items", 1, "media_id"],
      "msg": "Input should be a valid string",
      "input": 16
    }
  ]
}
```

## Root Cause Analysis

### Issue 1: Type Mismatch

**Backend Schema:**
```python
# File: apistreamhub-fastapi/app/schemas/playlist.py
class PlaylistItemCreateSimple(BaseModel):
    media_id: str  # ← Expects STRING
```

**Frontend Data:**
```typescript
// File: streamhub-nextjs/.../playlists-content.tsx
interface PlaylistItem {
  media_id: string;  // ← Type definition says string
}

// But actual data sent:
media_id: media.id,  // ← media.id is a NUMBER!
```

**What Happens:**
1. Database stores video IDs as `BIGINT` (numeric)
2. Frontend fetches media library: `media.id = 18` (number)
3. Frontend creates PlaylistItem: `media_id: media.id` → `media_id: 18` (number)
4. Frontend sends JSON: `{"items": [{"media_id": 18, ...}]}`
5. Backend Pydantic validates: `media_id` must be string
6. **Validation error!** ❌

### Issue 2: String Conversion Inconsistency

**Code locations where media_id is set:**
```typescript
// Line 196: ✅ Already converts to string
media_id: item.media_id || item.video_id?.toString() || '',

// Line 246: ❌ Missing conversion (THE BUG!)
media_id: media.id,

// Line 312: ✅ Already converts to string
media_id: String(media.id),

// Line 436: ✅ Already converts to string
media_id: item.media_id || item.video_id?.toString() || '',
```

**The Bug:**
Line 246 in `handleDropOnTimeline` function didn't convert `media.id` to string!

## Solution

### Fix Applied

**File:** `/streamhub-nextjs/src/app/dashboard/content/components/playlists-content.tsx`

**Before:**
```typescript
const newItem: PlaylistItem = {
  id: `item-${Date.now()}-${Math.random()}`,
  media_id: media.id,  // ← Number!
  name: media.title,
  duration: media.duration || properties.defaultDuration,
  order: playlistItems.length + 1,
  media_type: media.content_type || 'video',
};
```

**After:**
```typescript
const newItem: PlaylistItem = {
  id: `item-${Date.now()}-${Math.random()}`,
  media_id: String(media.id),  // ← String!
  name: media.title,
  duration: media.duration || properties.defaultDuration,
  order: playlistItems.length + 1,
  media_type: media.content_type || 'video',
};
```

### Why This Works

**Type Conversion:**
```javascript
media.id = 18 (number)
String(media.id) = "18" (string)
media.id.toString() = "18" (string)
```

**Backend Validation:**
```python
# Before fix:
media_id = 18  # Pydantic: ❌ "Input should be a valid string"

# After fix:
media_id = "18"  # Pydantic: ✅ Valid!
```

## Deployment

### Frontend Build
```bash
cd /home/sysop/.openclaw/workspace/streamhub-nextjs
npm run build  # ✓ 13.8s
docker build -t streamhub-frontend:draft-items-fix .
docker stop streamhub-test && docker rm streamhub-test
docker run -d --name streamhub-test \
  -p 3000:3000 \
  --restart unless-stopped \
  streamhub-frontend:draft-items-fix
```

### Deployment Details
- **Image:** `streamhub-frontend:draft-items-fix`
- **Container:** `144dfa0bd3c3`
- **Status:** Up ✅
- **Port:** 3000
- **Build Time:** 13.8s

### Git Commit
- **Commit:** 752f59f
- **Branch:** master
- **Remote:** Forgejo
- **Files Changed:** 1 file, 1 insertion(+), 1 deletion(-)

## Test Results

### Before Fix
```
POST /api/playlists
Request: {"items": [{"media_id": 18, ...}, {"media_id": 16, ...}]}
Response: 422 Validation Error
Error: "Input should be a valid string"
Result: Draft NOT saved ❌
```

### After Fix
```
POST /api/playlists
Request: {"items": [{"media_id": "18", ...}, {"media_id": "16", ...}]}
Response: 201 Created
Result: Draft saved with items ✅
Database: playlist_items table populated ✅
Edit: Timeline shows all items ✅
```

### Expected Behavior

1. **Create Playlist:**
   - Drag items from media library to timeline
   - Items added to playlist state

2. **Save Draft:**
   - Click "Save Draft"
   - Frontend sends: `{"items": [{"media_id": "18", ...}, ...]}`
   - Backend validates: ✅ All media_id are strings
   - Backend saves: ✅ Playlist + items to database

3. **Edit Draft:**
   - Click "Edit" button
   - Frontend loads items from `/api/playlists/{id}`
   - Timeline shows all items ✅

## Related Issues

This is the second part of the "empty timeline when editing drafts" issue:
- **Part 1:** Backend not saving items (fixed in commit 853eea1)
- **Part 2:** Frontend sending wrong type (fixed in commit 752f59f)

## Lessons Learned

1. **Type consistency matters** - Database types (BIGINT) don't always match API types (string)
2. **Validate at boundaries** - Convert types when data crosses system boundaries
3. **Check all code paths** - Some places had `String()`, one place didn't
4. **Test with real data** - Mock data might not reveal type mismatches

## Files Changed

### Frontend
- `streamhub-nextjs/src/app/dashboard/content/components/playlists-content.tsx`
  - Line 246: Added `String()` conversion for media_id

### Backend (Previous Fix)
- `apistreamhub-fastapi/app/schemas/playlist.py`
  - Added `items` field to `PlaylistCreate`
- `apistreamhub-fastapi/app/api/playlists.py`
  - Added `insert_playlist_items()` helper
  - Updated draft/publish endpoints

---
**Status:** ✅ FIXED
**Date:** 2026-03-02 17:01
**Deployed:** streamhub-frontend:draft-items-fix
**Commit:** 752f59f
**Previous Fix:** 853eea1 (backend item processing)
