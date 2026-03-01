# Upload Video Form - TV Hub Style Design

## Implementation Summary

### Changes Made

Updated `/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx`:

**1. Added New State Variables:**
```tsx
const [uploadTitle, setUploadTitle] = useState('');
const [uploadCategory, setUploadCategory] = useState('entertainment');
```

**2. Redesigned Upload Dialog:**
Changed from simple DialogContent to Card-based layout (like TV Hub login):

```tsx
<DialogContent className="sm:max-w-md">
  <Card className="border-0 shadow-none">
    <CardHeader className="space-y-1 px-0 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold">Upload Video</CardTitle>
          <CardDescription>
            Upload a video file from your device
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={close}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent className="px-0">
      <form onSubmit={handleUploadVideo} className="space-y-4">
        {/* Fields... */}
      </form>
    </CardContent>
  </Card>
</DialogContent>
```

**3. Form Fields (TV Hub Style):**

- **Category Dropdown** (first field, like login form)
  ```tsx
  <div className="space-y-2">
    <Label htmlFor="category">Category</Label>
    <Select value={uploadCategory} onValueChange={setUploadCategory}>
      <SelectTrigger id="category">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categoryOptions.map((cat) => (
          <SelectItem key={cat.value} value={cat.value}>
            {cat.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  ```

- **Title Input** (optional, auto-filled from filename)
  ```tsx
  <div className="space-y-2">
    <Label htmlFor="title">Title</Label>
    <Input
      id="title"
      type="text"
      placeholder="Video title (optional)"
      value={uploadTitle}
      onChange={(e) => setUploadTitle(e.target.value)}
    />
  </div>
  ```

- **File Input** (required)
  ```tsx
  <div className="space-y-2">
    <Label htmlFor="file">Video File</Label>
    <Input
      id="file"
      type="file"
      accept="video/*"
      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
      required
      disabled={uploadProgress > 0}
    />
  </div>
  ```

- **Progress Bar** (shown during upload)
  ```tsx
  {uploadProgress > 0 && (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Uploading...</span>
        <span>{uploadProgress}%</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    </div>
  )}
  ```

- **Action Buttons** (full width, like login form)
  ```tsx
  <div className="flex gap-2">
    <Button
      type="button"
      variant="outline"
      onClick={() => setUploadDialogOpen(false)}
      disabled={uploadProgress > 0}
      className="flex-1"
    >
      Cancel
    </Button>
    <Button
      type="submit"
      disabled={!uploadFile || uploadProgress > 0}
      className="flex-1"
    >
      {uploadProgress > 0 ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </>
      ) : (
        'Upload'
      )}
    </Button>
  </div>
  ```

**4. Enhanced Upload Handler:**
```tsx
const handleUploadVideo = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const finalTitle = uploadTitle.trim() || uploadFile.name.replace(/\.[^/.]+$/, '');
  
  formData_upload.append('title', finalTitle);
  formData_upload.append('category', uploadCategory);
  
  // Reset form after upload
  setUploadTitle('');
  setUploadCategory('entertainment');
};
```

## Key Design Matches (TV Hub Style)

✅ **Card Layout** - Same Card/CardHeader/CardContent structure
✅ **CardTitle** - "text-2xl font-bold" (like login form)
✅ **CardDescription** - Subtitle text
✅ **Form Spacing** - space-y-4 for form, space-y-2 for fields
✅ **Label Style** - Consistent Label with htmlFor
✅ **Input Style** - Input with id, placeholder, proper spacing
✅ **Full Width Buttons** - flex-1 for equal width buttons
✅ **Loading State** - Loader2 icon with "Uploading..." text
✅ **Disabled State** - Disabled during upload
✅ **Close Button** - X icon in top-right corner

## Before vs After

**Before (Simple Dialog):**
- DialogContent only
- Simple file input
- Basic progress bar
- Default button layout

**After (TV Hub Style):**
- Card-based layout inside Dialog
- Category dropdown (first field)
- Title input (optional, auto-filled)
- File input (required)
- Full width buttons with loading spinner
- Consistent spacing and styling
- Matches login form design

## Deploy Config

- **Image:** `streamhub-frontend:upload-form-card`
- **Container:** `streamhub-test`
- **Port:** 3000

## Test

1. Go to: http://192.168.8.117:3000/dashboard/content
2. Click "Upload Video" button
3. See new form with:
   - Category dropdown
   - Title input (optional)
   - File input
   - Full width Cancel/Upload buttons
   - Progress bar during upload
