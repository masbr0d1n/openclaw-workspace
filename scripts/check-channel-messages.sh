#!/bin/bash
# Check and Process Cross-Channel Messages
# Usage: ./check-channel-messages.sh [CHANNEL_ID]

WORKSPACE_DIR="/home/sysop/.openclaw/workspace"
MESSAGE_BOARD="$WORKSPACE_DIR/.message-board"
MY_CHANNEL_ID="${1:-$DISCORD_CHANNEL_ID}"

if [ -z "$MY_CHANNEL_ID" ]; then
    echo "❌ No channel ID provided"
    echo "Usage: $0 <CHANNEL_ID>"
    exit 1
fi

echo "📬 Checking messages for channel: $MY_CHANNEL_ID"
echo "📁 Message board: $MESSAGE_BOARD"
echo ""

# Find messages for this channel
MESSAGE_COUNT=0

for msg_file in "$MESSAGE_BOARD"/${MY_CHANNEL_ID}-*.msg; do
    if [ -f "$msg_file" ]; then
        MESSAGE_COUNT=$((MESSAGE_COUNT + 1))
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📨 Message #$MESSAGE_COUNT"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        # Parse and display message
        if command -v jq &> /dev/null; then
            FROM=$(jq -r '.from_channel' "$msg_file")
            TIMESTAMP=$(jq -r '.timestamp' "$msg_file")
            PRIORITY=$(jq -r '.priority' "$msg_file")
            MESSAGE=$(jq -r '.message' "$msg_file")
            
            echo "📤 From:      $FROM"
            echo "⏰ Timestamp: $TIMESTAMP"
            echo "🚨 Priority:  $PRIORITY"
            echo "💬 Message:   $MESSAGE"
        else
            cat "$msg_file"
        fi
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        # Mark as processed (optional - uncomment to auto-archive)
        # mv "$msg_file" "${msg_file}.processed"
    fi
done

if [ $MESSAGE_COUNT -eq 0 ]; then
    echo "✅ No new messages for channel $MY_CHANNEL_ID"
else
    echo "📊 Total messages: $MESSAGE_COUNT"
    echo ""
    echo "💡 To mark messages as processed:"
    echo "   mv $MESSAGE_BOARD/${MY_CHANNEL_ID}-*.msg $MESSAGE_BOARD/.processed/"
fi
