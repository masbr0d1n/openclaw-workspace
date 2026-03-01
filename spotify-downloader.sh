#!/bin/bash
# Spotify Album/Playlist Downloader
# Downloads albums or playlists from Spotify URLs using spotdl

WORKSPACE="/home/sysop/.openclaw/workspace"
MUSIC_DIR="$WORKSPACE/music"
LOG_FILE="$WORKSPACE/spotify-downloader.log"
CHAT_ID="-1003883313656"
TOPIC_ID="193"

# Configuration
URL="$1"  # Spotify URL (album, playlist, or track)
FORMAT="${2:-mp3}"  # Output format: mp3, flac, ogg, opus
DOWNLOAD_LYRICS="${3:-false}"  # Download lyrics: true/false
NOTIFY="${4:-false}"  # Send notification to Telegram: true/false

# Create music directory
mkdir -p "$MUSIC_DIR"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

if [ -z "$URL" ]; then
    log "❌ Usage: $0 <spotify_url> [format] [download_lyrics] [notify]"
    log ""
    log "Examples:"
    log "  $0 'https://open.spotify.com/album/...' mp3 true true"
    log "  $0 'https://open.spotify.com/playlist/...' flac false false"
    exit 1
fi

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🎵 Spotify Downloader Starting"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "📝 Configuration:"
log "   URL: $URL"
log "   Format: $FORMAT"
log "   Lyrics: $DOWNLOAD_LYRICS"
log "   Notify: $NOTIFY"
log "   Output: $MUSIC_DIR"
log ""

# Change to music directory
cd "$MUSIC_DIR" || exit 1

# Check if URL is valid
if [[ ! "$URL" =~ spotify\.com ]]; then
    log "❌ Invalid Spotify URL"
    exit 1
fi

# Build spotdl command
SPOTDL_CMD="spotdl download \"$URL\" --format $FORMAT --output \"{artist}/{album}/{artist} - {track}.{ext}\""

# Add lyrics option if requested
if [ "$DOWNLOAD_LYRICS" = "true" ]; then
    SPOTDL_CMD="$SPOTDL_CMD --lyrics genius"
    log "📝 Lyrics: Enabled (Genius)"
fi

log "⏳ Starting download..."
log "─────────────────────────────────────────────────────────────────"

# Download using spotdl
eval $SPOTDL_CMD 2>&1 | tee -a "$LOG_FILE"

# Count downloaded files
TRACK_COUNT=$(find . -name "*.mp3" -o -name "*.flac" -o -name "*.ogg" -o -name "*.opus" 2>/dev/null | wc -l)

log ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "✅ Download complete!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log ""
log "📊 Statistics:"
log "   Tracks downloaded: $TRACK_COUNT"
log "   Format: $FORMAT"
log "   Location: $MUSIC_DIR"

# List downloaded tracks
if [ $TRACK_COUNT -gt 0 ]; then
    log ""
    log "🎵 Downloaded tracks:"
    find . -type f \( -name "*.mp3" -o -name "*.flac" -o -name "*.ogg" -o -name "*.opus" \) -exec ls -lh {} \; | awk '{print "   " $9 " - " $5}'
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

    if [ $TRACK_COUNT -gt 0 ]; then
        NOTIFY_MESSAGE="🎵 **Spotify Download Complete**\n\n"
        NOTIFY_MESSAGE+="📀 Album/Playlist\n\n"
        NOTIFY_MESSAGE+="🎵 Tracks: $TRACK_COUNT\n"
        NOTIFY_MESSAGE+="🎼 Format: $FORMAT\n\n"
        if [ -n "$TOTAL_SIZE" ]; then
            NOTIFY_MESSAGE+="📊 Size: $TOTAL_SIZE\n\n"
        fi
        NOTIFY_MESSAGE+="✅ Disimpan di: $MUSIC_DIR"

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
