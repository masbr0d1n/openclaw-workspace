# BUTTON TEXT FIX - UPDATE DRAFT VS SAVE DRAFT

## Problem Statement

**User Issue:** "Ada issue duplikat ketika edit draft lalu klik Save Draft button. Ganti 'Save Draft' menjadi 'Update Draft' JIKA kondisinya Edit draft sehingga tidak ambigu fungsi dan mengakibatkan duplikat draft dengan nama draft yang sama."

**Translation:** There's a duplicate issue when editing a draft and clicking the Save Draft button. Change 'Save Draft' to 'Update Draft' IF the condition is Edit draft so the function is not ambiguous and doesn't result in duplicate drafts with the same name.

**Core Problem:**
- Button text was always "Save Draft" regardless of context
- Users couldn't tell if it would CREATE new or UPDATE existing
- Ambiguity led to confusion and accidental duplicates

## Root Cause

**Original Code (BEFORE):**
```tsx
<button onClick={handleSaveDraft}>
  <Save className="w-4 h-4" />
  Save Draft  {/* ← Always shows "Save Draft" */}
</button>
```

**Problem:**
- Creating new playlist → Button says "Save Draft"
- Editing existing draft → Button says "Save Draft" (same text!)
- User expectation: "Save Draft" means create new
- Actual behavior (when editing): Uses PUT to update existing
- Result: Confusion about what the button does

## Solution

**Updated Code (AFTER):**
```tsx
<button onClick={handleSaveDraft}>
  <Save className="w-4 h-4" />
  {editingPlaylistId ? 'Update Draft' : 'Save Draft'}
</button>
```

**Logic:**
- `editingPlaylistId` is null (creating new) → Show "Save Draft"
- `editingPlaylistId` has value (editing existing) → Show "Update Draft"

## Implementation

### File Modified

**Path:** `/streamhub-nextjs/src/app/dashboard/content/components/playlists-content.tsx`
**Line:** 798

### Change Details

```diff
<button
  onClick={handleSaveDraft}
  className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
>
  <Save className="w-4 h-4" />
-  Save Draft
+  {editingPlaylistId ? 'Update Draft' : 'Save Draft'}
</button>
```

### Deployment

**Frontend Build:**
```bash
cd /home/sysop/.openclaw/workspace/streamhub-nextjs
npm run build
```

**Build Output:**
```
✓ Compiled successfully in 13.9s
```

**Docker Deployment:**
```bash
docker stop streamhub-test
docker rm streamhub-test
docker build -t streamhub-frontend:button-text-fix .
docker run -d --name streamhub-test -p 3000:3000 streamhub-frontend:button-text-fix
```

**Deployment Details:**
- **Image:** streamhub-frontend:button-text-fix (7deeaefe7e27)
- **Container:** streamhub-test
- **Status:** Running ✅
- **Port:** 3000

### Git Commit

**Commit Hash:** 1ddeb8a
**Message:** fix: button text shows Update Draft when editing, Save Draft when creating
**Files Changed:** 1 file, 1 insertion(+), 1 deletion(-)
**Branch:** master
**Remote:** forgejo/master ✅

## Behavior After Fix

### Button Text Context

| Context | State | Button Text | HTTP Method | Expected Behavior |
|---------|-------|-------------|-------------|-------------------|
| Create new playlist | `editingPlaylistId = null` | **Save Draft** | POST | Creates new draft ✅ |
| Edit existing draft | `editingPlaylistId = "abc-123"` | **Update Draft** | PUT | Updates existing draft ✅ |

### User Experience Flow

**Creating New Playlist:**
1. Click "Create Playlist" button
2. Modal opens with empty form
3. Add media items to timeline
4. Button shows: **"Save Draft"** ✅
5. Click "Save Draft"
6. Result: New draft created
7. Success message: "Draft saved successfully!"

**Editing Existing Draft:**
1. Click "Edit" on existing draft
2. Modal opens with draft data loaded
3. State: `editingPlaylistId = "draft-id"`
4. Button shows: **"Update Draft"** ✅
5. Modify items, change name, etc.
6. Click "Update Draft"
7. Result: Same draft updated (no duplicate)
8. Success message: "Draft updated successfully!"

## Related Fixes

This is the **3rd fix** in the playlist draft series:

1. **Part 1-5:** Items not saving, type validation, schema mismatch
2. **Part 6:** Edit draft creates new (PUT endpoint + smart save logic)
3. **Part 7:** Duration precision (NUMERIC(10,2) + removed Math.round())
4. **Part 8:** Button text ambiguity (**THIS FIX**)

## Testing Instructions

### Prerequisites
- Hard refresh browser: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- Or clear browser cache

### Test 1: Create New Playlist

**Steps:**
1. Navigate to http://100.74.116.116:3000/dashboard/content
2. Click "Create Playlist" button
3. Expected: Modal opens with empty form
4. Expected: Button text is **"Save Draft"** ✅
5. Add some media items
6. Click "Save Draft"
7. Expected: Success message "Draft saved successfully!"
8. Expected: New draft appears in list

### Test 2: Edit Draft

**Steps:**
1. Find an existing draft in the list
2. Click "Edit" button
3. Expected: Modal opens with draft data
4. Expected: Button text is **"Update Draft"** ✅
5. Modify the playlist (add/remove items, change name)
6. Click "Update Draft"
7. Expected: Success message "Draft updated successfully!"
8. Expected: Same draft is updated (NOT duplicated)
9. Verify: Only 1 draft with that name exists

### Test 3: Verify No Duplicates

**Steps:**
1. Create draft → Name "Test Draft 1"
2. Click "Edit" on "Test Draft 1"
3. Modify → Click "Update Draft"
4. Expected: Still only 1 draft named "Test Draft 1" ✅
5. Expected: Changes reflected in the same draft ✅

## Common Questions

**Q: Why not just change the HTTP method without changing button text?**
A: Users don't see HTTP methods. They see button text. The text must match the action.

**Q: What if I edit a draft but want to save as a new draft?**
A: This feature is for updating existing drafts. "Save As" functionality could be added in the future.

**Q: Does this fix the duplicate issue completely?**
A: Yes, combined with the PUT endpoint fix (Part 6), editing a draft now updates it instead of creating a new one.

**Q: What happens if I click "Update Draft" on a published playlist?**
A: The button only appears for draft playlists (`is_published = false`). Published playlists use "Publish" button.

## Technical Details

### State Management

**State Variable:** `editingPlaylistId`
- Type: `string | null`
- Default: `null`
- Set when: User clicks "Edit" on existing draft
- Cleared when: User clicks "Create Playlist" or after successful update

### Component Lifecycle

```tsx
// When user clicks "Edit"
const handleEdit = (playlistId: string) => {
  setEditingPlaylistId(playlistId);  // ← Sets the ID
  loadPlaylistData(playlistId);
  setShowPlaylistModal(true);
};

// When user clicks "Create Playlist"
const handleCreatePlaylist = () => {
  setEditingPlaylistId(null);  // ← Clears the ID
  setPlaylistItems([]);
  setProperties({ ...defaultProperties });
  setShowPlaylistModal(true);
};

// When saving
const handleSaveDraft = async () => {
  const isEditing = editingPlaylistId !== null;
  const url = isEditing ? `/api/playlists/${editingPlaylistId}` : '/api/playlists';
  const method = isEditing ? 'PUT' : 'POST';

  // ... fetch with url and method
};
```

## Lessons Learned

1. **User Interface Matters:** Button text must clearly indicate what will happen
2. **Context-Aware UI:** Same button can have different text based on context
3. **User Expectations:** "Save" typically means create new, "Update" means modify existing
4. **Reduced Ambiguity:** Clear button text reduces user errors and confusion
5. **State-Driven UI:** Component state (`editingPlaylistId`) drives button appearance

## Quick Reference

| State | Button Text | Action |
|-------|-------------|--------|
| `editingPlaylistId = null` | Save Draft | POST /api/playlists |
| `editingPlaylistId = "abc-123"` | Update Draft | PUT /api/playlists/abc-123 |

## Files Changed

### Frontend
- `src/app/dashboard/content/components/playlists-content.tsx` (line 798)
  - Changed: Button text from static "Save Draft" to conditional

### Backend
- No changes needed (PUT endpoint already implemented in Part 6)

### Database
- No changes needed

---
**Status:** ✅ FIXED
**Date:** 2026-03-02 20:17
**Deployed:** streamhub-frontend:button-text-fix (7deeaefe7e27)
**Commit:** 1ddeb8a
**Issue:** Ambiguous "Save Draft" button text causing confusion
**Solution:** Conditional button text based on editingPlaylistId state
