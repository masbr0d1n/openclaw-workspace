# Discord Multi-Channel Workspace Setup

**Created:** 2026-03-01
**Status:** ✅ Active

## Overview

OpenClaw agent sekarang menggunakan **multi-channel workspace** untuk isolasi konteks per Discord channel. Setiap channel punya MEMORY.md sendiri, tetapi tetap bisa mengakses shared context.

## Directory Structure

```
/home/sysop/.openclaw/workspace/
├── shared/                           # GLOBAL context (accessible by ALL channels)
│   ├── AGENTS.md                     # Agent behavior rules
│   ├── MEMORY.md                     # User info, system config, long-term memory
│   ├── SOUL.md                       # Agent identity
│   ├── TOOLS.md                      # Tool configurations
│   └── USER.md                       # User preferences
│
├── discord/
│   └── channels/
│       ├── 1475383980353126402/     # #general
│       │   └── MEMORY.md             # Channel-specific context
│       └── {OTHER_CHANNEL_ID}/       # Other channels...
│           └── MEMORY.md
│
├── scripts/
│   └── load-discord-context.sh       # Context loader script
│
└── commit-workspace.sh               # Auto-commit script (multi-remote aware)
```

## How It Works

### 1. Context Isolation

**Shared Context** (`shared/`):
- ✅ Accessible by ALL Discord channels
- ✅ Accessible by main session (DM)
- ✅ Contains: User info, system config, global rules
- ❌ NOT for: Channel-specific discussions

**Channel Context** (`discord/channels/{ID}/`):
- ✅ ONLY accessible by that specific channel
- ✅ Contains: Channel history, decisions, preferences
- ❌ NOT shared with other channels

### 2. Context Loading Flow

```
User message in Discord → OpenClaw
    ↓
Extract channel ID from metadata
    ↓
Load shared/MEMORY.md (global context)
    ↓
Load discord/channels/{ID}/MEMORY.md (channel context)
    ↓
Agent processes with BOTH contexts
    ↓
Response sent to Discord
    ↓
If context updated → Save to appropriate MEMORY.md
```

### 3. Save Rules

| Context Type | What to Save | Where |
|-------------|--------------|-------|
| **Channel-specific** | Channel discussions, decisions, preferences | `discord/channels/{ID}/MEMORY.md` |
| **Global/User info** | User preferences, system config, projects | `shared/MEMORY.md` |
| **Agent behavior** | Rules, workflows, conventions | `shared/AGENTS.md` |
| **Tools/config** | Tool settings, API keys, scripts | `shared/TOOLS.md` |

## Usage

### For Agent (Automatic)

When responding to Discord messages:

```bash
# Context loading is automatic from metadata
source /home/sysop/.openclaw/workspace/scripts/load-discord-context.sh

# Read contexts
read /home/sysop/.openclaw/workspace/shared/MEMORY.md
read /home/sysop/.openclaw/workspace/discord/channels/${DISCORD_CHANNEL_ID}/MEMORY.md

# Do work...

# Save updates (as needed)
write /home/sysop/.openclaw/workspace/discord/channels/${DISCORD_CHANNEL_ID}/MEMORY.md "..."

# Commit changes
bash /home/sysop/.openclaw/workspace/commit-workspace.sh
```

### For Manual Testing

```bash
# Load context for specific channel
source /home/sysop/.openclaw/workspace/scripts/load-discord-context.sh 1475383980353126402

# Check loaded paths
echo "Shared: $SHARED_CONTEXT_PATH"
echo "Channel: $CHANNEL_CONTEXT_PATH"
echo "Channel ID: $DISCORD_CHANNEL_ID"
```

## Benefits

✅ **Context Isolation:** Each channel has its own memory
✅ **Shared Knowledge:** Global context accessible by all channels
✅ **Privacy:** Channel-specific discussions don't leak
✅ **Flexibility:** Easy to add new channels
✅ **Backup:** Git-tracked workspace with auto-commit

## Current Channels

| Channel ID | Channel Name | Status |
|------------|--------------|--------|
| 1475383980353126402 | #general | ✅ Active |

## Automation

### Auto-Commit After Tasks

Setiap kali agent selesai task yang memodifikasi file:

```bash
bash /home/sysop/.openclaw/workspace/commit-workspace.sh
```

Script ini akan:
- Check untuk perubahan
- Add semua file yang berubah
- Commit dengan timestamp
- Push ke remote repository (jika sudah di-setup)

### Multi-Remote Push

Workspace sudah siap untuk push ke 2 repo sekaligus:

```bash
# Setup (saat siap)
git remote add origin https://github.com/[user]/workspace.git
git remote set-url --add --push origin https://github.com/[user]/workspace.git
git remote set-url --add --push origin https://[forgejo]/[user]/workspace.git

# Setelah setup, setiap git push akan push ke kedua repo
```

## Troubleshooting

**Channel workspace tidak ada?**
```bash
mkdir -p /home/sysop/.openclaw/workspace/discord/channels/{CHANNEL_ID}
echo "# MEMORY.md - Discord Channel {CHANNEL_ID}" > /home/sysop/.openclaw/workspace/discord/channels/{CHANNEL_ID}/MEMORY.md
```

**Shared context tidak accessible?**
```bash
ls -la /home/sysop/.openclaw/workspace/shared/
```

**Git push gagal?**
```bash
# Cek remote
git remote -v

# Cek branch
git branch

# Cek status
git status
```

## Future Enhancements

- [ ] Auto-create channel workspace on first message
- [ ] Channel-specific tools and scripts
- [ ] Cross-channel context sharing (opt-in)
- [ ] Channel analytics and stats
- [ ] Backup to multiple remotes automatically

## Related Files

- Agent rules: `shared/AGENTS.md`
- Context loader: `scripts/load-discord-context.sh`
- Auto-commit: `commit-workspace.sh`
- Git automation: `GIT_AUTOMATION_COMPLETE.md`
