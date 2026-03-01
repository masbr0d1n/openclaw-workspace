# Backend Implementation Plan - FFmpeg Integration

## Requirements

1. Auto-generate thumbnail from uploaded video
2. Extract metadata: resolution, fps, bitrate, codecs, duration
3. Store metadata and thumbnail in database

## Implementation Steps

### Step 1: Install FFmpeg Python Library

**File:** `apistreamhub-fastapi/requirements.txt`

Add:
```
ffmpeg-python==0.2.0
```

### Step 2: Create FFmpeg Service

**File:** `apistreamhub-fastapi/app/services/ffmpeg_service.py`

```python
import ffmpeg
import os
from pathlib import Path
from typing import Dict, Any
import base64

class FFmpegService:
    def __init__(self):
        self.upload_dir = Path("/app/uploads/videos")
        self.thumbnail_dir = Path("/app/uploads/thumbnails")
        self.thumbnail_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_thumbnail(self, video_path: str, timestamp: float = 1.0) -> str:
        """Generate thumbnail from video at timestamp"""
        video_filename = Path(video_path).stem
        thumbnail_path = self.thumbnail_dir / f"{video_filename}.jpg"
        
        (
            ffmpeg
            .input(video_path, ss=timestamp)
            .output(str(thumbnail_path), vframes=1, format='image2', vcodec='mjpeg')
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        
        return str(thumbnail_path)
    
    def extract_metadata(self, video_path: str) -> Dict[str, Any]:
        """Extract video metadata using FFmpeg probe"""
        probe = ffmpeg.probe(video_path)
        
        # Get video stream
        video_stream = next((s for s in probe['streams'] if s['codec_type'] == 'video'), None)
        audio_stream = next((s for s in probe['streams'] if s['codec_type'] == 'audio'), None)
        
        metadata = {
            'duration': float(probe['format']['duration']),
            'bitrate': int(probe['format']['bit_rate']) if 'bit_rate' in probe['format'] else None,
        }
        
        if video_stream:
            metadata.update({
                'width': int(video_stream['width']),
                'height': int(video_stream['height']),
                'fps': eval(video_stream['r_frame_rate']),
                'video_codec': video_stream['codec_name'],
                'video_codec_desc': video_stream.get('codec_long_name', ''),
            })
        
        if audio_stream:
            metadata.update({
                'audio_codec': audio_stream['codec_name'],
                'audio_codec_desc': audio_stream.get('codec_long_name', ''),
                'audio_sample_rate': int(audio_stream['sample_rate']) if 'sample_rate' in audio_stream else None,
            })
        
        return metadata
    
    def thumbnail_to_base64(self, thumbnail_path: str) -> str:
        """Convert thumbnail file to base64 string"""
        with open(thumbnail_path, 'rb') as f:
            return base64.b64encode(f.read()).decode('utf-8')
```

### Step 3: Update Video Model

**File:** `apistreamhub-fastapi/app/models/video.py`

Add columns:
```python
description: Optional[str] = Column(Text, nullable=True)
thumbnail_data: Optional[str] = Column(Text, nullable=True)  # base64
width: Optional[int] = Column(Integer, nullable=True)
height: Optional[int] = Column(Integer, nullable=True)
fps: Optional[float] = Column(Float, nullable=True)
bitrate: Optional[int] = Column(Integer, nullable=True)
video_codec: Optional[str] = Column(String(50), nullable=True)
audio_codec: Optional[str] = Column(String(50), nullable=True)
```

### Step 4: Create Database Migration

**File:** `apistreamhub-fastapi/migrations/add_video_metadata.sql`

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

### Step 5: Update Upload Endpoint

**File:** `apistreamhub-fastapi/app/api/v1/videos.py`

Update upload function to:
1. Accept description parameter
2. Generate thumbnail using FFmpegService
3. Extract metadata using FFmpegService
4. Convert thumbnail to base64
5. Save all to database

### Step 6: Update Video Schemas

**File:** `apistreamhub-fastapi/app/schemas/video.py`

Add fields to VideoResponse and VideoCreate schemas.

## Quick Fix (Current)

For now, frontend already has:
- ✅ channel_id field (fixes 422 error)
- ✅ Description field in upload form
- ✅ Error handling

Backend TODO:
- ⏳ FFmpeg integration
- ⏳ Thumbnail generation
- ⏳ Metadata extraction
- ⏳ Database migration

## Priority

1. **HIGH:** Fix 422 error → ✅ DONE (frontend now sends channel_id)
2. **MEDIUM:** Add description field → ✅ DONE (frontend form updated)
3. **LOW:** FFmpeg integration → ⏳ TODO (requires backend changes)
