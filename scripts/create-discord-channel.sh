#!/bin/bash
# Auto-Create Discord Channel Workspace
# Usage: ./create-discord-channel.sh <CHANNEL_ID> [CHANNEL_NAME]

WORKSPACE_DIR="/home/sysop/.openclaw/workspace"
CHANNEL_ID="$1"
CHANNEL_NAME="${2:-unknown}"

if [ -z "$CHANNEL_ID" ]; then
    echo "❌ Usage: $0 <CHANNEL_ID> [CHANNEL_NAME]"
    echo "Example: $0 1475383980353126402 general"
    exit 1
fi

CHANNEL_DIR="$WORKSPACE_DIR/discord/channels/$CHANNEL_ID"

# Check if already exists
if [ -d "$CHANNEL_DIR" ]; then
    echo "ℹ️  Channel workspace already exists: $CHANNEL_DIR"
    exit 0
fi

# Create directory structure
echo "📁 Creating channel workspace..."
mkdir -p "$CHANNEL_DIR"

# Create MEMORY.md
cat > "$CHANNEL_DIR/MEMORY.md" << EOF
# MEMORY.md - Discord Channel #$CHANNEL_NAME

**Channel ID:** $CHANNEL_ID
**Channel Name:** #$CHANNEL_NAME
**Created:** $(date +%Y-%m-%d)

## Channel Context

This is the #$CHANNEL_NAME channel.

## Channel-Specific Events

### $(date +%Y-%m-%d)

- Channel workspace created

## Channel-Specific Rules

- Channel-specific context and decisions go here

## Related Topics

- Shared memory: \`/home/sysop/.openclaw/workspace/shared/MEMORY.md\`
- Agent behavior: \`/home/sysop/.openclaw/workspace/shared/AGENTS.md\`
EOF

# Create SOUL.md (channel-specific persona)
cat > "$CHANNEL_DIR/SOUL.md" << EOF
# SOUL.md - Channel #$CHANNEL_NAME

**Channel:** #$CHANNEL_NAME ($CHANNEL_ID)
**Role:** Specialist Assistant

## Personality

- Tone: Friendly, helpful, professional
- Style: Adapts to channel context
- Focus: Channel-specific topics

## Channel Context

This channel is for: $CHANNEL_NAME discussions

## Behavior

- Remember channel-specific context
- Reference channel MEMORY.md for history
- Keep conversations relevant to channel topic
EOF

# Create AGENTS.md (channel-specific workflow)
cat > "$CHANNEL_DIR/AGENTS.md" << EOF
# AGENTS.md - Channel #$CHANNEL_NAME

## Channel Workflow

1. **Load Context:**
   - Read shared/MEMORY.md (global context)
   - Read discord/channels/$CHANNEL_ID/MEMORY.md (channel context)

2. **Process Message:**
   - Understand user request
   - Check channel-specific rules
   - Apply specialized knowledge

3. **Save Updates:**
   - Channel decisions → discord/channels/$CHANNEL_ID/MEMORY.md
   - Global updates → shared/MEMORY.md

4. **Commit Changes:**
   - Run: bash /home/sysop/.openclaw/workspace/commit-workspace.sh

## Channel Rules

- Keep discussions relevant to #$CHANNEL_NAME
- Save channel-specific context to channel MEMORY.md
- Use shared context for global information
EOF

echo "✅ Channel workspace created: $CHANNEL_DIR"
echo ""
echo "📁 Files created:"
ls -lh "$CHANNEL_DIR"
echo ""
echo "📝 Next steps:"
echo "  1. Edit $CHANNEL_DIR/MEMORY.md with channel details"
echo "  2. Edit $CHANNEL_DIR/SOUL.md with channel persona"
echo "  3. Edit $CHANNEL_DIR/AGENTS.md with channel workflow"
echo ""
echo "🚀 Ready to use!"
