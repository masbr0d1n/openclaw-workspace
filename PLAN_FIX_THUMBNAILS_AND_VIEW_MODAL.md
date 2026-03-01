# Plan: Fix Thumbnails + Add View Modal

## Issues

### 1. Thumbnail Not Generated
**Problem:** `Error generating thumbnail: ffmpeg error`

**Likely Causes:**
- FFmpeg not installed in container
- FFmpeg path incorrect
- FFmpeg command syntax error
- Missing codec support

**Fix:**
- Check if FFmpeg is installed
- Test FFmpeg command manually
- Fix FFmpeg service if needed

### 2. Add View Modal
**Requirements:**
- Open modal instead of new tab
- Show: Title, Description, File Type, Upload Date
- For Videos: Resolution, Bitrate, FPS, Video Codec, Audio Codec
- For Images: Image Type (JPG/JPEG/GIF/PNG), Pixel Dimensions

**Implementation:**
- Add `viewDialogOpen` state
- Add `selectedVideo` state
- Create View modal component
- Update View button handler to open modal
- Display metadata based on content_type

---

## Implementation Steps

### Step 1: Fix Thumbnail Generation
1. Check if FFmpeg is installed
2. Test FFmpeg command
3. Fix ffmpeg_service.py if needed
4. Rebuild backend

### Step 2: Create View Modal
1. Add states for dialog
2. Create modal component with details
3. Update View button handler
4. Add conditional rendering for video/image details

### Step 3: Test with Puppeteer
1. Test thumbnail generation
2. Test View modal
3. Verify all metadata displayed

---

**Starting implementation...**
