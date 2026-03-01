#!/bin/bash
# Video Monitor - Check new videos from multiple platforms
# TikTok, YouTube, Instagram, etc.

WORKSPACE="/home/sysop/.openclaw/workspace"
STATE_FILE="$WORKSPACE/video-monitor-state.txt"
LOG_FILE="$WORKSPACE/video-monitor.log"

TELEGRAM_CHAT="-1003883313656"
TELEGRAM_TOPIC="607"

# Accounts to monitor (format: platform:username)
ACCOUNTS=(
    "tiktok:trendingart2"
    # Add more accounts here:
    # "youtube:username"
    # "instagram:username"
)

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Initialize state
init_state() {
    if [[ ! -f "$STATE_FILE" ]]; then
        touch "$STATE_FILE"
        log "State initialized"
    fi
}

# Get last seen video
get_last_seen() {
    local account="$1"
    while IFS='=' read -r key value; do
        if [[ "$key" == "$account" ]]; then
            echo "$value"
            return
        fi
    done < "$STATE_FILE"
    echo ""
}

# Save state
save_state() {
    local account="$1"
    local video_id="$2"
    
    # Update or append to state file
    local temp_file="${STATE_FILE}.tmp"
    
    # Keep existing entries except current account
    if [[ -f "$STATE_FILE" ]]; then
        grep -v "^${account}=" "$STATE_FILE" > "$temp_file" 2>/dev/null || true
    fi
    
    # Add/update current account
    echo "${account}=${video_id}" >> "$temp_file"
    mv "$temp_file" "$STATE_FILE"
    
    log "Updated $account: $video_id"
}

# Check TikTok videos
check_tiktok() {
    local username="$1"
    
    log "Checking TikTok: @$username"
    
    # Get latest videos using yt-dlp (suppress all warnings/errors to stdout)
    local videos=$(yt-dlp --print "%(id)s|%(title)s|%(upload_date)s" --skip-download --playlist-end 3 "https://www.tiktok.com/@$username" 2>/dev/null | head -1)
    
    if [[ -z "$videos" ]]; then
        log "✗ Failed to fetch TikTok: $username"
        return 1
    fi
    
    # Parse videos (format: id|title|date)
    local latest_id=$(echo "$videos" | cut -d'|' -f1)
    local latest_title=$(echo "$videos" | cut -d'|' -f2 | head -c 80)  # Truncate long titles
    local latest_date=$(echo "$videos" | cut -d'|' -f3)
    
    if [[ -z "$latest_id" ]]; then
        log "✗ No videos found for @$username"
        return 1
    fi
    
    echo "$latest_id|$latest_title|$latest_date|$username|TikTok"
}

# Check YouTube videos
check_youtube() {
    local username="$1"
    local account_key="youtube:${username}"
    
    log "Checking YouTube: @$username"
    
    # Get latest videos
    local videos=$(yt-dlp --print "%(id)s|%(title)s|%(upload_date)s" --skip-download --playlist-end 3 "https://www.youtube.com/@$username/videos" 2>&1 | grep -v "WARNING" | head -1)
    
    if [[ -z "$videos" ]]; then
        log "✗ Failed to fetch YouTube: $username"
        return 1
    fi
    
    local latest_id=$(echo "$videos" | cut -d'|' -f1)
    local latest_title=$(echo "$videos" | cut -d'|' -f2 | head -c 100)
    local latest_date=$(echo "$videos" | cut -d'|' -f3)
    
    if [[ -z "$latest_id" ]]; then
        log "✗ No videos found for @$username"
        return 1
    fi
    
    echo "$latest_id|$latest_title|$latest_date|$username|YouTube"
}

# Send notification to Telegram
send_notification() {
    local account="$1"
    local video_id="$2"
    local title="$3"
    local platform="$4"
    local date="$5"
    
    local video_url=""
    
    if [[ "$platform" == "TikTok" ]]; then
        video_url="https://www.tiktok.com/@${account}/video/${video_id}"
    elif [[ "$platform" == "YouTube" ]]; then
        video_url="https://www.youtube.com/watch?v=${video_id}"
    fi
    
    # Format date nicely
    local formatted_date="$date"
    if [[ -n "$date" ]] && [[ ${#date} -eq 8 ]]; then
        formatted_date="${date:0:4}${date:4:5}-${date:6:8}"
    fi
    
    local message="📹 **NEW VIDEO from $platform!**

👤 Creator: @$account
📅 Upload: $formatted_date

🎬 **Title:** $title

🔗 Watch: $video_url"

    # Send via OpenClaw
    /home/sysop/.npm-global/bin/openclaw message send \
        --channel telegram \
        --target "$TELEGRAM_CHAT" \
        --thread-id "$TELEGRAM_TOPIC" \
        --message "$message" 2>&1
    
    log "✓ Notification sent for @$account"
}

# Main check function
main() {
    init_state
    log "=== Video Monitor Check Started ==="
    
    local updates_found=0
    
    for account_spec in "${ACCOUNTS[@]}"; do
        IFS=':' read -r platform username <<< "$account_spec"
        
        local account_key="${platform}:${username}"
        local last_seen=$(get_last_seen "$account_key")
        
        # Platform-specific check
        local video_info=""
        
        if [[ "$platform" == "tiktok" ]]; then
            video_info=$(check_tiktok "$username")
        elif [[ "$platform" == "youtube" ]]; then
            video_info=$(check_youtube "$username")
        fi
        
        if [[ -z "$video_info" ]]; then
            continue
        fi
        
        IFS='|' read -r video_id title date creator platform_name <<< "$video_info"
        
        if [[ "$video_id" != "$last_seen" ]]; then
            log "🎉 NEW VIDEO from $platform_name: @$creator"
            send_notification "$creator" "$video_id" "$title" "$platform_name" "$date"
            save_state "$account_key" "$video_id"
            ((updates_found++))
        else
            log "✓ No new videos for @$creator"
        fi
    done
    
    log "=== Check Complete: $updates_found updates ==="
}

# Run main function
main
