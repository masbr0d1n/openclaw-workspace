# Fix Upload Video Form - Add Description & Metadata

## Issues Found

### Issue 1: 422 Unprocessable Entity

**Error Response:**
```json
{
  "detail": [
    {"type": "missing", "loc": ["body", "title"], "msg": "Field required"},
    {"type": "missing", "loc": ["body", "channel_id"], "msg": "Field required"},
    {"type": "missing", "loc": ["body", "file"], "msg": "Field required"}
  ]
}
```

**Root Cause:**
Backend requires: `title`, `channel_id`, `file`
Frontend sends: `file`, `title` (no `channel_id`)

### Issue 2: Missing Fields

User requests:
1. ✅ Description field (after title)
2. ✅ Thumbnail processing (auto-generate with FFmpeg)
3. ✅ Metadata extraction (resolution, fps, bitrate, codecs, duration)

## Backend Changes Needed

### 1. Update Upload Endpoint

**File:** `app/api/v1/videos.py`

Add:
- `description` field (Form parameter)
- FFmpeg thumbnail generation
- FFmpeg metadata extraction
- Store metadata in database

### 2. Update Video Schema

**File:** `app/schemas/video.py`

Add fields:
- `description: Optional[str]`
- `thumbnail_data: Optional[str]` (base64)
- `width: Optional[int]`
- `height: Optional[int]`
- `fps: Optional[float]`
- `bitrate: Optional[int]`
- `video_codec: Optional[str]`
- `audio_codec: Optional[str]`
- `duration: Optional[int]`

### 3. Update Database Model

**File:** `app/models/video.py`

Add columns:
- `description`
- `thumbnail_data`
- `width`
- `height`
- `fps`
- `bitrate`
- `video_codec`
- `audio_codec`

## Frontend Changes Needed

### 1. Update Upload Form

**File:** `src/app/dashboard/content/page.tsx`

Add:
- Description textarea (after title field)
- Show metadata preview after file selection
- Show thumbnail preview during upload

### 2. Update Upload Handler

Extract and show:
- File size
- Resolution
- Duration
- Codecs

## Implementation Plan

### Step 1: Backend Database Migration
```sql
ALTER TABLE videos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS thumbnail_data TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS fps FLOAT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS bitrate INTEGER;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_codec VARCHAR(50);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS audio_codec VARCHAR(50);
```

### Step 2: Backend Upload Endpoint
```python
@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: str = Form("entertainment"),
    channel_id: int = Form(2),
    db: AsyncSession = Depends(get_db)
):
    # Save file
    # Generate thumbnail with FFmpeg
    # Extract metadata
    # Save to database
```

### Step 3: FFmpeg Integration
```python
import ffmpeg

# Generate thumbnail
(
    ffmpeg
    .input(video_path, ss=1)
    .output(thumbnail_path, vframes=1)
    .overwrite_output()
    .run()
)

# Extract metadata
probe = ffmpeg.probe(video_path)
video_stream = next(s for s in probe['streams'] if s['codec_type'] == 'video')
audio_stream = next(s for s in probe['streams'] if s['codec_type'] == 'audio')

metadata = {
    'width': int(video_stream['width']),
    'height': int(video_stream['height']),
    'fps': eval(video_stream['r_frame_rate']),
    'bitrate': int(probe['format']['bit_rate']),
    'video_codec': video_stream['codec_name'],
    'audio_codec': audio_stream['codec_name'],
    'duration': float(probe['format']['duration'])
}
```

### Step 4: Frontend Form Update
```tsx
const [uploadDescription, setUploadDescription] = useState('');

// In form:
<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <Textarea
    id="description"
    placeholder="Video description (optional)"
    value={uploadDescription}
    onChange={(e) => setUploadDescription(e.target.value)}
    rows={3}
  />
</div>

// Add to FormData:
formData_upload.append('description', uploadDescription);
```

## Next Steps

1. Fix 422 error (add channel_id to frontend)
2. Add description field
3. Implement FFmpeg thumbnail generation
4. Implement FFmpeg metadata extraction
5. Update database schema
6. Test and deploy
