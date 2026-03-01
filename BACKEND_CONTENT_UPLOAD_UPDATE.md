# Backend Update - Content Upload with Multiple File Types

## Database Migration

Added new columns to support expanded content upload:

```sql
ALTER TABLE videos ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE videos ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS content_type VARCHAR(10);
CREATE INDEX IF NOT EXISTS idx_videos_expiry_date ON videos(expiry_date);
```

## Backend Changes Required

### Update Video Model

**File:** `apistreamhub-fastapi/app/models/video.py`

Add fields:
```python
tags: Optional[List[str]] = Column(ARRAY(String), nullable=True)
expiry_date: Optional[datetime.date] = Column(Date, nullable=True)
content_type: Optional[str] = Column(String(10), nullable=True)  # 'video' or 'image'
```

### Update Upload Endpoint

**File:** `apistreamhub-fastapi/app/api/v1/videos.py`

Changes:
1. Accept multiple file types (video/*, image/*)
2. Detect content_type from file
3. Parse tags from JSON
4. Parse expiry_date
5. Generate thumbnail for images using Pillow
6. Store all metadata

### Update Video Schema

**File:** `apistreamhub-fastapi/app/schemas/video.py`

Add fields to response schemas.

## Implementation Details

### Content Type Detection

```python
# Determine content type from file
if file.content_type.startswith('video/'):
    content_type = 'video'
    # Generate thumbnail with FFmpeg
    thumbnail_data = ffmpeg_service.generate_thumbnail(video_path)
    metadata = ffmpeg_service.extract_metadata(video_path)
elif file.content_type.startswith('image/'):
    content_type = 'image'
    # Generate thumbnail with Pillow
    from PIL import Image
    import io
    import base64
    
    img = Image.open(file.file)
    img.thumbnail((320, 180))
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    thumbnail_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    metadata = {
        'width': img.width,
        'height': img.height,
        'duration': None
    }
```

### Tags Parsing

```python
import json

tags = []
if form_data.get('tags'):
    try:
        tags = json.loads(form_data['tags'])
    except:
        tags = form_data['tags'].split(',')
```

### Expiry Date Handling

```python
from datetime import datetime

expiry_date = None
if form_data.get('expiry_date'):
    try:
        expiry_date = datetime.strptime(form_data['expiry_date'], '%Y-%m-%d').date()
    except:
        pass
```

## Quick Fix (Current Status)

For now, the frontend is ready with:
- ✅ Multiple file type support
- ✅ Duration detection for videos
- ✅ New form fields (Duration, Expiry, Tags)
- ✅ Reset button
- ✅ Fixed modal close after upload
- ✅ Table refresh after upload
- ✅ Redesigned table structure
- ✅ Fixed search margin
- ✅ Single close button

Backend needs:
- ⏳ Database migration (ready to run)
- ⏳ Model updates
- ⏳ Upload handler updates

## Current Status

Frontend: Ready to build
Backend: Needs schema updates
Database: Migration ready

Next: Build frontend, then update backend schema.
