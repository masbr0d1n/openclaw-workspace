# Test Video Upload with Thumbnail - Current Status

## Issue Identified

**FFmpeg Exit Code 234** - Thumbnail generation failing even though:
- ✅ Metadata extraction works (width, height, fps, codecs)
- ✅ Video file processes correctly
- ❌ Thumbnail generation fails

## Test Results

### Video Upload Test
```
✅ Upload successful
  Video ID: 14
  Title: Test Video Thumbnail 1772360209
```

### Backend Logs
```
✗ FFmpeg thumbnail failed (code 234)
STDERR: ffmpeg version 7.1.3...
```

### Video Details
```json
{
  "id": 14,
  "thumbnail_data": null,
  "width": 320,
  "height": 240,
  "fps": 25.0,
  "video_codec": "h264",
  "audio_codec": "aac"
}
```

**Metadata extraction: WORKING ✅**
**Thumbnail generation: FAILING ❌**

## Possible Causes

### 1. FFmpeg Command Issue
Current command in ffmpeg_service.py:
```python
cmd = [
    "ffmpeg",
    "-i", video_path,
    "-ss", str(timestamp),
    "-vframes", "1",
    "-f", "image2pipe",
    "-vcodec", "mjpeg",
    "-s", f"{width}x-1",
    "-"  # Output to stdout
]
```

### 2. Test Video Format
The generated test video might not be seekable properly.

### 3. Image Pipe Format
`-f image2pipe` with `-vcodec mjpeg` might have issues with certain video formats.

## Solutions to Try

### Option 1: Use File Output Instead of Pipe
```python
# Instead of piping output, write to temp file
thumbnail_path = self.upload_dir.parent / "thumbnails" / f"{video_filename}_thumb.jpg"

cmd = [
    "ffmpeg",
    "-i", video_path,
    "-ss", str(timestamp),
    "-vframes", "1",
    "-s", f"{width}x-1",
    str(thumbnail_path)  # Write to file
]

subprocess.run(cmd, capture_output=True, timeout=30)

# Read file and convert to base64
with open(thumbnail_path, 'rb') as f:
    thumbnail_base64 = base64.b64encode(f.read()).decode('utf-8')

# Clean up
thumbnail_path.unlink()
```

### Option 2: Use Different Codec/Format
```python
cmd = [
    "ffmpeg",
    "-i", video_path,
    "-ss", str(timestamp),
    "-vframes", "1",
    "-f", "image2",  # Instead of image2pipe
    "-c:v", "mjpeg",  # Explicit codec
    "-s", f"{width}x-1",
    "-"  # Output to stdout
]
```

### Option 3: Add More Error Handling
```python
result = subprocess.run(
    cmd,
    capture_output=True,
    timeout=30,
    check=False
)

if result.returncode != 0:
    # Log full stderr for debugging
    print(f"FFmpeg failed (code {result.returncode})")
    print(f"Command: {' '.join(cmd)}")
    print(f"Stderr: {result.stderr.decode('utf-8', errors='ignore')}")
    print(f"Stdout: {result.stdout[:100]}")  # First 100 bytes
    return None
```

## Next Steps

1. **Quick Fix**: Use file output instead of pipe (Option 1)
2. **Test** with proper video file
3. **Verify** thumbnail displays in frontend
4. **Deploy** fixed version

## Status

- ✅ Test video created
- ✅ Upload tested
- ⏳ FFmpeg fix in progress
- ⏳ Puppeteer test pending

---

**Recommendation**: Implement Option 1 (file output) as it's more reliable than piping binary data.
