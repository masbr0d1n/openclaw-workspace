#!/bin/bash
# Cross-Channel Message System
# Usage: ./send-channel-message.sh <TO_CHANNEL> <MESSAGE>

WORKSPACE_DIR="/home/sysop/.openclaw/workspace"
MESSAGE_BOARD="$WORKSPACE_DIR/.message-board"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Create message board directory
mkdir -p "$MESSAGE_BOARD"

# Parse arguments
TO_CHANNEL="$1"
MESSAGE="$2"
FROM_CHANNEL="${DISCORD_CHANNEL_ID:-unknown}"

if [ -z "$TO_CHANNEL" ] || [ -z "$MESSAGE" ]; then
    echo "❌ Usage: $0 <TO_CHANNEL_ID> <MESSAGE>"
    echo "Example: $0 1475392569193140264 'API updated to v2'"
    exit 1
fi

# Create message file
MESSAGE_FILE="$MESSAGE_BOARD/${TO_CHANNEL}-${TIMESTAMP}.msg"

cat > "$MESSAGE_FILE" << EOF
{
  "version": "1.0",
  "from_channel": "$FROM_CHANNEL",
  "to_channel": "$TO_CHANNEL",
  "timestamp": "$(date -Iseconds)",
  "priority": "normal",
  "requires_ack": false,
  "message": "$MESSAGE",
  "status": "pending"
}
EOF

echo "✅ Message sent to channel $TO_CHANNEL"
echo "📁 Message file: $MESSAGE_FILE"
echo ""
echo "📝 Message content:"
cat "$MESSAGE_FILE" | jq . 2>/dev/null || cat "$MESSAGE_FILE"
