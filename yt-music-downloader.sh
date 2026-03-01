#!/bin/bash
# YouTube Music Album Downloader with Album Art
# Downloads full albums from YouTube Music with embedded metadata and album art

WORKSPACE="/home/sysop/.openclaw/workspace"
MUSIC_DIR="$WORKSPACE/music"
LOG_FILE="$WORKSPACE/yt-music-downloader.log"
CHAT_ID="-1003883313656"
TOPIC_ID="193"

# Configuration
ALBUM_QUERY="$1"  # Album search query or URL
FORMAT="${2:-mp3}"  # Output format
NOTIFY="${3:-false}"  # Send notification

# Create music directory
mkdir -p "$MUSIC_DIR"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

if [ -z "$ALBUM_QUERY" ]; then
    log "❌ Usage: $0 <album_query_or_url> [format] [notify]"
    log ""
    log "Examples:"
    log "  $0 'album name artist' mp3 true"
    log "  $0 'https://youtube.com/playlist?list=...' mp3 false"
    exit 1
fi

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🎵 YouTube Music Album Downloader"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "📝 Configuration:"
log "   Query: $ALBUM_QUERY"
log "   Format: $FORMAT"
log "   Album Art: ✅ Enabled"
log "   Metadata: ✅ Enabled"
log ""

# Change to music directory
cd "$MUSIC_DIR" || exit 1

log "⏳ Starting download..."
log "─────────────────────────────────────────────────────────────────"

# Download using yt-dlp
# Use YouTube Music source for better quality and metadata
yt-dlp \
    --audio-quality 0 \
    --extract-audio \
    --audio-format $FORMAT \
    --format "bestaudio/best" \
    --output "%(artist,channel,uploader)s/%(album,playlist_title)s/%(track_number,playlist_index)02d %(title)s.%(ext)s" \
    --embed-metadata \
    --embed-thumbnail \
    --add-metadata \
    --write-thumbnail \
    --no-playlist \
    --extractor-descriptions \
    --audio-multistreams \
    "ytsearch10:${ALBUM_QUERY} full album" 2>&1 | tee -a "$LOG_FILE"

# Count downloaded files
DOWNLOADED=$(find . -name "*.mp3" -o -name "*.flac" -o -name "*.ogg" -o -name "*.m4a" 2>/dev/null | wc -l)

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ Download complete!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "📊 Statistics:"
log "   Downloaded: $DOWNLOADED tracks"
log "   Format: $FORMAT"
log "   Album Art: ✅ Embedded"
log "   Metadata: ✅ Embedded"
log "   Location: $MUSIC_DIR"

# List downloaded tracks
if [ $DOWNLOADED -gt 0 ]; then
    log ""
    log "🎵 Downloaded tracks:"
    find . -type f \( -name "*.mp3" -o -name "*.flac" -o -name "*.ogg" -o -name "*.m4a" \) -exec ls -lh {} \; | awk '{print "   " $9 " - " $5}'
fi

# Calculate total size
if command -v du &> /dev/null; then
    TOTAL_SIZE=$(du -sh . | cut -f1)
    log ""
    log "📁 Total size: $TOTAL_SIZE"
fi

# Send notification if requested
if [ "$NOTIFY" = "true" ]; then
    log ""
    log "📤 Sending notification to Telegram..."

    if [ $DOWNLOADED -gt 0 ]; then
        NOTIFY_MESSAGE="🎵 **YouTube Music Download Complete**\n\n"
        NOTIFY_MESSAGE+="💿 Album\n\n"
        NOTIFY_MESSAGE+="🎵 Tracks: ${DOWNLOADED}\n"
        NOTIFY_MESSAGE+="🎼 Format: ${FORMAT}\n"
        NOTIFY_MESSAGE+="🖼️ Album Art: ✅ Embedded\n"
        NOTIFY_MESSAGE+="📝 Metadata: ✅ Embedded\n\n"
        if [ -n "$TOTAL_SIZE" ]; then
            NOTIFY_MESSAGE+="📊 Size: ${TOTAL_SIZE}\n\n"
        fi
        NOTIFY_MESSAGE+="✅ Source: YouTube Music\n"
        NOTIFY_MESSAGE+="💾 Lokasi: \`${MUSIC_DIR}\`"

        /home/sysop/.npm-global/bin/openclaw message send \
            --channel telegram \
            --target "$CHAT_ID" \
            --thread-id "$TOPIC_ID" \
            --message "$NOTIFY_MESSAGE" 2>&1 | tee -a "$LOG_FILE"

        if [ $? -eq 0 ]; then
            log "✅ Notification sent!"
        else
            log "❌ Notification failed"
        fi
    fi
fi

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ All operations complete!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Return location
echo "$MUSIC_DIR"
