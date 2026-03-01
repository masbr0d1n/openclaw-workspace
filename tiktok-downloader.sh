#!/bin/bash
# TikTok Downloader & Telegram Uploader
# Downloads N videos from TikTok user and uploads last video to Telegram

WORKSPACE="/home/sysop/.openclaw/workspace"
DOWNLOAD_DIR="$WORKSPACE/tiktok-videos"
LOG_FILE="$WORKSPACE/tiktok-downloader.log"
CHAT_ID="-1003883313656"
TOPIC_ID="193"

# Configuration
USERNAME="$1"     # TikTok username (without @)
COUNT="${2:-10}"    # Number of videos to download (default: 10)
AUTO_UPLOAD="${3:-false}"  # Auto-upload last video to Telegram (true/false)

# Create download directory
mkdir -p "$DOWNLOAD_DIR"

# Logging
log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$msg" | tee -a "$LOG_FILE"
}

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    log "❌ yt-dlp not found. Please install: sudo pacman -S yt-dlp"
    exit 1
fi

if [ -z "$USERNAME" ]; then
    log "❌ Usage: $0 <username> [count] [auto_upload]"
    log ""
    log "Examples:"
    log "  $0 trendingart2 10 true   # Download 10 videos, upload last to Telegram"
    log "  $0 trendingart2 10 false  # Download 10 videos only"
    exit 1
fi

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "📥 TikTok Downloader Starting"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "📝 Configuration:"
log "   Username: @${USERNAME}"
log "   Videos: ${COUNT}"
log "   Auto-upload: $AUTO_UPLOAD"
log "   Output: $DOWNLOAD_DIR"
log ""

# Change to download directory
cd "$DOWNLOAD_DIR" || exit 1

# Download videos
log "⏳ Step 1: Downloading videos..."
log "─────────────────────────────────────────────────────────────────"

# Get video info first (without downloading)
log "📋 Fetching video info..."

yt-dlp \
    --quiet \
    --skip-download \
    --print "%(id)s | %(title)s | %(duration)s | %(like_count)s" \
    --playlist-end "$COUNT" \
    --extractor-args "tiktok:api_hostname=www.tiktok.com" \
    "https://www.tiktok.com/@${USERNAME}" 2>/dev/null | head -"$COUNT" | while IFS='|' read -r vid_id title duration likes; do
        log "   📹 $vid_id | ${duration}s | ❤️ ${likes}"
    done

log ""
log "🎬 Starting download..."

# Download videos
DOWNLOAD_OUTPUT=$(yt-dlp \
    --format "mp4" \
    --output "%(uploader)s_%(id)s.%(ext)s" \
    --max-downloads "$COUNT" \
    --playlist-reverse \
    --extractor-args "tiktok:api_hostname=www.tiktok.com" \
    --no-playlist \
    "https://www.tiktok.com/@${USERNAME}" 2>&1)

# Count downloaded videos
VIDEO_COUNT=$(ls -1 *.mp4 2>/dev/null | wc -l)

log ""
log "✅ Download complete!"
log "📊 Downloaded: $VIDEO_COUNT videos"

# Get last downloaded video
LAST_VIDEO=$(ls -t *.mp4 2>/dev/null | head -1)

if [ -z "$LAST_VIDEO" ]; then
    log "⚠️  No videos found"
    exit 1
fi

VIDEO_PATH="$DOWNLOAD_DIR/$LAST_VIDEO"
FILE_SIZE=$(ls -lh "$VIDEO_PATH" | awk '{print $5}')

log ""
log "📋 Downloaded Videos:"
ls -lh *.mp4 | awk '{print "   " $9 " - " $5}'

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "📤 Last Video Info"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "📁 File: $LAST_VIDEO"
log "📊 Size: $FILE_SIZE"
log "📍 Path: $VIDEO_PATH"

# Check file size
SIZE_BYTES=$(stat -f%z "$VIDEO_PATH")
MAX_SIZE=$((50 * 1024 * 1024))  # 50MB Telegram limit

if [ "$AUTO_UPLOAD" = "true" ]; then
    log ""
    log "⏳ Step 2: Uploading to Telegram..."
    log "─────────────────────────────────────────────────────────────────"

    if [ $SIZE_BYTES -gt $MAX_SIZE ]; then
        log "⚠️  File too large for Telegram (max 50MB)"
        log "💡 Manual upload required"
    else
        # Get video metadata for message
        DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$VIDEO_PATH" 2>/dev/null)
        MINUTES=$(printf "%.0f" "$(echo "$DURATION / 60" | bc -l)")

        UPLOAD_MESSAGE="🎬 **Sample TikTok Download**\n\n"
        UPLOAD_MESSAGE+="📹 **@${USERNAME}**\n\n"
        UPLOAD_MESSAGE+="📁 File: ${LAST_VIDEO%.*}\n"
        UPLOAD_MESSAGE+="📊 Size: $FILE_SIZE\n"
        UPLOAD_MESSAGE+="⏱️ Duration: ${MINUTES} minutes\n\n"
        UPLOAD_MESSAGE+="Video berhasil didownload dari TikTok!"

        log "📤 Uploading: $LAST_VIDEO ($FILE_SIZE)"

        /home/sysop/.npm-global/bin/openclaw message send \
            --channel telegram \
            --target "$CHAT_ID" \
            --thread-id "$TOPIC_ID" \
            --message "$UPLOAD_MESSAGE" \
            --media "$VIDEO_PATH" \
            --filename "$LAST_VIDEO" 2>&1 | tee -a "$LOG_FILE"

        if [ $? -eq 0 ]; then
            log "✅ Upload successful!"
        else
            log "❌ Upload failed"
        fi
    fi
else
    log ""
    log "💡 Auto-upload disabled"
    log "🔗 To upload manually:"
    log "   /home/sysop/.openclaw/workspace/upload-tiktok-sample.sh"
fi

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ All operations complete!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Output path for easy access
echo "$VIDEO_PATH"
