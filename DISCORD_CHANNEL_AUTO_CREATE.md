# Discord Channel Workspace - Auto-Create Guide

**Created:** 2026-03-07  
**Status:** ✅ Active

---

## 📋 **FAQ**

### **Apakah folder `discord/` otomatis dibuat oleh OpenClaw?**

**Jawaban: TIDAK** ❌

Folder `discord/channels/{CHANNEL_ID}/` adalah **custom structure** yang harus dibuat manual atau dengan script.

**Default OpenClaw:**
```
❌ Tidak otomatis buat folder discord/
❌ Tidak ada channel isolation
✅ Semua channel pakai workspace yang sama
```

**Custom Setup (Recommended):**
```
✅ Manual create dengan script
✅ Channel-specific context
✅ Isolated memory per channel
```

---

## 🔧 **Cara Buat Channel Workspace**

### **Option 1: Pakai Script (RECOMMENDED)** ⭐

**Script auto-create sudah tersedia:**
```bash
bash /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh <CHANNEL_ID> <CHANNEL_NAME>
```

**Contoh:**
```bash
# Create #general channel workspace
bash /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh 1475383980353126402 general

# Create #frontend-dev channel workspace
bash /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh 1476052074415394938 frontend-dev

# Create #backend-dev channel workspace
bash /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh 1475392569193140264 backend-dev

# Create #qa-testing channel workspace
bash /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh 1479087649804521524 qa-testing
```

**Script akan otomatis buat:**
- ✅ Folder: `discord/channels/{CHANNEL_ID}/`
- ✅ `MEMORY.md` - Channel context & history
- ✅ `SOUL.md` - Channel-specific persona
- ✅ `AGENTS.md` - Channel workflow & rules

---

### **Option 2: Manual Create**

**Step-by-step:**

```bash
# 1. Create folder
mkdir -p /home/sysop/.openclaw/workspace/discord/channels/1476052074415394938

# 2. Create MEMORY.md
cat > /home/sysop/.openclaw/workspace/discord/channels/1476052074415394938/MEMORY.md << 'EOF'
# MEMORY.md - Discord Channel #frontend-dev

**Channel ID:** 1476052074415394938
**Channel Name:** #frontend-dev
**Created:** 2026-03-07

## Channel Context

Frontend development discussions, UI/UX, React, Next.js, CSS.

## Channel Events

### 2026-03-07
- Channel workspace created
EOF

# 3. Create SOUL.md
cat > /home/sysop/.openclaw/workspace/discord/channels/1476052074415394938/SOUL.md << 'EOF'
# SOUL.md - Frontend Specialist

**Channel:** #frontend-dev
**Role:** Frontend Development Expert

## Expertise
- React, Next.js, Vue, Angular
- CSS, Tailwind, Sass
- UI/UX Design
- Performance Optimization
- Accessibility (a11y)

## Personality
- Technical but friendly
- Code-focused
- Best practices advocate
EOF

# 4. Create AGENTS.md
cat > /home/sysop/.openclaw/workspace/discord/channels/1476052074415394938/AGENTS.md << 'EOF'
# AGENTS.md - Frontend Channel Workflow

## Workflow
1. Load shared context
2. Load channel context
3. Process frontend-related queries
4. Save channel-specific decisions
5. Commit changes

## Channel Rules
- Frontend topics only
- Provide code examples
- Follow best practices
EOF
```

---

### **Option 3: Auto-Create on First Message** (Advanced)

**Setup webhook/hook untuk auto-create:**

```bash
# Add to OpenClaw config or create a listener script
cat > /home/sysop/.openclaw/workspace/scripts/auto-create-channel.js << 'EOF'
// Auto-create channel workspace on first message
const fs = require('fs');
const path = require('path');

function createChannelWorkspace(channelId, channelName) {
  const channelDir = path.join(
    process.env.HOME,
    '.openclaw/workspace/discord/channels',
    channelId
  );

  if (fs.existsSync(channelDir)) {
    console.log(`Channel workspace already exists: ${channelDir}`);
    return;
  }

  fs.mkdirSync(channelDir, { recursive: true });

  // Create MEMORY.md
  fs.writeFileSync(
    path.join(channelDir, 'MEMORY.md'),
    `# MEMORY.md - Discord Channel #${channelName}

**Channel ID:** ${channelId}
**Channel Name:** #${channelName}
**Created:** ${new Date().toISOString().split('T')[0]}

## Channel Context

Auto-created on first message.
`
  );

  console.log(`✅ Channel workspace created: ${channelDir}`);
}

// Usage: node auto-create-channel.js <CHANNEL_ID> <CHANNEL_NAME>
const [,, channelId, channelName] = process.argv;
if (channelId && channelName) {
  createChannelWorkspace(channelId, channelName);
} else {
  console.log('Usage: node auto-create-channel.js <CHANNEL_ID> <CHANNEL_NAME>');
}
EOF

# Make executable
chmod +x /home/sysop/.openclaw/workspace/scripts/auto-create-channel.js
```

---

## 📁 **Struktur Folder**

```
/home/sysop/.openclaw/workspace/
├── discord/
│   └── channels/
│       ├── 1475383980353126402/     # #general
│       │   ├── MEMORY.md            # Channel context
│       │   ├── SOUL.md              # Channel persona
│       │   └── AGENTS.md            # Channel workflow
│       ├── 1476052074415394938/     # #frontend-dev
│       │   ├── MEMORY.md
│       │   ├── SOUL.md
│       │   └── AGENTS.md
│       ├── 1475392569193140264/     # #backend-dev
│       │   ├── MEMORY.md
│       │   ├── SOUL.md
│       │   └── AGENTS.md
│       └── 1479087649804521524/     # #qa-testing
│           ├── MEMORY.md
│           ├── SOUL.md
│           └── AGENTS.md
├── shared/                          # GLOBAL context
│   ├── MEMORY.md
│   ├── SOUL.md
│   ├── AGENTS.md
│   ├── TOOLS.md
│   └── USER.md
└── scripts/
    └── create-discord-channel.sh    # Auto-create script
```

---

## 🎯 **Best Practices**

### **DO:**
- ✅ Create channel workspace BEFORE first message
- ✅ Customize SOUL.md per channel (different persona)
- ✅ Update MEMORY.md with channel decisions
- ✅ Use AGENTS.md for channel-specific workflow
- ✅ Commit changes after each session

### **DON'T:**
- ❌ Share channel-specific info to other channels
- ❌ Put global config in channel folder
- ❌ Forget to update channel MEMORY.md
- ❌ Use same SOUL.md for all channels

---

## 🚀 **Quick Start**

**Create workspace for all your channels:**

```bash
# Get channel IDs (Discord Developer Mode required)
# Right-click channel → Copy Channel ID

# Create workspaces
bash /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh 1475383980353126402 general
bash /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh 1476052074415394938 frontend-dev
bash /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh 1475392569193140264 backend-dev
bash /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh 1479087649804521524 qa-testing

# Verify
ls -la /home/sysop/.openclaw/workspace/discord/channels/

# Commit
bash /home/sysop/.openclaw/workspace/commit-workspace.sh
```

---

## 📊 **Current Channels**

| Channel ID | Channel Name | Status | Created |
|------------|--------------|--------|---------|
| 1475383980353126402 | #general | ✅ Active | 2026-03-01 |
| 1476052074415394938 | #frontend-dev | ✅ Created | 2026-03-07 |
| 1475392569193140264 | #backend-dev | ⏳ Pending | - |
| 1479087649804521524 | #qa-testing | ⏳ Pending | - |

---

## 🔍 **Troubleshooting**

**Folder tidak ter-create?**
```bash
# Check permissions
ls -la /home/sysop/.openclaw/workspace/

# Create manually
mkdir -p /home/sysop/.openclaw/workspace/discord/channels/{CHANNEL_ID}

# Run script with bash
bash /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh {CHANNEL_ID} {NAME}
```

**Files tidak muncul?**
```bash
# Check script exists
ls -lh /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh

# Re-run script
bash /home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh {CHANNEL_ID} {NAME}
```

**Context tidak ter-load?**
```bash
# Verify file contents
cat /home/sysop/.openclaw/workspace/discord/channels/{CHANNEL_ID}/MEMORY.md

# Check OpenClaw config
cat ~/.openclaw/openclaw.json | grep -A 20 '"memory"'
```

---

## 📚 **Related Documentation**

- [Multi-Channel Setup](./DISCORD_MULTI_CHANNEL_SETUP.md)
- [QMD Memory System](./QMD_MEMORY_SETUP.md)
- [Git Automation](./GIT_AUTOMATION_COMPLETE.md)

---

**Last Updated:** 2026-03-07  
**Script Location:** `/home/sysop/.openclaw/workspace/scripts/create-discord-channel.sh`  
**Status:** ✅ Production Ready
