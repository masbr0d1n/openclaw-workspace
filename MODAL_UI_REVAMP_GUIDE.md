# Manual Edit Instructions for Modal UI Improvements

## File Location
`/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx`

## Changes to Make

### 1. Add Helper Function (already done ✅)
After `getFileExtension` function, add:

```typescript
// Helper: Get badge color for file type
const getFileBadgeColor = (contentType: string | undefined, filePath: string | undefined) => {
  if (contentType === 'video') {
    return 'bg-red-500 text-white border-red-600';
  } else if (contentType === 'image') {
    return 'bg-green-500 text-white border-green-600';
  }
  // Fallback: check file extension
  if (filePath) {
    const ext = filePath.toLowerCase().split('.').pop();
    if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv') {
      return 'bg-red-500 text-white border-red-600';
    } else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp') {
      return 'bg-green-500 text-white border-green-600';
    }
  }
  return 'bg-slate-500 text-white border-slate-600'; // Default
};
```

### 2. Update File Type Display (~line 706)

**BEFORE:**
```tsx
<div>
  <Label className="text-muted-foreground text-xs">File Type</Label>
  <p>{selectedVideo.video_url ? getFileExtension(selectedVideo.video_url) : 'Unknown'}</p>
</div>
```

**AFTER:**
```tsx
<div>
  <Label className="text-muted-foreground text-xs">File Type</Label>
  <div className="mt-1">
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getFileBadgeColor(selectedVideo.content_type, selectedVideo.video_url)}`}>
      {selectedVideo.video_url ? getFileExtension(selectedVideo.video_url).toUpperCase() : 'UNKNOWN'}
    </span>
    <span className="ml-2 text-xs text-slate-500">
      {selectedVideo.content_type === 'video' ? 'Video' : selectedVideo.content_type === 'image' ? 'Image' : 'Unknown'}
    </span>
  </div>
</div>
```

### 3. Update Expiry Date Display (~line 728)

**BEFORE:**
```tsx
<div>
  <Label className="text-muted-foreground text-xs">Expiry Date</Label>
  <p className="font-medium">{selectedVideo.expiry_date
    ? new Date(selectedVideo.expiry_date).toLocaleDateString()
    : 'Never'}</p>
</div>
```

**AFTER:**
```tsx
<div>
  <Label className="text-muted-foreground text-xs">Expiry Date</Label>
  <p className={`font-medium ${selectedVideo.expiry_date ? 'text-red-500 dark:text-red-400' : ''}`}>
    {selectedVideo.expiry_date
      ? new Date(selectedVideo.expiry_date).toLocaleDateString()
      : 'Never'}
  </p>
</div>
```

## Summary of Changes

1. ✅ Added `getFileBadgeColor()` helper function
2. ⏳ File Type → Badge with color (red=video, green=image)
3. ⏳ Expiry Date → Red color when date exists

## Result

- Video files (MP4, MOV, AVI, MKV) → Red badge
- Image files (JPG, JPEG, PNG, GIF, BMP) → Green badge
- Expiry Date → Red text when set, normal when "Never"
