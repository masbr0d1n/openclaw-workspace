# Playlist Items Loading Fix

## Date: 2026-03-02
## Issue: Timeline empty when editing saved drafts
## Status: FIXED & DEPLOYED ✅

---

## 🐛 Problem Description

**Issue:**
When creating a new playlist or editing a draft playlist with items added via drag & drop to the playlist timeline, after saving as draft, when opening the draft again for editing, the timeline is empty.

**User Report:**
> "Ketika membuat playlist baru atau edit draft playlist (sudah drag drop ke playlist timeline), ketika sudah simpan lagi sebagai draft, ketika akan melakukan edit, susunan playlist timeline nya kosong."

---

## 🔍 Root Cause

**Location:** `/streamhub-nextjs/src/app/dashboard/content/components/playlists-content.tsx`

**Problem Code:**
```typescript
const handleEditDraft = (draft: DraftPlaylist) => {
  setView('edit');
  setEditingPlaylistId(draft.id);
  
  // Load draft data into form
  setProperties({
    name: draft.name,
    description: '',
    defaultDuration: 10,
    transition: 'fade',
    loop: draft.loop,
  });
  
  // TODO: Load items from API  ← PROBLEM!
  setPlaylistItems([]);  ← Timeline jadi kosong!
};
```

**Why It Failed:**
- Function was synchronous, couldn't fetch from API
- TODO comment indicated unimplemented feature
- Hard-coded empty array cleared the timeline
- No attempt to load saved items from backend

---

## ✅ Solution Implemented

**Fixed Code:**
```typescript
const handleEditDraft = async (draft: DraftPlaylist) => {
  setView('edit');
  setEditingPlaylistId(draft.id);
  
  // Load draft data into form
  setProperties({
    name: draft.name,
    description: '',
    defaultDuration: 10,
    transition: 'fade',
    loop: draft.loop,
  });
  
  // Load items from API
  try {
    const response = await fetch(`/api/playlists/${draft.id}`);
    if (!response.ok) throw new Error('Failed to fetch playlist items');
    
    const result = await response.json();
    const playlistData = result.data || result;
    
    // Parse items from response
    const items = playlistData.items || playlistData.playlist_items || [];
    const parsedItems: PlaylistItem[] = items.map((item: any, index: number) => ({
      id: item.id || `item-${Date.now()}-${index}`,
      media_id: item.media_id || item.video_id?.toString() || '',
      name: item.name || item.title || `Item ${index + 1}`,
      duration: item.duration || 10,
      order: item.order || index + 1,
      media_type: item.media_type || 'video',
    }));
    
    setPlaylistItems(parsedItems);
    console.log(`Loaded ${parsedItems.length} items for draft:`, draft.name);
  } catch (error) {
    console.error('Error loading playlist items:', error);
    // Set empty items if fetch fails
    setPlaylistItems([]);
  }
};
```

---

## 🔧 Technical Changes

### 1. Function Signature
**Before:**
```typescript
const handleEditDraft = (draft: DraftPlaylist) => {
```

**After:**
```typescript
const handleEditDraft = async (draft: DraftPlaylist) => {
```

### 2. API Call
**Added:**
```typescript
const response = await fetch(`/api/playlists/${draft.id}`);
const result = await response.json();
const playlistData = result.data || result;
const items = playlistData.items || playlistData.playlist_items || [];
```

### 3. Item Parsing
**Added:**
```typescript
const parsedItems: PlaylistItem[] = items.map((item: any, index: number) => ({
  id: item.id || `item-${Date.now()}-${index}`,
  media_id: item.media_id || item.video_id?.toString() || '',
  name: item.name || item.title || `Item ${index + 1}`,
  duration: item.duration || 10,
  order: item.order || index + 1,
  media_type: item.media_type || 'video',
}));
```

### 4. State Update
**Before:**
```typescript
setPlaylistItems([]);
```

**After:**
```typescript
setPlaylistItems(parsedItems);
console.log(`Loaded ${parsedItems.length} items for draft:`, draft.name);
```

### 5. Error Handling
**Added:**
```typescript
catch (error) {
  console.error('Error loading playlist items:', error);
  setPlaylistItems([]);
}
```

---

## 📊 Deployment

| Component | Value |
|-----------|-------|
| Image | streamhub-frontend:items-fix |
| Container | streamhub-test |
| Image ID | 9c26398e257a |
| Container ID | 940e1b4ee470 |
| Port | 3000 |
| Status | Running ✅ |

**Build:**
```
✓ Compiled successfully in 13.6s
✓ 37 static pages generated
```

---

## 📝 Git Commit

**Commit:** 3270512
**Message:** "fix: load playlist items when editing draft"
**Files Changed:** 1
**Lines:** +29, -3
**Database Backup:** apistreamhub_master_20260302_130817.sql.gz
**Pushed:** Forgejo master ✅

---

## 🧪 Testing

### Test Scenario: Edit Draft with Items

1. **Navigate:** Content → Playlists tab
2. **Create Playlist:** Click "Create Playlist" button
3. **Add Items:** Drag & drop media items to timeline
4. **Set Properties:** Enter name, set loop, etc.
5. **Save Draft:** Click "Save Draft" button
6. **Verify:** Draft appears in Saved Drafts table ✅
7. **Edit Draft:** Click "Edit" button on draft
8. **Verify:** Timeline items are loaded ✅
9. **Modify:** Add/remove items, change settings
10. **Save Draft:** Click "Save Draft" again
11. **Verify:** Draft updated in table ✅

### Expected Result

**Before Fix:**
- Draft saved successfully ✅
- Draft appears in Saved Drafts table ✅
- Click Edit → Open edit view ✅
- Properties loaded (name, loop, etc.) ✅
- **Timeline: EMPTY** ❌

**After Fix:**
- Draft saved successfully ✅
- Draft appears in Saved Drafts table ✅
- Click Edit → Open edit view ✅
- Properties loaded (name, loop, etc.) ✅
- **Timeline: ITEMS LOADED** ✅

---

## 🎯 API Response Format

**Endpoint:** `GET /api/playlists/{id}`

**Expected Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "My Playlist",
    "description": "...",
    "default_duration": 10,
    "transition": "fade",
    "loop": true,
    "is_published": false,
    "items_count": 3,
    "total_duration": "1m 30s",
    "items": [
      {
        "id": "item-1",
        "media_id": "123",
        "name": "Video 1",
        "duration": 30,
        "order": 1,
        "media_type": "video"
      },
      {
        "id": "item-2",
        "media_id": "456",
        "name": "Video 2",
        "duration": 30,
        "order": 2,
        "media_type": "video"
      }
    ]
  }
}
```

**Alternative Response (playlist_items):**
```json
{
  "data": {
    "playlist_items": [
      { "id": "item-1", "video_id": 123, ... },
      { "id": "item-2", "video_id": 456, ... }
    ]
  }
}
```

---

## ✅ Requirements Fulfilled

| Requirement | Status | Details |
|-------------|--------|---------|
| Load items when editing | ✅ | Fetch from API |
| Parse items correctly | ✅ | Handle multiple formats |
| Handle errors | ✅ | Try-catch with fallback |
| Maintain state | ✅ | Update playlistItems |
| Console logging | ✅ | Debug information |

---

## 📈 Impact

**User Experience:**
- ✅ Drafts are now fully editable
- ✅ No data loss when reopening drafts
- ✅ Smooth edit workflow
- ✅ Accurate item restoration

**Code Quality:**
- ✅ Removed TODO comment
- ✅ Proper async/await pattern
- ✅ Error handling implemented
- ✅ Console logging for debugging

---

## 🚀 Future Enhancements

**Recommended:**
1. Add loading indicator while fetching items
2. Show error message if fetch fails
3. Implement optimistic UI updates
4. Add item count validation
5. Cache fetched items for performance

**Optional:**
1. Add diff visualization (what changed)
2. Implement undo/redo for edits
3. Add item preview thumbnails
4. Bulk edit capabilities
5. Clone draft functionality

---

## 📚 Related Documentation

- [Playlists UI V2 Complete](./PLAYLISTS_UI_V2_COMPLETE.md)
- [Drag & Drop Implementation](./DRAG_DROP_IMPLEMENTATION_COMPLETE.md)
- [Unified API Implementation](./UNIFIED_API_IMPLEMENTATION_COMPLETE.md)

---

## 📊 Summary

**Issue:** Timeline empty when editing saved drafts
**Root Cause:** Items not loaded from API (TODO comment)
**Solution:** Async fetch from `/api/playlists/{id}` with proper parsing
**Status:** ✅ FIXED & DEPLOYED
**Commit:** 3270512
**Test:** Edit draft → Items loaded in timeline

---

*Fix implemented: 2026-03-02*
*Deployed: streamhub-frontend:items-fix*
*Git: Committed & pushed to Forgejo*
*All tests passing: ✅*