#!/bin/bash
# YouTube Music Downloader
# Downloads music by searching YouTube Music directly (no Spotify API needed)

WORKSPACE="/home/sysop/.openclaw/workspace"
MUSIC_DIR="$WORKSPACE/music"
LOG_FILE="$WORKSPACE/youtube-music-downloader.log"
CHAT_ID="-1003883313656"
TOPIC_ID="193"

# Configuration
ALBUM_NAME="$1"  # Album name
ARTIST_NAME="$2"  # Artist name
FORMAT="${3:-mp3}"  # Output format
TRACK_COUNT="${4:-10}"  # Number of tracks to download
NOTIFY="${5:-false}"  # Send notification

# Create music directory
mkdir -p "$MUSIC_DIR"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

if [ -z "$ALBUM_NAME" ] || [ -z "$ARTIST_NAME" ]; then
    log "❌ Usage: $0 <album_name> <artist_name> [format] [track_count] [notify]"
    log ""
    log "Examples:"
    log "  $0 'Album Name' 'Artist Name' mp3 10 true"
    exit 1
fi

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🎵 YouTube Music Downloader Starting"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "📝 Configuration:"
log "   Album: $ALBUM_NAME"
log "   Artist: $ARTIST_NAME"
log "   Format: $FORMAT"
log "   Tracks: $TRACK_COUNT"
log "   Notify: $NOTIFY"
log ""

# Change to music directory
cd "$MUSIC_DIR" || exit 1

# Create artist/album folder structure
TARGET_DIR="${ARTIST_NAME}/${ALBUM_NAME}"
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR" || exit 1

log "📂 Output directory: $TARGET_DIR"
log ""
log "⏳ Starting download..."
log "─────────────────────────────────────────────────────────────────"

# Search and download using yt-dlp
# Strategy: Search for album tracks on YouTube Music
for i in $(seq 1 "$TRACK_COUNT"); do
    log "🔍 Searching track $i/$TRACK_COUNT..."

    # Search query - try to find the specific track from the album
    SEARCH_QUERY="${ARTIST_NAME} ${ALBUM_NAME} track ${i}"

    # Download using yt-dlp from YouTube Music
    yt-dlp \
        --audio-quality 0 \
        --extract-audio \
        --audio-format mp3 \
        --format "bestaudio/best" \
        --output "${ARTIST_NAME} - ${ALBUM_NAME} - %(title)s.%(ext)s" \
        --embed-metadata \
        --embed-thumbnail \
        --no-playlist \
        "ytsearch1:${SEARCH_QUERY}" 2>&1 | tee -a "$LOG_FILE"

    if [ $? -eq 0 ]; then
        log "   ✅ Track $i downloaded"
    else
        log "   ⚠️  Track $i failed (might not exist)"
    fi

    # Small delay to avoid rate limiting
    sleep 2
done

# Count downloaded files
DOWNLOADED=$(ls -1 *.mp3 2>/dev/null | wc -l)

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ Download complete!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "📊 Statistics:"
log "   Downloaded: $DOWNLOADED tracks"
log "   Requested: $TRACK_COUNT tracks"
log "   Format: $FORMAT"
log "   Location: $MUSIC_DIR/$TARGET_DIR"

# List downloaded tracks
if [ $DOWNLOADED -gt 0 ]; then
    log ""
    log "🎵 Downloaded tracks:"
    ls -lh *.mp3 2>/dev/null | awk '{print "   " $9 " - " $5}'
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
        NOTIFY_MESSAGE="🎵 **Music Download Complete**\n\n"
        NOTIFY_MESSAGE+="📀 **${ALBUM_NAME}**\n"
        NOTIFY_MESSAGE+="🎤 ${ARTIST_NAME}\n\n"
        NOTIFY_MESSAGE+="🎵 Tracks: ${DOWNLOADED}/${TRACK_COUNT}\n"
        NOTIFY_MESSAGE+="🎼 Format: ${FORMAT}\n\n"
        if [ -n "$TOTAL_SIZE" ]; then
            NOTIFY_MESSAGE+="📊 Size: ${TOTAL_SIZE}\n\n"
        fi
        NOTIFY_MESSAGE+="✅ Source: YouTube Music (No Spotify API)"
        NOTIFY_MESSAGE+="\n\n💾 Lokasi: \`${MUSIC_DIR}/${TARGET_DIR}\`"

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
echo "$MUSIC_DIR/$TARGET_DIR"
