#!/bin/bash
# Upload TikTok Video to Telegram
# Uploads the last downloaded TikTok video to Telegram topic 193

WORKSPACE="/home/sysop/.openclaw/workspace"
DOWNLOAD_DIR="$WORKSPACE/tiktok-videos"
CHAT_ID="-1003883313656"
TOPIC_ID="193"

# Get last downloaded video
LAST_VIDEO=$(ls -t "$DOWNLOAD_DIR"/*.mp4 2>/dev/null | head -1)

if [ -z "$LAST_VIDEO" ]; then
    echo "❌ No videos found in $DOWNLOAD_DIR"
    exit 1
fi

VIDEO_PATH="$DOWNLOAD_DIR/$LAST_VIDEO"

# Get file info
FILE_SIZE=$(ls -lh "$VIDEO_PATH" | awk '{print $5}')
FILE_NAME=$(basename "$VIDEO_PATH")

echo "📤 Uploading to Telegram..."
echo "📁 File: $FILE_NAME"
echo "📊 Size: $FILE_SIZE"

# Check file size (Telegram limit is 50MB for uploads)
SIZE_BYTES=$(stat -f%z "$VIDEO_PATH")
MAX_SIZE=$((50 * 1024 * 1024))  # 50MB

if [ $SIZE_BYTES -gt $MAX_SIZE ]; then
    echo "⚠️  File too large for Telegram upload (max 50MB)"
    echo "🔗 File path: $VIDEO_PATH"
    echo ""
    echo "💡 Alternative: Upload manually or use Telegram Bot API"
    exit 1
fi

# Upload using OpenClaw message tool
# First, we need to use message tool with media parameter
echo "📤 Sending to Telegram..."

# Try to upload
/home/sysop/.npm-global/bin/openclaw message send \
    --channel telegram \
    --target "$CHAT_ID" \
    --thread-id "$TOPIC_ID" \
    --message "🎬 **Sample TikTok Download**\n\n📁 $FILE_NAME\n📊 Size: $FILE_SIZE\n\nVideo berhasil didownload dari TikTok!" \
    --media "$VIDEO_PATH" \
    --filename "$FILE_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Upload successful!"
    echo ""
    echo "📊 Uploaded:"
    echo "   File: $FILE_NAME"
    echo "   Size: $FILE_SIZE"
    echo "   Path: $VIDEO_PATH"
else
    echo "❌ Upload failed"
    echo "💡 Try manual upload or check file size"
    exit 1
fi
