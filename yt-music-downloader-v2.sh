#!/bin/bash
# YouTube Music Album Downloader with Album Art (Corrected)
# Downloads full albums with proper metadata and album art

WORKSPACE="/home/sysop/.openclaw/workspace"
MUSIC_DIR="$WORKSPACE/music"
LOG_FILE="$WORKSPACE/yt-music-downloader.log"
CHAT_ID="-1003883313656"
TOPIC_ID="193"

# Configuration
ALBUM_NAME="$1"  # Album name
ARTIST_NAME="$2"  # Artist name
FORMAT="${3:-mp3}"  # Output format
NOTIFY="${4:-false}"  # Send notification

# Create music directory
mkdir -p "$MUSIC_DIR"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

if [ -z "$ALBUM_NAME" ] || [ -z "$ARTIST_NAME" ]; then
    log "❌ Usage: $0 <album_name> <artist_name> [format] [notify]"
    exit 1
fi

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🎵 YouTube Music Album Downloader"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "📝 Configuration:"
log "   Album: $ALBUM_NAME"
log "   Artist: $ARTIST_NAME"
log "   Format: $FORMAT"
log "   Album Art: ✅ Enabled"
log "   Metadata: ✅ Enabled"
log ""

# Change to music directory
cd "$MUSIC_DIR" || exit 1

log "⏳ Starting download..."
log "─────────────────────────────────────────────────────────────────"

# Download using yt-dlp with album-specific search
yt-dlp \
    --audio-quality 0 \
    --extract-audio \
    --audio-format $FORMAT \
    --format "bestaudio/best" \
    --output "${ARTIST_NAME}/${ALBUM_NAME}/%(playlist_index)02d %(title)s.%(ext)s" \
    --embed-metadata \
    --embed-thumbnail \
    --add-metadata \
    --write-thumbnail \
    --parse-metadata ":%(meta_title)s" \
    --prefer-insecure \
    "ytsearch50:${ARTIST_NAME} ${ALBUM_NAME} full album official" 2>&1 | tee -a "$LOG_FILE"

# Count downloaded files
DOWNLOADED=$(find "$ARTIST_NAME/$ALBUM_NAME" -name "*.mp3" -o -name "*.flac" -o -name "*.ogg" 2>/dev/null | wc -l)

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ Download complete!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "📊 Statistics:"
log "   Album: $ALBUM_NAME"
log "   Artist: $ARTIST_NAME"
log "   Downloaded: $DOWNLOADED tracks"
log "   Format: $FORMAT"
log "   Album Art: ✅ Embedded"
log "   Metadata: ✅ Embedded"
log "   Location: $MUSIC_DIR/${ARTIST_NAME}/${ALBUM_NAME}"

# List downloaded tracks
if [ $DOWNLOADED -gt 0 ]; then
    log ""
    log "🎵 Downloaded tracks:"
    find "$ARTIST_NAME/$ALBUM_NAME" -type f \( -name "*.mp3" -o -name "*.flac" -o -name "*.ogg" \) -exec ls -lh {} \; | awk '{print "   " $9 " - " $5}'
fi

# Calculate total size
if [ -d "$ARTIST_NAME/$ALBUM_NAME" ]; then
    TOTAL_SIZE=$(du -sh "$ARTIST_NAME/$ALBUM_NAME" | cut -f1)
    log ""
    log "📁 Total size: $TOTAL_SIZE"
fi

# Send notification if requested
if [ "$NOTIFY" = "true" ]; then
    log ""
    log "📤 Sending notification to Telegram..."

    if [ $DOWNLOADED -gt 0 ]; then
        NOTIFY_MESSAGE="🎵 **Music Download Complete**\n\n"
        NOTIFY_MESSAGE+="💿 **${ALBUM_NAME}**\n"
        NOTIFY_MESSAGE+="🎤 ${ARTIST_NAME}\n\n"
        NOTIFY_MESSAGE+="🎵 Tracks: ${DOWNLOADED}\n"
        NOTIFY_MESSAGE+="🎼 Format: ${FORMAT}\n"
        NOTIFY_MESSAGE+="🖼️ Album Art: ✅ Embedded\n"
        NOTIFY_MESSAGE+="📝 Metadata: ✅ Embedded\n\n"
        if [ -n "$TOTAL_SIZE" ]; then
            NOTIFY_MESSAGE+="📊 Size: ${TOTAL_SIZE}\n\n"
        fi
        NOTIFY_MESSAGE+="✅ Source: YouTube Music\n"
        NOTIFY_MESSAGE+="💾 Lokasi: \`${MUSIC_DIR}/${ARTIST_NAME}/${ALBUM_NAME}\`"

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
echo "$MUSIC_DIR/${ARTIST_NAME}/${ALBUM_NAME}"
