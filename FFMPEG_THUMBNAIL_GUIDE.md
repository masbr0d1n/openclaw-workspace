# FFmpeg Thumbnail Generation - Complete Guide

## Quick Reference

**Problem:** Exit code 234 - Invalid frame size  
**Solution:** Use `-vf "scale=320:-1"` instead of `-s 320x-1`  
**File:** `app/services/ffmpeg_service.py`  
**Status:** ✅ Working (tested 2026-03-01)

---

## Technical Details

### Error That Occurred
```bash
✗ FFmpeg thumbnail failed (code 234)
[vost#0:0/mjpeg @ 0x5569d95f82c0] Invalid frame size: 320x-1.
Error opening output files: Invalid argument
```

### Why -s Parameter Failed
The `-s 320x-1` syntax where `-1` means "auto calculate" is not universally supported across all FFmpeg builds and versions. Some builds parse it as literal "-1" instead of "auto".

### Why Scale Filter Works
The `-vf "scale=320:-1"` video filter is designed specifically for resizing:
- More universally supported
- `-1` is standard syntax for "maintain aspect ratio"
- Scale filter is optimized for this use case
- Works across different FFmpeg versions/builds

---

## Correct Implementation

### Python Code
```python
import subprocess
import base64
from pathlib import Path

def generate_thumbnail(video_path: str, timestamp: float = 1.0, width: int = 320) -> Optional[str]:
    """
    Generate thumbnail using FFmpeg with scale filter (RELIABLE METHOD)
    """
    try:
        video_filename = Path(video_path).stem
        thumbnail_dir = Path(video_path).parent.parent / "thumbnails"
        thumbnail_dir.mkdir(parents=True, exist_ok=True)
        thumbnail_path = thumbnail_dir / f"{video_filename}_thumb.jpg"
        
        # ✅ CORRECT: Use scale filter
        cmd = [
            "ffmpeg",
            "-i", video_path,
            "-ss", str(timestamp),
            "-vframes", "1",
            "-vf", f"scale={width}:-1",  # Scale filter (reliable)
            "-y",  # Overwrite if exists
            str(thumbnail_path)
        ]
        
        result = subprocess.run(cmd, capture_output=True, timeout=30, check=False)
        
        if result.returncode == 0 and thumbnail_path.exists():
            # Read file and convert to base64
            with open(thumbnail_path, 'rb') as f:
                thumbnail_base64 = base64.b64encode(f.read()).decode('utf-8')
            
            # Clean up
            thumbnail_path.unlink()
            
            return thumbnail_base64
        else:
            print(f"FFmpeg failed (code {result.returncode})")
            print(f"STDERR: {result.stderr.decode('utf-8', errors='ignore')[:500]}")
            return None
            
    except Exception as e:
        print(f"Error: {e}")
        return None
```

### Command Line Equivalent
```bash
# Direct test in container
docker exec apistreamhub-api ffmpeg -i /app/uploads/videos/video.mp4 \
  -ss 1.0 \
  -vframes 1 \
  -vf "scale=320:-1" \
  /app/uploads/thumbnails/thumb.jpg \
  -y
```

---

## Testing & Verification

### 1. Manual FFmpeg Test
```bash
# Test if FFmpeg can generate thumbnail
docker exec apistreamhub-api ffmpeg -i /app/uploads/videos/VIDEO.mp4 \
  -ss 1 -vframes 1 -vf "scale=320:-1" /tmp/test-thumb.jpg -y

# Check if file created
docker exec apistreamhub-api ls -la /tmp/test-thumb.jpg
```

### 2. Upload Test
```bash
# Upload video and verify thumbnail
bash /home/sysop/.openclaw/workspace/test-ffmpeg-v2.sh
```

### 3. Frontend Verification
```bash
# Puppeteer test
node /home/sysop/.openclaw/workspace/streamhub-nextjs/tests/puppeteer/test-thumbnail-display.js
```

### 4. API Verification
```bash
# Check API response includes thumbnail_data
curl -H "Authorization: Bearer $TOKEN" \
  http://192.168.8.117:8001/api/v1/videos/VIDEO_ID | \
  python3 -m json.tool | grep -A 2 "thumbnail_data"
```

---

## Troubleshooting

### If Thumbnails Stop Working

1. **Check Backend Logs**
   ```bash
   docker logs apistreamhub-api --tail 100 | grep -i thumbnail
   ```

2. **Test FFmpeg Directly**
   ```bash
   # Copy a video to container
   docker cp video.mp4 apistreamhub-api:/tmp/test.mp4
   
   # Try generating thumbnail
   docker exec apistreamhub-api ffmpeg -i /tmp/test.mp4 \
     -ss 1 -vframes 1 -vf "scale=320:-1" /tmp/out.jpg -y
   ```

3. **Check FFmpeg Version**
   ```bash
   docker exec apistreamhub-api ffmpeg -version | head -3
   ```

4. **Verify File Permissions**
   ```bash
   docker exec apistreamhub-api ls -la /app/uploads/thumbnails/
   ```

5. **Check Service Code**
   ```bash
   docker exec apistreamhub-api grep -A 5 "def generate_thumbnail" /app/app/services/ffmpeg_service.py
   ```

---

## Common Pitfalls

### ❌ DON'T: Use -s parameter
```python
cmd = ["ffmpeg", "-i", video, "-ss", "1", "-vframes", "1", 
       "-s", "320x-1", output]  # ❌ Breaks on some FFmpeg builds
```

### ❌ DON'T: Use pipe for binary output
```python
cmd = ["ffmpeg", "-i", video, "-f", "image2pipe", "-vcodec", "mjpeg", "-"]
result = subprocess.run(cmd, capture_output=True)
# ❌ Pipe can corrupt binary data
```

### ✅ DO: Use scale filter
```python
cmd = ["ffmpeg", "-i", video, "-ss", "1", "-vframes", "1",
       "-vf", "scale=320:-1", output]  # ✅ Reliable
```

### ✅ DO: Use file output
```python
thumbnail_path = "/path/to/thumb.jpg"
cmd = ["ffmpeg", "-i", video, "-ss", "1", "-vframes", "1",
       "-vf", "scale=320:-1", thumbnail_path, "-y"]
# ✅ More reliable for binary data
```

---

## Related Files

| File | Purpose |
|------|---------|
| `app/services/ffmpeg_service.py` | FFmpeg thumbnail & metadata extraction |
| `app/api/v1/videos_upload_new.py` | Upload handler using FFmpeg service |
| `src/app/dashboard/content/page.tsx` | Frontend thumbnail display |
| `test-ffmpeg-v2.sh` | Upload test script |
| `tests/puppeteer/test-thumbnail-display.js` | Puppeteer verification test |

---

## Deployment History

| Date | Change | Status |
|------|--------|--------|
| 2026-03-01 | Fixed scale filter syntax | ✅ Working |
| 2026-03-01 | Changed from pipe to file output | ✅ Working |
| 2026-03-01 | Puppeteer test: 2/10 with thumbnails | ✅ Verified |
| 2026-03-01 | Frontend displaying thumbnails | ✅ Confirmed |

---

## Maintenance Notes

### After Container Rebuild
- Verify FFmpeg version compatibility
- Test thumbnail generation manually
- Run Puppeteer test to verify

### After FFmpeg Upgrade
- Test scale filter syntax still works
- Check for deprecation warnings
- Verify thumbnail quality

### Code Changes
- Always use scale filter, not -s parameter
- Always use file output, not pipe
- Include error handling with stderr logging
- Return None on failure (graceful degradation)

---

## Summary

**✅ Current Status: Working**

**Key Command:** `ffmpeg -i input.mp4 -ss 1 -vframes 1 -vf "scale=320:-1" output.jpg`

**Key File:** `app/services/ffmpeg_service.py`

**Test:** `node tests/puppeteer/test-thumbnail-display.js`

**Remember:** Scale filter (`-vf`) is more reliable than size parameter (`-s`) for FFmpeg thumbnail generation!
