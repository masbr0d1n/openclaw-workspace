# Upload Content Feature - Complete Redesign

## Requirements

### 1. Rename & Expand Functionality
- **Old:** Upload Videos (video only)
- **New:** Upload Content (MP4, JPG, JPEG, PNG, BMP, GIF)
- Support: Videos and static images

### 2. Fix Issues

**Issue 1: Modal & Table**
- Modal doesn't close after successful upload
- Table doesn't refresh to show new content

**Issue 2: Duplicate Close Buttons**
- Remove one close button (keep only 1)

**Issue 3: Reset Button**
- Add button to reset form fields

**Issue 4: New Fields**
- Duration (auto-calculated for MP4)
- Expiry Date
- Tags (comma-separated or multi-select)

**Issue 5: Search Form Margin**
- Adjust margin for "Search videos..." form

**Issue 6: Table Redesign**
- New column structure
- Thumbnail, Name, Category, Type, Duration, Tags, Added, Expiry, Actions

## Implementation Plan

### Phase 1: Frontend Form Updates

#### File: `src/app/dashboard/content/page.tsx`

**Changes:**
1. Rename dialog title: "Upload Content"
2. Update file input accept: `video/*,image/*`
3. Add new state:
   - uploadDuration
   - uploadExpiryDate
   - uploadTags
4. Add new form fields
5. Add reset button
6. Remove duplicate close button
7. Fix modal close after upload
8. Fetch videos after upload

#### New Fields:
```tsx
// Duration (read-only, auto-calculated for videos)
<Input
  id="upload-duration"
  type="text"
  placeholder="Duration (auto-detected)"
  value={uploadDuration}
  readOnly
/>

// Expiry Date
<Input
  id="upload-expiry"
  type="date"
  value={uploadExpiryDate}
  onChange={(e) => setUploadExpiryDate(e.target.value)}
/>

// Tags
<Input
  id="upload-tags"
  type="text"
  placeholder="Tags (comma-separated)"
  value={uploadTags}
  onChange={(e) => setUploadTags(e.target.value)}
/>
```

### Phase 2: Duration Detection

```tsx
// Detect video duration when file selected
const handleFileSelect = async (file: File) => {
  setUploadFile(file);
  
  // Auto-fill title
  if (!uploadTitle) {
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
  }
  
  // Detect duration for video files
  if (file.type.startsWith('video/')) {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const duration = video.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      setUploadDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    
    video.src = URL.createObjectURL(file);
  } else {
    // For images, set duration to empty or "N/A"
    setUploadDuration('');
  }
};
```

### Phase 3: Table Redesign

**New Table Structure:**

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Thumbnail</TableHead>
      <TableHead>Name</TableHead>
      <TableHead>Category</TableHead>
      <TableHead>Type</TableHead>
      <TableHead>Duration</TableHead>
      <TableHead>Tags</TableHead>
      <TableHead>Added</TableHead>
      <TableHead>Expiry</TableHead>
      <TableHead className="w-[50px]"></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {filteredVideos.map((video) => (
      <TableRow key={video.id}>
        <TableCell>
          {video.thumbnail_data ? (
            <img
              src={`data:image/jpeg;base64,${video.thumbnail_data}`}
              alt={video.title}
              className="w-16 h-9 object-cover rounded"
            />
          ) : video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={video.title}
              className="w-16 h-9 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-9 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
              No img
            </div>
          )}
        </TableCell>
        <TableCell>
          <div className="font-medium">{video.title}</div>
          {video.description && (
            <div className="text-sm text-muted-foreground truncate max-w-md">
              {video.description}
            </div>
          )}
        </TableCell>
        <TableCell>{video.category || '-'}</TableCell>
        <TableCell>
          <span className={`px-2 py-1 rounded text-xs ${
            video.video_url 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {video.video_url ? 'Video' : 'Image'}
          </span>
        </TableCell>
        <TableCell>
          {video.duration 
            ? formatDuration(video.duration)
            : (video.video_url ? '-' : 'N/A')
          }
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {video.tags?.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                {tag}
              </span>
            )) || '-'}
          </div>
        </TableCell>
        <TableCell>{new Date(video.created_at).toLocaleDateString()}</TableCell>
        <TableCell>
          {video.expiry_date 
            ? new Date(video.expiry_date).toLocaleDateString()
            : 'None'
          }
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleEdit(video)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(video.id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Phase 4: Search Form Margin

```tsx
// Fix search form margin
<div className="flex gap-4 mb-6">
  <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input
      placeholder="Search videos..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-10"
    />
  </div>
  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
    <SelectTrigger className="w-[200px]">
      <Filter className="w-4 h-4 mr-2" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {categories.map((cat) => (
        <SelectItem key={cat.value} value={cat.value}>
          {cat.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

### Phase 5: Backend Updates

**Database Migration:**
```sql
ALTER TABLE videos ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE videos ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS content_type VARCHAR(10); -- 'video' or 'image'
```

**File Upload Handler:**
- Accept multiple file types
- Store content_type based on file
- Generate thumbnail for images
- Store tags as array
- Store expiry_date

## Implementation Order

1. ✅ Rename modal to "Upload Content"
2. ✅ Update file input for multiple types
3. ✅ Add new form fields (Duration, Expiry, Tags)
4. ✅ Add duration detection for videos
5. ✅ Add reset button
6. ✅ Fix modal close after upload
7. ✅ Refresh table after upload
8. ✅ Remove duplicate close button
9. ✅ Fix search form margin
10. ✅ Redesign table structure
11. ✅ Backend database migration
12. ✅ Update backend upload handler
13. ✅ Test with Puppeteer

## Next Steps

Implement all changes and test with Puppeteer before marking complete.
