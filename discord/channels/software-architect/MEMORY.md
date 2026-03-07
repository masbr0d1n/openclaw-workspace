# MEMORY.md - Software Architecture Channel

**Channel:** #software-architecture  
**Channel ID:** Pending (create with script)  
**Created:** 2026-03-07  
**Specialization:** Software Architecture & OpenClaw Configuration

---

## 🎯 **Channel Purpose**

This channel is dedicated to:
- Software architecture design & reviews
- System design patterns & best practices
- OpenClaw configuration & optimization
- Technology selection & evaluation
- Infrastructure & DevOps discussions
- API design & integration strategies

---

## 📋 **Architecture Decisions**

### **2026-03-07: Channel Setup**

**Decision:** Create dedicated Software Architect persona

**Context:**
- Need specialized agent for architecture discussions
- OpenClaw configuration requires deep expertise
- Multi-channel setup needs proper documentation

**Decision:**
- Create SOUL.md with architect persona
- Define workflow for architecture reviews
- Establish documentation standards (ADRs)

**Consequences:**
- ✅ Better architecture guidance
- ✅ Consistent documentation
- ✅ Clear decision-making process
- ⚠️  Requires maintenance of ADRs

---

## 🏗️ **OpenClaw Architecture**

### **Current Setup**

```
/home/sysop/.openclaw/
├── workspace/
│   ├── shared/                    # Global context
│   │   ├── MEMORY.md
│   │   ├── SOUL.md
│   │   ├── AGENTS.md
│   │   ├── TOOLS.md
│   │   └── USER.md
│   ├── discord/
│   │   └── channels/
│   │       ├── {CHANNEL_ID}/     # Channel-specific
│   │       │   ├── SOUL.md       # Architect persona
│   │       │   ├── MEMORY.md
│   │       │   └── AGENTS.md
│   │       └── software-architect/
│   └── scripts/
│       ├── create-discord-channel.sh
│       └── qmd-*.sh
├── openclaw.json                  # Main config
└── cache/qmd/                     # Memory index
```

### **Configuration Highlights**

**Memory System:**
- Backend: QMD (Quick Markdown)
- Collections: memory-root, memory-daily, discord-channels
- Update: Hourly (qmd update)
- Embeddings: Daily at 03:00 (qmd embed)

**Channel Isolation:**
- Each Discord channel has own workspace folder
- Shared context accessible by all channels
- Channel-specific context isolated

**Agent Orchestration:**
- Default model: qwen3.5-plus (1M context)
- Coding tasks: qwen3-coder-plus
- Sub-agents for specialized tasks

---

## 📐 **Design Patterns Used**

### **1. Multi-Channel Workspace Pattern**

**Problem:** Need isolated context per Discord channel

**Solution:**
```
discord/channels/
├── {CHANNEL_ID_1}/
│   └── MEMORY.md    # Channel 1 context
├── {CHANNEL_ID_2}/
│   └── MEMORY.md    # Channel 2 context
└── shared/
    └── MEMORY.md    # Global context
```

**Benefits:**
- ✅ Context isolation
- ✅ Prevents knowledge leakage
- ✅ Channel-specific customization
- ✅ Shared knowledge accessible

### **2. Memory Persistence Pattern**

**Problem:** Agent needs long-term memory across sessions

**Solution:**
- File-based: MEMORY.md files (Git-tracked)
- Database: SQLite via QMD
- Vector embeddings for semantic search
- Auto-sync with cron jobs

**Benefits:**
- ✅ Persistent across restarts
- ✅ Searchable (text + semantic)
- ✅ Version controlled (Git)
- ✅ Backup-friendly

### **3. Auto-Commit Pattern**

**Problem:** Need to track all workspace changes

**Solution:**
```bash
# After every task that modifies files
bash /home/sysop/.openclaw/workspace/commit-workspace.sh
```

**Git Hooks:**
- Pre-commit: Database backup
- Post-commit: Auto-push to remote

**Benefits:**
- ✅ Automatic versioning
- ✅ Disaster recovery
- ✅ Audit trail
- ✅ Sync to cloud

---

## 🔧 **Configuration Standards**

### **openclaw.json Structure**

```json
{
  "memory": {
    "backend": "qmd",
    "citations": "auto",
    "qmd": {
      "paths": [...],
      "update": {...},
      "limits": {...}
    }
  },
  "channels": {
    "discord": {
      "enabled": true,
      "guilds": {...}
    }
  },
  "agents": {
    "defaults": {
      "model": "qwen3.5-plus",
      "timeoutSeconds": 180
    }
  },
  "commands": {
    "native": "auto",
    "nativeSkills": "auto"
  }
}
```

### **Best Practices**

1. **Config Management:**
   - Keep config in Git
   - Use environment variables for secrets
   - Backup before major changes

2. **Memory Configuration:**
   - Index important folders
   - Schedule regular updates
   - Monitor index health

3. **Channel Setup:**
   - Create workspace before first message
   - Customize SOUL.md per channel
   - Document channel-specific rules

---

## 📊 **System Metrics**

### **Current Performance**

| Metric | Value | Status |
|--------|-------|--------|
| **Files Indexed** | 20+ | ✅ Good |
| **Embeddings** | 46 vectors | ✅ Complete |
| **Search Latency** | <1s | ✅ Fast |
| **Cron Jobs** | 2 active | ✅ Running |
| **Git Remote** | GitHub + Forgejo | ✅ Synced |

### **Resource Usage**

| Resource | Usage | Limit |
|----------|-------|-------|
| **Disk (workspace)** | ~50MB | 10GB |
| **QMD Index** | 3.4MB | 100MB |
| **Memory (agent)** | ~100MB | 1GB |
| **CPU (embeddings)** | 100% (during) | - |

---

## 🚀 **Optimization Opportunities**

### **Short-term**
- [ ] Setup GPU acceleration for embeddings
- [ ] Add more channel workspaces
- [ ] Implement ADR template
- [ ] Create architecture review checklist

### **Long-term**
- [ ] Multi-machine sync (rsync)
- [ ] Automated architecture validation
- [ ] Performance monitoring dashboard
- [ ] Cost optimization analysis

---

## 📚 **Reference Architecture**

### **OpenClaw Deployment**

```
┌─────────────────────────────────────────┐
│           Discord Gateway               │
│  (Bot receives messages, sends replies) │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         OpenClaw Gateway                │
│  (Message routing, session management)  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│            Agent Session                │
│  (Context loading, tool execution)      │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Memory (QMD) │  │ Tools (APIs) │
│ - Files      │  │ - Web search │
│ - Database   │  │ - Browser    │
│ - Embeddings │  │ - Exec       │
└──────────────┘  └──────────────┘
```

---

## 🎯 **Next Steps**

1. **Channel Setup:**
   - Create workspace for all active channels
   - Customize SOUL.md per channel
   - Test context isolation

2. **Documentation:**
   - Create ADR template
   - Document existing decisions
   - Setup architecture review process

3. **Optimization:**
   - Monitor QMD performance
   - Optimize embedding generation
   - Setup GPU acceleration (optional)

4. **Automation:**
   - Auto-create channel workspaces
   - Automated backup verification
   - Health check cron jobs

---

## 📝 **Change Log**

| Date | Change | Author |
|------|--------|--------|
| 2026-03-07 | Channel created, SOUL.md defined | Software Architect |
| 2026-03-07 | Memory system configured (QMD) | Software Architect |
| 2026-03-07 | Auto-create script created | Software Architect |

---

**Last Updated:** 2026-03-07  
**Version:** 1.0  
**Status:** ✅ Active
