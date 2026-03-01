# Fix Upload Issues - Implementation Plan

## Issues Found

### 1. Thumbnail Not Generated
- **Problem:** FFmpeg processing only happens for MP4 files
- **Root Cause:** Upload handler validates `.mp4` only
- **Fix:** Remove MP4-only restriction, support all file types

### 2. Video File Not Found (404)
- **Problem:** Backend returns `/uploads/videos/xxx.mp4` but doesn't serve static files
- **Root Cause:** No static file mount in FastAPI
- **Fix:** Add static file mount for `/uploads` directory

### 3. Tags and Expiry Not Saved
- **Problem:** Upload handler doesn't accept `tags` or `expiry_date` fields
- **Root Cause:** Fields not in upload endpoint parameters
- **Fix:** Add `tags` and `expiry_date` to Form parameters

### 4. JPG Upload Fails
- **Problem:** Upload handler rejects non-MP4 files
- **Root Cause:** Line 30-32: `if file_extension != '.mp4':`
- **Fix:** Remove restriction, support MP4, JPG, JPEG, PNG, BMP, GIF

## Implementation Steps

### Step 1: Remove MP4-Only Restriction
```python
# Remove this check:
if file_extension != '.mp4':
    raise HTTPException(status_code=400, detail="Only MP4 files are supported")

# Replace with:
ALLOWED_EXTENSIONS = {'.mp4', '.jpg', '.jpeg', '.png', '.bmp', '.gif'}
if file_extension not in ALLOWED_EXTENSIONS:
    raise HTTPException(status_code=400, detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
```

### Step 2: Add Static File Mount
```python
from fastapi.staticfiles import StaticFiles

# Mount uploads directory
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")
```

### Step 3: Add Tags and Expiry to Upload Handler
```python
async def upload_video(
    title: str = Form(...),
    channel_id: int = Form(...),
    category: str = Form(default="entertainment"),
    description: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),  # NEW
    tags: Optional[str] = Form(None),  # NEW (JSON string)
    file: UploadFile = File(...),
    thumbnail: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    # Parse tags
    import json
    tags_list = None
    if tags:
        try:
            tags_list = json.loads(tags)
        except:
            tags_list = tags.split(',')
    
    # Parse expiry date
    from datetime import datetime
    expiry_date_obj = None
    if expiry_date:
        try:
            expiry_date_obj = datetime.strptime(expiry_date, '%Y-%m-%d').date()
        except:
            pass
    
    # Add to video_data
    video_data = {
        # ... existing fields ...
        "tags": tags_list,
        "expiry_date": expiry_date_obj,
        "content_type": "video" if file_extension == '.mp4' else "image",
    }
```

### Step 4: Add Image Thumbnail Generation
```python
# For images, use Pillow instead of FFmpeg
if file_extension in {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}:
    from PIL import Image
    import io
    import base64
    
    img = Image.open(file_path)
    img.thumbnail((320, 180))  # Resize for thumbnail
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    thumbnail_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    # For images, no duration, no codecs
    metadata = {
        "width": img.width,
        "height": img.height,
        "duration": None,
        "fps": None,
        "video_codec": None,
        "audio_codec": None,
    }
```

## Order of Changes

1. ✅ Identified root causes
2. ⏳ Update upload handler to support multiple file types
3. ⏳ Add static file mount to main app
4. ⏳ Add tags and expiry_date parsing
5. ⏳ Add image thumbnail generation
6. ⏳ Test with Puppeteer
7. ⏳ Deploy and verify

---

**Starting implementation...**
