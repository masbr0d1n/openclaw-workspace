#!/bin/bash
# Load Discord channel context
# Usage: source this script at the beginning of Discord sessions

# Detect channel from environment or metadata
# OpenClaw provides channel info via inbound metadata
DISCORD_CHANNEL_ID="${DISCORD_CHANNEL_ID:-${1}}"
DISCORD_GUILD_ID="${DISCORD_GUILD_ID:-}"

# Default to current channel if not specified
if [ -z "$DISCORD_CHANNEL_ID" ]; then
    DISCORD_CHANNEL_ID="1475383980353126402"  # #general default
fi

# Paths
WORKSPACE_ROOT="/home/sysop/.openclaw/workspace"
SHARED_CTX="$WORKSPACE_ROOT/shared"
CHANNEL_CTX="$WORKSPACE_ROOT/discord/channels/$DISCORD_CHANNEL_ID"

# Create channel workspace if not exists
if [ ! -d "$CHANNEL_CTX" ]; then
    mkdir -p "$CHANNEL_CTX"
    echo "# MEMORY.md - Discord Channel $DISCORD_CHANNEL_ID" > "$CHANNEL_CTX/MEMORY.md"
    echo "Created: $(date)" >> "$CHANNEL_CTX/MEMORY.md"
    echo "✅ Created channel workspace: $CHANNEL_CTX"
fi

# Export paths for use in scripts and agent
export WORKSPACE_ROOT
export SHARED_CONTEXT_PATH="$SHARED_CTX"
export CHANNEL_CONTEXT_PATH="$CHANNEL_CTX"
export DISCORD_CHANNEL_ID
export DISCORD_GUILD_ID

# Output status (only if not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo "📂 Discord Channel Context Loaded"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Channel ID:   $DISCORD_CHANNEL_ID"
    echo "Guild ID:     ${DISCORD_GUILD_ID:-unknown}"
    echo "Shared ctx:   $SHARED_CTX"
    echo "Channel ctx:  $CHANNEL_CTX"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check what's available
    echo ""
    echo "📋 Available in shared context:"
    ls -1 "$SHARED_CTX" | sed 's/^/  - /'
    
    if [ -d "$CHANNEL_CTX" ]; then
        echo ""
        echo "📋 Available in channel context:"
        ls -1 "$CHANNEL_CTX" | sed 's/^/  - /'
    fi
fi
