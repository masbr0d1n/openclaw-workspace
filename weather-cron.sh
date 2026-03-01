#!/bin/bash
# Simple weather update - runs every 3 hours
# Sends to topic 23 (Lingkungan Hidup)

TELEGRAM_CHAT="-1003883313656"
TELEGRAM_TOPIC="23"

DATE=$(date +"%A, %d %b %Y" | sed 's/Monday/Senin/;s/Tuesday/Selasa/;s/Wednesday/Rabu/;s/Thursday/Kamis/;s/Friday/Jumat/;s/Saturday/Sabtu/;s/Sunday/Minggu/')

# Get weather with timeout (increased to 15s, retry once if fails)
get_weather() {
    local loc="$1"
    local result=$(timeout 15 curl -s "wttr.in/${loc}?format=3" 2>/dev/null)
    if [[ -z "$result" ]]; then
        sleep 2
        result=$(timeout 15 curl -s "wttr.in/${loc}?format=3" 2>/dev/null || echo "${loc}: ? Data error")
    fi
    echo "$result"
}

BOJONGGEDE=$(get_weather "Bojonggede")
PANCORAN=$(get_weather "Pancoran")

# Calculate next update time (3 hours from now)
NEXT_UPDATE=$(date -d "+3 hours" +%H:%M)

MESSAGE="🌤️ PRAKIRAAN CUACA
📅 $DATE | ⏰ $(date +%H:%M) WIB

📍 Bojonggede - Bogor
$BOJONGGEDE

📍 Pancoran - Jakarta Selatan
$PANCORAN

⏰ Update berikutnya: $NEXT_UPDATE WIB"

# Send to Telegram topic 23 (Lingkungan Hidup)
openclaw message send --channel telegram --target "$TELEGRAM_CHAT" --thread-id "$TELEGRAM_TOPIC" --message "$MESSAGE"

# Also output to stdout for logging
echo "$MESSAGE"
