# VALIDATION ERROR: DURATION TYPE MISMATCH

## Problem Statement

**User Report:**
"error terbaru di response: {"detail":[{"type":"int_from_float","loc":["body","items",1,"duration"],"msg":"Input should be a valid integer, got a number with a fractional part","input":142.84}]}"

**Translation:**
Latest error in response: Duration validation error.

**Validation Error:**
```json
{
  "detail": [
    {
      "type": "int_from_float",
      "loc": ["body", "items", 1, "duration"],
      "msg": "Input should be a valid integer, got a number with a fractional part",
      "input": 142.84
    }
  ]
}
```

## Root Cause Analysis

### Type Mismatch

**Backend Schema:**
```python
# File: apistreamhub-fastapi/app/schemas/playlist.py
class PlaylistItemCreateSimple(BaseModel):
    duration: int  # ← Expects INTEGER
```

**Frontend Data:**
```typescript
// File: streamhub-nextjs/.../playlists-content.tsx
interface PlaylistItem {
  duration: number;  // ← Type is number (can be float or int)
}

// Actual data sent:
duration: media.duration,  // ← media.duration is a FLOAT!
```

**What Happens:**
1. Database stores video duration as `NUMERIC` or `FLOAT` (decimal)
2. Frontend fetches media library: `media.duration = 142.84` (float)
3. Frontend creates PlaylistItem: `duration: media.duration` → `duration: 142.84` (float)
4. Frontend sends JSON: `{"items": [{"duration": 142.84, ...}]}`
5. Backend Pydantic validates: `duration` must be integer
6. **Validation error!** ❌

### Why Duration is Float

Video durations are often stored as decimal numbers for precision:
- `142.84` seconds = 2 minutes 22.84 seconds
- `10.5` seconds = 10.5 seconds
- FFmpeg returns duration as floating point for accurate timing

## Solution

### Fix Applied

**File:** `/streamhub-nextjs/src/app/dashboard/content/components/playlists-content.tsx`

**Location 1: Line 250 (Drag & Drop to Timeline)**
```typescript
// Before:
const newItem: PlaylistItem = {
  id: `item-${Date.now()}-${Math.random()}`,
  media_id: String(media.id),
  name: media.title,
  duration: media.duration || properties.defaultDuration,  // ← Float!
  ...
};

// After:
const newItem: PlaylistItem = {
  id: `item-${Date.now()}-${Math.random()}`,
  media_id: String(media.id),
  name: media.title,
  duration: Math.round(media.duration || properties.defaultDuration),  // ← Integer!
  ...
};
```

**Location 2: Line 316 (Add Selected Media)**
```typescript
// Before:
newItems.push({
  id: `item-${Date.now()}-${Math.random()}`,
  media_id: String(media.id),
  name: media.title,
  duration: media.duration || properties.defaultDuration,  // ← Float!
  order: order++,
  ...
});

// After:
newItems.push({
  id: `item-${Date.now()}-${Math.random()}`,
  media_id: String(media.id),
  name: media.title,
  duration: Math.round(media.duration || properties.defaultDuration),  // ← Integer!
  order: order++,
  ...
});
```

### Why Math.round()

**Rounding vs Truncating:**

```javascript
Math.round(142.84)  // → 143 (nearest integer)
Math.round(142.24)  // → 142 (nearest integer)
Math.round(142.50)  // → 143 (rounds half up)

Math.floor(142.84)  // → 142 (always down)
Math.ceil(142.84)   // → 143 (always up)
Math.trunc(142.84)  // → 142 (removes decimal)
```

**Choosing Math.round():**
- Most accurate representation of duration
- 142.84s → 143s (only 0.16s error)
- 142.24s → 142s (only 0.24s error)
- User-friendly (rounds to nearest second)

### Type Safety

**TypeScript Interface:**
```typescript
interface PlaylistItem {
  duration: number;  // Can be float or int
}
```

**Backend Schema:**
```python
duration: int  # Must be integer
```

**Solution:** Convert at boundary (when creating item to send to API)

## Deployment

### Frontend Build
```bash
cd /home/sysop/.openclaw/workspace/streamhub-nextjs
npm run build  # ✓ 13.6s
docker build -t streamhub-frontend:duration-fix .
docker stop streamhub-test && docker rm streamhub-test
docker run -d --name streamhub-test \
  -p 3000:3000 \
  --restart unless-stopped \
  streamhub-frontend:duration-fix
```

### Deployment Details
- **Image:** `streamhub-frontend:duration-fix`
- **Container:** `d22bd4751e85`
- **Status:** Up ✅
- **Port:** 3000
- **Build Time:** 13.6s

### Git Commit
- **Commit:** 2c84bc1
- **Branch:** master
- **Remote:** Forgejo
- **Files Changed:** 1 file, 2 insertions(+), 2 deletions(-)

## Test Results

### Before Fix
```
POST /api/playlists
Request: {"items": [{"duration": 142.84, ...}]}
Response: 422 Validation Error
Error: "Input should be a valid integer, got a number with a fractional part"
Result: Draft NOT saved ❌
```

### After Fix
```
POST /api/playlists
Request: {"items": [{"duration": 143, ...}]}  // ← Rounded!
Response: 201 Created
Result: Draft saved with items ✅
Database: playlist_items table populated with duration: 143 ✅
Edit: Timeline shows items with rounded duration ✅
```

### Examples of Rounding

| Original Duration | Rounded Duration | Difference |
|-------------------|------------------|------------|
| 142.84s | 143s | +0.16s |
| 142.24s | 142s | -0.24s |
| 10.50s | 11s | +0.50s |
| 10.00s | 10s | 0s |
| 10s (default) | 10s | 0s |

## Related Issues

This is the third part of the "empty timeline when editing drafts" issue series:
- **Part 1:** Backend not saving items (commit 853eea1)
- **Part 2:** Frontend sending media_id as number (commit 752f59f)
- **Part 3:** Frontend sending duration as float (commit 2c84bc1) ← **THIS**

## Lessons Learned

1. **Database types don't match API types** - NUMERIC/FLOAT in DB, int in API
2. **Convert at boundaries** - Transform data when crossing system boundaries
3. **Use Math.round() for duration** - Most user-friendly rounding
4. **Check all code paths** - Found 2 locations creating items from media library

## Files Changed

### Frontend
- `streamhub-nextjs/src/app/dashboard/content/components/playlists-content.tsx`
  - Line 250: Added `Math.round()` for duration (drag & drop)
  - Line 316: Added `Math.round()` for duration (selected media)

### Backend (Previous Fixes)
- `apistreamhub-fastapi/app/schemas/playlist.py`
  - Added `items` field to `PlaylistCreate`
- `apistreamhub-fastapi/app/api/playlists.py`
  - Added `insert_playlist_items()` helper
  - Updated draft/publish endpoints

---
**Status:** ✅ FIXED
**Date:** 2026-03-02 17:07
**Deployed:** streamhub-frontend:duration-fix
**Commit:** 2c84bc1
**Previous Fixes:**
  - 853eea1 (backend item processing)
  - 752f59f (media_id string conversion)
