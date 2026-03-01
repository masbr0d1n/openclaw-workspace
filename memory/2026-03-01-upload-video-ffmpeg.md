# Daily Memory - 2026-03-01 - Upload Video + FFmpeg Integration

## Upload Video Feature - Complete Implementation

### Issues Fixed

1. **422 Unprocessable Entity**
   - Problem: Backend required `channel_id`, frontend didn't send it
   - Fix: Added `formData.append('channel_id', '2')` in upload handler

2. **Description Field**
   - Added state: `uploadDescription`
   - Added form field: Textarea after title input
   - Added to FormData: `description`

3. **Thumbnail & Metadata**
   - Created FFmpeg service: `app/services/ffmpeg_service.py`
   - Auto-generate thumbnail at 1s timestamp
   - Extract metadata: resolution, fps, codecs, bitrate, duration
   - Store in database

### Frontend Changes

**File:** `streamhub-nextjs/src/app/dashboard/content/page.tsx`

- Import: `Textarea` from `@/components/ui/textarea`
- Import: `DialogTrigger` from dialog components
- State: `uploadDescription`, `uploadError`
- Form fields: Category → Title → Description (NEW) → File
- Upload handler: Send channel_id and description
- Error display: Show upload errors
- File info: Display selected file name and size

### Backend Changes

**Files Created:**
- `app/services/ffmpeg_service.py` - FFmpeg wrapper service
  - `generate_thumbnail()` - Extract frame, convert to base64
  - `extract_metadata()` - Probe video, get all metadata
  - `get_video_info()` - Complete video info

**Files Updated:**
- `app/api/v1/videos.py` - Upload endpoint with FFmpeg processing
- `app/models/video.py` - Already had all metadata columns
- `requirements.txt` - Added `ffmpeg-python>=0.2.0`

### Database Schema

**Columns (already existed in model):**
- description (TEXT)
- thumbnail_data (TEXT) - Base64
- width (INTEGER)
- height (INTEGER)
- fps (FLOAT)
- video_codec (VARCHAR 50)
- video_bitrate (INTEGER)
- audio_codec (VARCHAR 50)
- audio_bitrate (INTEGER)

### Deployment

**Containers:**
- apistreamhub-api: `apistreamhub-api:ffmpeg` (port 8001)
- streamhub-test: `streamhub-frontend:upload-fixed-v2` (port 3000)
- apistreamhub-db: `postgres:16-alpine` (port 5434)

**Database Setup:**
- Created apistreamhub-db container
- Created channels table with 5 channels
- Created videos table with all metadata columns

### URLs

- Frontend: http://192.168.8.117:3000/dashboard/content
- Backend API: http://192.168.8.117:8001/api/v1/
- Health: http://192.168.8.117:8001/health

### FFmpeg Integration Details

**Thumbnail Generation:**
- Extract frame at 1s timestamp
- Resize to 320px width
- Encode as JPEG
- Convert to base64
- Store in database

**Metadata Extraction:**
- Resolution (width, height)
- FPS (from r_frame_rate)
- Video codec (codec_name, codec_long_name)
- Audio codec (codec_name, codec_long_name)
- Duration (from format)
- Bitrate (from format)
- Sample rate, channels (audio)

### Git Automation

**Confirmed Active:**
- Pre-commit: Database backup
- Post-commit: Auto-push ke Forgejo
- Both repositories: apistreamhub-fastapi, streamhub-nextjs

**Last Commits:**
- Backend: 5f43101 - test: auto-commit & push automation
- Frontend: 1d793f4 - feat: update UI consistency and upload form design

## Lessons Learned

1. **FFmpeg in Docker** - Need ffmpeg-python, not just ffmpeg binary
2. **Container Networking** - Use --link for database connection
3. **Base64 Thumbnails** - Store in database for easy serving
4. **Metadata Extraction** - Use FFmpeg probe, not manual parsing
5. **Error Handling** - Continue upload even if FFmpeg fails

## Next Steps

1. Test upload with real video file
2. Display metadata in frontend
3. Show thumbnail in video list
4. Add metadata display in video detail page
5. Optimize thumbnail size/compression
