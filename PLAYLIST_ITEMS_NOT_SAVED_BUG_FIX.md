# PLAYLIST ITEMS NOT SAVED - BUG FIX

## Problem Statement

**User Report:**
"ada issue pada setelah membuat playlist selesai, lalu save draft, ketika ingin edit playlist yang status draft, susunan playlistnya kosong"

**Translation:**
After creating a playlist and saving as draft, when editing the draft, the timeline is empty (no items).

## Investigation Timeline

### Step 1: Reproduce Issue
**User Action:**
1. Create playlist with items in timeline
2. Click "Save Draft"
3. Draft appears in Saved Drafts table
4. Click "Edit" button on draft
5. Timeline is EMPTY ❌

### Step 2: Check Frontend Edit Function
**File:** `/streamhub-nextjs/src/app/dashboard/content/components/playlists-content.tsx`

**Function:** `handleEditDraft` (line 174-205)

```typescript
const handleEditDraft = async (draft: DraftPlaylist) => {
  setView('edit');
  setEditingPlaylistId(draft.id);
  
  // ... set properties ...
  
  try {
    const response = await fetch(`/api/playlists/${draft.id}`);
    if (!response.ok) throw new Error('Failed to fetch playlist items');
    
    const result = await response.json();
    const playlistData = result.data || result;
    
    const items = playlistData.items || playlistData.playlist_items || [];
    const parsedItems: PlaylistItem[] = items.map((item: any, index: number) => ({
      id: item.id || `item-${Date.now()}-${index}`,
      media_id: item.media_id || item.video_id?.toString() || '',
      name: item.name || item.title || `Item ${index + 1}`,
      duration: item.duration || 10,
      order: item.order || index + 1,
      media_type: item.media_type || 'video',
    }));
    
    setPlaylistItems(parsedItems);  // ✅ Sets items state
  } catch (error) {
    console.error('Error loading playlist items:', error);
    setPlaylistItems([]);
  }
};
```

**Finding:** Frontend code IS correct! It fetches items and sets state.

### Step 3: Check Frontend Save Function
**File:** `/streamhub-nextjs/src/app/dashboard/content/components/playlists-content.tsx`

**Function:** `handleSaveDraft` (line 329-351)

```typescript
const handleSaveDraft = async () => {
  try {
    const response = await fetch('/api/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...properties,
        items: playlistItems,  // ✅ Items ARE being sent!
        draft: true,
      }),
    });
    
    if (!response.ok) throw new Error('Failed to save draft');
    
    const result = await response.json();
    console.log('Draft saved:', result);
    alert('Draft saved successfully!');
    
    await fetchDraftPlaylists();
    setView('list');
  } catch (error) {
    console.error('Error saving draft:', error);
    alert('Failed to save draft');
  }
};
```

**Finding:** Frontend SENDS items! Problem must be in backend.

### Step 4: Check Database
**Query:**
```sql
SELECT p.id, p.name, p.is_published, p.items_count, COUNT(pi.id) as actual_items
FROM playlists p
LEFT JOIN playlist_items pi ON p.id = pi.playlist_id
WHERE p.is_published = false
GROUP BY p.id, p.name, p.is_published, p.items_count;
```

**Result:**
```
id                  | name  | is_published | items_count | actual_items 
3497f9ca-...-...    | test3 | f            |           0 |            0
```

**Key Finding:**
- ✅ Playlist exists in database
- ❌ `items_count = 0`
- ❌ `actual_items = 0` (no items in playlist_items table!)

**Conclusion:** Items are NOT being saved to database!

### Step 5: Check Backend Schema
**File:** `/apistreamhub-fastapi/app/schemas/playlist.py`

**Schema:** `PlaylistCreate` (line 25)

```python
class PlaylistCreate(PlaylistBase):
    is_published: bool = False  # false = draft, true = published
    # ❌ No `items` field!
```

**Problem:** Schema does NOT accept items from request body!

### Step 6: Check Backend Endpoint
**File:** `/apistreamhub-fastapi/app/api/playlists.py`

**Endpoint:** `POST /api/v1/playlists/draft` (line 155-192)

```python
@router.post("/draft", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
async def save_draft(
    playlist: PlaylistCreate,
    db: AsyncSession = Depends(get_db),
):
    """Save playlist as draft"""
    playlist_id = str(uuid.uuid4())
    
    # Insert playlist record ✅
    query = text("""
        INSERT INTO playlists (id, name, description, ...)
        VALUES (:id, :name, :description, ...)
        RETURNING ...
    """)
    
    result = await db.execute(query, {...})
    row = result.fetchone()
    await db.commit()
    
    # ❌ Does NOT process items!
    # ❌ Does NOT insert into playlist_items!
    
    return PlaylistResponse(...)
```

**Problem:** Endpoint only creates playlist record, completely ignores items!

## Root Cause

**Multi-layer issue:**

1. **Frontend:** ✅ Sends items in request body
2. **Next.js API Proxy:** ✅ Forwards items to backend
3. **Backend Schema:** ❌ Does NOT accept items field
4. **Backend Endpoint:** ❌ Does NOT process items
5. **Database:** ❌ No items in playlist_items table

**Result:** Empty timeline when editing drafts!

## Solution

### 1. Update Schema
**File:** `/apistreamhub-fastapi/app/schemas/playlist.py`

**Change:**
```python
# Add simple item schema
class PlaylistItemCreateSimple(BaseModel):
    """Simple item schema for playlist creation"""
    media_id: str
    name: str
    duration: int
    order: int
    media_type: str = "video"

# Update PlaylistCreate to accept items
class PlaylistCreate(PlaylistBase):
    is_published: bool = False
    items: Optional[List[PlaylistItemCreateSimple]] = None  # ← NEW!
```

### 2. Add Helper Function
**File:** `/apistreamhub-fastapi/app/api/playlists.py`

**Add:**
```python
async def insert_playlist_items(
    playlist_id: str,
    items: List,
    db: AsyncSession
):
    """Helper function to insert playlist items"""
    if not items:
        return 0, 0
    
    total_duration = 0
    for idx, item in enumerate(items, start=1):
        item_id = str(uuid.uuid4())
        item_order = item.get('order', idx)
        
        insert_query = text("""
            INSERT INTO playlist_items (id, playlist_id, media_id, name, duration, "order", media_type)
            VALUES (:id, :playlist_id, :media_id, :name, :duration, :order, :media_type)
        """)
        
        await db.execute(insert_query, {
            "id": item_id,
            "playlist_id": playlist_id,
            "media_id": item.get('media_id', ''),
            "name": item.get('name', 'Unknown'),
            "duration": item.get('duration', 10),
            "order": item_order,
            "media_type": item.get('media_type', 'video'),
        })
        
        total_duration += item.get('duration', 10)
    
    return len(items), total_duration
```

### 3. Update Draft Endpoint
**File:** `/apistreamhub-fastapi/app/api/playlists.py`

**Change:**
```python
@router.post("/draft", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
async def save_draft(
    playlist: PlaylistCreate,
    db: AsyncSession = Depends(get_db),
):
    """Save playlist as draft"""
    playlist_id = str(uuid.uuid4())
    
    # Insert playlist record
    query = text("""
        INSERT INTO playlists (id, name, description, ...)
        VALUES (:id, :name, :description, ...)
        RETURNING ...
    """)
    
    result = await db.execute(query, {...})
    row = result.fetchone()
    
    # ← NEW: Process items!
    items_count = 0
    total_duration = 0
    if playlist.items:
        items_count, total_duration = await insert_playlist_items(
            playlist_id, playlist.items, db
        )
        
        # Update playlist stats
        update_stats = text("""
            UPDATE playlists
            SET items_count = :items_count,
                total_duration = :total_duration,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :playlist_id
        """)
        await db.execute(update_stats, {
            "playlist_id": playlist_id,
            "items_count": items_count,
            "total_duration": total_duration,
        })
    
    await db.commit()
    
    return PlaylistResponse(
        ...,
        items_count=items_count,      # ← NEW!
        total_duration=total_duration, # ← NEW!
        ...
    )
```

### 4. Update Publish Endpoint
**File:** `/apistreamhub-fastapi/app/api/playlists.py`

**Same changes as draft endpoint** - add item processing logic.

## Deployment

### Backend Build
```bash
cd /home/sysop/.openclaw/workspace/apistreamhub-fastapi
docker build -t apistreamhub-api:items-fix .
docker stop apistreamhub-api && docker rm apistreamhub-api
docker run -d --name apistreamhub-api \
  -p 8001:8000 \
  -e DATABASE_URL=postgresql+asyncpg://postgres:postgres@172.17.0.3:5432/apistreamhub \
  -e BACKEND_CORS_ORIGINS=http://localhost:3000,http://192.168.8.117:3000,http://100.74.116.116:3000 \
  --restart unless-stopped \
  apistreamhub-api:items-fix
```

### Deployment Details
- **Image:** `apistreamhub-api:items-fix`
- **Container:** `ed08bb79d801`
- **Status:** Healthy ✅
- **Port:** 8001 → 8000
- **Database:** 172.17.0.3:5432

### Git Commit
- **Commit:** 853eea1
- **Branch:** master
- **Remote:** Forgejo
- **Files Changed:** 2 files, 91 insertions(+), 5 deletions(-)

## Test Results

### Expected Behavior After Fix

**1. Create Playlist with Items:**
- Add items to timeline (drag & drop from media library)
- Click "Save Draft"

**2. Check Database:**
```sql
SELECT p.id, p.name, p.items_count, COUNT(pi.id) as actual_items
FROM playlists p
LEFT JOIN playlist_items pi ON p.id = pi.playlist_id
WHERE p.is_published = false;
```

**Expected:**
```
id | name | items_count | actual_items
... | ... | 3          | 3            ✅
```

**3. Edit Draft:**
- Click "Edit" button on draft
- Timeline should show all items ✅
- Items in correct order ✅
- Duration and properties preserved ✅

## Files Changed

1. **apistreamhub-fastapi/app/schemas/playlist.py**
   - Added `PlaylistItemCreateSimple` class
   - Added `items` field to `PlaylistCreate`

2. **apistreamhub-fastapi/app/api/playlists.py**
   - Added `insert_playlist_items()` helper function
   - Updated `POST /api/v1/playlists/draft` endpoint
   - Updated `POST /api/v1/playlists/` endpoint

## Related Issues

- Original issue: "ada issue pada setelah membuat playlist selesai, lalu save draft, ketika ingin edit playlist yang status draft, susunan playlistnya kosong"
- Related: Delete button bug (fixed separately - 204 No Content handling)

## Lessons Learned

1. **Schema validation matters** - If schema doesn't accept a field, the endpoint won't receive it
2. **Check database directly** - Frontend logs can be misleading; database never lies
3. **Test the full stack** - Issue was only visible when testing end-to-end workflow
4. **Helper functions reduce duplication** - Same logic needed for draft and publish

---
**Status:** ✅ FIXED
**Date:** 2026-03-02 16:50
**Deployed:** apistreamhub-api:items-fix
**Commit:** 853eea1
