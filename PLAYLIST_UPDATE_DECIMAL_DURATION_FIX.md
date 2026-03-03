# PLAYLIST UPDATE & DECIMAL DURATION FIX

## Problem Statements

**Issue 1:** "Ketika edit draft, setelah disimpan atau Save Draft menjadi membuat draft baru, seharusnya 1 draft yang berubah"
- **Translation:** When editing a draft and clicking Save Draft, it creates a NEW draft instead of updating the existing one
- **Expected:** Should update the existing draft, not create a duplicate

**Issue 2:** "Untuk durasi kembali detail nilainya"
- **Translation:** Duration should return to detailed/precise values
- **Problem:** Duration was being rounded to integers (143s instead of 142.84s)
- **Expected:** Preserve decimal precision in duration values

## Root Cause Analysis

### Issue 1: Always POST, Never PUT

**Frontend Code (BEFORE):**
```typescript
const handleSaveDraft = async () => {
  const response = await fetch('/api/playlists', {
    method: 'POST',  // ← Always POST!
    body: JSON.stringify({
      ...properties,
      items: playlistItems,
      draft: true,
    }),
  });
};
```

**Problem:**
- When editing existing draft (`editingPlaylistId` is set)
- Code still uses POST to create new playlist
- Result: Creates duplicate draft instead of updating existing one

**Missing Backend Feature:**
- Backend had no PUT endpoint to update existing playlists
- Only had GET, POST, DELETE endpoints

### Issue 2: Duration Rounding

**Frontend Code (BEFORE):**
```typescript
duration: Math.round(media.duration || properties.defaultDuration)
```

**Problem:**
- `Math.round()` converts 142.84 → 143
- Database column was INTEGER (cannot store decimals)
- Duration precision lost in both frontend display and database storage

**Database Schema (BEFORE):**
```sql
CREATE TABLE playlist_items (
    duration INTEGER NOT NULL  -- ← Cannot store decimals!
);
```

## Solution

### Fix 1: Smart Save Draft (PUT vs POST)

**Frontend Changes:**

**File:** `/streamhub-nextjs/src/app/dashboard/content/components/playlists-content.tsx`

**Function:** `handleSaveDraft()`

```typescript
// BEFORE:
const handleSaveDraft = async () => {
  const response = await fetch('/api/playlists', {
    method: 'POST',  // Always POST
    ...
  });
  alert('Draft saved successfully!');
};

// AFTER:
const handleSaveDraft = async () => {
  // Check if editing existing draft or creating new one
  const isEditing = editingPlaylistId !== null;
  const url = isEditing ? `/api/playlists/${editingPlaylistId}` : '/api/playlists';
  const method = isEditing ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,  // PUT for update, POST for create
    ...
  });
  
  alert(isEditing ? 'Draft updated successfully!' : 'Draft saved successfully!');
  setEditingPlaylistId(null);  // Clear editing state
};
```

**Backend Changes:**

**File:** `/apistreamhub-fastapi/app/api/playlists.py`

**Added PUT Endpoint:**
```python
@router.put("/{playlist_id}", response_model=PlaylistResponse)
async def update_playlist(
    playlist_id: str,
    playlist: PlaylistCreate,
    db: AsyncSession = Depends(get_db),
):
    """Update existing playlist and replace all items"""
    # 1. Update playlist properties
    update_query = text("""
        UPDATE playlists
        SET name = :name,
            description = :description,
            default_duration = :default_duration,
            transition = :transition,
            loop = :loop,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :playlist_id
        RETURNING ...
    """)
    
    # 2. Delete existing items
    await db.execute(
        text("DELETE FROM playlist_items WHERE playlist_id = :playlist_id"),
        {"playlist_id": playlist_id}
    )
    
    # 3. Insert new items
    items_count, total_duration = await insert_playlist_items(
        playlist_id, playlist.items, db
    )
    
    # 4. Update stats
    await db.execute(
        text("""UPDATE playlists
                SET items_count = :items_count,
                    total_duration = :total_duration
                WHERE id = :playlist_id"""),
        {"playlist_id": playlist_id, "items_count": items_count, "total_duration": total_duration}
    )
    
    await db.commit()
    return PlaylistResponse(...)
```

### Fix 2: Decimal Duration Precision

**Database Migration:**

```sql
-- Change duration column from INTEGER to NUMERIC(10,2)
ALTER TABLE playlist_items
ALTER COLUMN duration TYPE NUMERIC(10,2);
```

**Why NUMERIC(10,2)?**
- 10 digits total (up to 99,999,999.99 seconds = ~1,157 days)
- 2 digits after decimal (centisecond precision)
- Example: 142.84, 10.50, 3600.00

**Frontend Changes:**

**Removed Math.round():**
```typescript
// BEFORE:
duration: Math.round(media.duration || properties.defaultDuration)

// AFTER:
duration: media.duration || properties.defaultDuration
```

**Locations:**
- Line 251: Drag & drop to timeline
- Line 316: Add selected media

**Backend Changes:**

**Schema Update:**
```python
# BEFORE:
class PlaylistItemCreateSimple(BaseModel):
    duration: int  # ← Integer only

# AFTER:
class PlaylistItemCreateSimple(BaseModel):
    duration: float  # ← Supports decimals
```

**insert_playlist_items() Update:**
```python
# BEFORE:
item_duration = int(item.duration) if item.duration else 10

# AFTER:
item_duration = float(item.duration) if item.duration else 10.0
```

## Deployment

### Database Migration
```bash
docker exec apistreamhub-db psql -U postgres -d apistreamhub -c "
ALTER TABLE playlist_items
ALTER COLUMN duration TYPE NUMERIC(10,2);
"
```

### Backend Build
```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi
docker build -t apistreamhub-api:update-fix .
docker stop apistreamhub-api && docker rm apistreamhub-api
docker run -d --name apistreamhub-api \
  -p 8001:8000 \
  -e DATABASE_URL=postgresql+asyncpg://postgres:postgres@172.17.0.3:5432/apistreamhub \
  -e BACKEND_CORS_ORIGINS=http://localhost:3000,http://192.168.8.117:3000,http://100.74.116.116:3000 \
  --restart unless-stopped \
  apistreamhub-api:update-fix
```

### Deployment Details
- **Backend Image:** `apistreamhub-api:update-fix` (41bab0113d3c)
- **Backend Status:** Healthy ✅
- **Frontend Image:** `streamhub-frontend:update-fix` (3018283ee8e4)
- **Frontend Status:** Running ✅

### Git Commits
- **Backend:** Added PUT endpoint and float support
- **Frontend:** Smart Save Draft and decimal duration
- **Branch:** master
- **Remote:** Forgejo

## Test Results

### Test 1: Update Draft

**Before Fix:**
```
1. Create draft → Saved (ID: abc-123)
2. Edit draft → Modify → Save Draft
3. Result: NEW draft created (ID: def-456) ❌
4. Total drafts: 2 (should be 1)
```

**After Fix:**
```
1. Create draft → Saved (ID: abc-123)
2. Edit draft → Modify → Save Draft
3. Result: SAME draft updated (ID: abc-123) ✅
4. Total drafts: 1 ✅
5. Success message: "Draft updated successfully!"
```

### Test 2: Decimal Duration

**Before Fix:**
```
1. Add video with duration 142.84s
2. Save draft
3. Database: duration = 143 ❌
4. Display: "143s" or "2m 23s" ❌
```

**After Fix:**
```
1. Add video with duration 142.84s
2. Save draft
3. Database: duration = 142.84 ✅
4. Display: "142.84s" or "2m 22.84s" ✅
5. Edit draft → Duration preserved exactly ✅
```

## Behavior Changes

### Save Draft Logic

| Context | Before | After |
|---------|--------|-------|
| New draft | POST → Create | POST → Create ✅ |
| Edit draft | POST → Create NEW ❌ | PUT → Update existing ✅ |
| Success message | "Draft saved!" | "Draft saved!" or "Draft updated!" |

### Duration Handling

| Stage | Before | After |
|-------|--------|-------|
| Frontend | Math.round() to integer | Keep as-is (float) |
| Backend API | int validation | float validation |
| Database | INTEGER column | NUMERIC(10,2) |
| Storage | 143 (rounded) | 142.84 (precise) |
| Display | "143s" | "142.84s" |

## Related Issues

This is part of the "empty timeline when editing drafts" issue series:
- **Part 1-5:** Previous fixes (items not saving, type validation, schema mismatch)
- **Part 6:** Edit draft creates new (commit - backend PUT + frontend logic) ← **THIS**
- **Part 7:** Duration precision (commit - database + frontend + backend) ← **THIS**

## Lessons Learned

1. **RESTful API design:** PUT for updates, POST for creates
2. **State tracking:** Check `editingPlaylistId` to determine intent
3. **Precision matters:** Don't round unless necessary
4. **Database types:** Use NUMERIC/DECIMAL for decimal values, not INTEGER
5. **User expectations:** "Update" should modify, not duplicate

## Quick Reference

| Operation | HTTP Method | URL | Behavior |
|-----------|-------------|-----|----------|
| Create draft | POST | /api/playlists | Creates new playlist |
| Update draft | PUT | /api/playlists/{id} | Updates existing playlist |
| Delete draft | DELETE | /api/playlists/{id} | Deletes playlist |
| Get draft | GET | /api/playlists/{id} | Fetches playlist with items |

| Data Type | Example | Database Type | Notes |
|-----------|---------|---------------|-------|
| Integer duration | 143 | INTEGER | ❌ Lost precision |
| Decimal duration | 142.84 | NUMERIC(10,2) | ✅ Preserves precision |

## Files Changed

### Backend
- `app/api/playlists.py`
  - Added: `update_playlist()` function with PUT endpoint
  - Changed: `PlaylistItemCreateSimple.duration: int → float`
  - Changed: `insert_playlist_items()`: `int() → float()`

### Frontend
- `src/app/dashboard/content/components/playlists-content.tsx`
  - Changed: `handleSaveDraft()` - Added isEditing check and conditional PUT/POST
  - Changed: Line 251 - Removed `Math.round()`
  - Changed: Line 316 - Removed `Math.round()`

### Database
- `playlist_items` table
  - Changed: `duration` column from INTEGER to NUMERIC(10,2)

---
**Status:** ✅ FIXED
**Date:** 2026-03-02 17:26
**Deployed:** 
  - Backend: apistreamhub-api:update-fix (41bab0113d3c)
  - Frontend: streamhub-frontend:update-fix (3018283ee8e4)
**Database:** Migrated to NUMERIC(10,2)
**Commits:** 
  - Backend: PUT endpoint + decimal duration support
  - Frontend: Smart Save Draft + decimal precision
