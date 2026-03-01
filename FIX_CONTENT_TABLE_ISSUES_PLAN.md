# Fix Plan: Content Table Issues

## Issues to Fix

### 1. Missing Data in Table
- **Thumbnail not showing** - `thumbnail_data` not in API response
- **Category empty** - Not included in response (need to join with channel)
- **Expiry empty** - Not in API response schema
- **Tags empty** - Not in API response schema

### 2. Thumbnail Clickable
- Make thumbnail clickable to view video

### 3. Action Buttons
- Replace 3-dot menu with individual icon buttons:
  - 👁️ View (watch video)
  - ✏️ Edit
  - 🗑️ Delete
- Each button must have working API

## Backend Changes Needed

### Update VideoResponse Schema
```python
class VideoResponse(BaseModel):
    # ... existing fields ...
    
    # NEW FIELDS TO ADD:
    category: Optional[str] = None  # From channel relationship
    thumbnail_data: Optional[str] = None  # Base64 thumbnail
    tags: Optional[List[str]] = None  # Tags array
    expiry_date: Optional[date] = None  # Expiry date
    content_type: Optional[str] = None  # 'video' or 'image'
```

### Update Video Model to Include Category
- Add relationship property to get category from channel

### Ensure All Endpoints Return New Fields
- GET /api/v1/videos/
- GET /api/v1/videos/{id}

### Add Missing APIs (if needed)
- DELETE /api/v1/videos/{id} - Already exists ✅
- PUT/PATCH /api/v1/videos/{id} - Already exists ✅
- View endpoint - Can just open video_url in new tab

## Frontend Changes Needed

### Update Table Display
- Show category from response
- Show thumbnail_data properly
- Show tags as chips
- Show expiry_date formatted

### Make Thumbnail Clickable
```tsx
<img
  src={thumbnail_src}
  alt={video.title}
  className="w-16 h-9 object-cover rounded cursor-pointer hover:opacity-80"
  onClick={() => handleViewVideo(video)}
/>
```

### Replace Action Menu with Icon Buttons
```tsx
<div className="flex gap-1">
  <Button variant="ghost" size="icon" onClick={() => handleView(video)}>
    <Eye className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon" onClick={() => handleEdit(video)}>
    <Edit2 className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="icon" onClick={() => handleDelete(video)}>
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
```

### Add View Video Handler
```tsx
const handleViewVideo = (video: any) => {
  if (video.video_url) {
    window.open(`${BACKEND_URL}${video.video_url}`, '_blank');
  } else {
    toast.error('No video URL available');
  }
};
```

### Add Edit Handler
- Open edit dialog
- Pre-fill with existing data
- Call PUT /api/v1/videos/{id}

### Add Delete Handler
- Show confirmation dialog
- Call DELETE /api/v1/videos/{id}
- Refresh table after delete

## Puppeteer Test Plan

### Test 1: Verify Table Data
- Check thumbnail column has images
- Check category column shows values
- Check expiry column shows dates or "None"
- Check tags column shows chips or "-"

### Test 2: Verify Action Buttons
- Check View button exists and is clickable
- Check Edit button exists and is clickable
- Check Delete button exists and is clickable
- Verify no 3-dot menu

### Test 3: Verify Thumbnail Click
- Click thumbnail
- Verify video opens in new tab
- Check video is playable

### Test 4: Verify Delete Works
- Click Delete button
- Confirm dialog appears
- Confirm delete
- Verify row removed from table

## Order of Operations

1. ✅ Identify issues
2. Update backend schema (add fields)
3. Update backend video service (include category)
4. Update frontend table display
5. Add icon buttons
6. Make thumbnail clickable
7. Test with Puppeteer
8. Deploy
9. Verify in browser

## Current Status

Backend: Need to update VideoResponse schema
Frontend: Need to update table display and actions
Tests: Need to write Puppeteer test

---

**Starting implementation...**
