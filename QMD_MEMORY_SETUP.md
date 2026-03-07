# QMD Memory System - Setup & Configuration

**Created:** 2026-03-06  
**Status:** ✅ Active  
**Last Updated:** 2026-03-06 22:53

---

## 📋 Overview

QMD (Quick Markdown) adalah sistem memory persistence untuk OpenClaw yang menggunakan:
- **Text indexing** untuk fast search
- **Vector embeddings** untuk semantic search
- **SQLite database** untuk storage

---

## ✅ Setup Summary

### **Configuration**

**File:** `~/.openclaw/openclaw.json`

```json
{
  "memory": {
    "backend": "qmd",
    "citations": "auto",
    "qmd": {
      "includeDefaultMemory": true,
      "paths": [
        {
          "path": "/home/sysop/.openclaw/workspace",
          "name": "memory-root",
          "pattern": "MEMORY.md"
        },
        {
          "path": "/home/sysop/.openclaw/workspace/memory",
          "name": "memory-daily",
          "pattern": "**/*.md"
        },
        {
          "path": "/home/sysop/.openclaw/workspace/discord",
          "name": "discord-channels",
          "pattern": "**/*.md"
        }
      ],
      "update": {
        "interval": "5m",
        "debounceMs": 15000,
        "waitForBootSync": true
      },
      "limits": {
        "maxResults": 10,
        "timeoutMs": 8000
      }
    }
  }
}
```

### **Indexed Collections**

| Collection | Path | Pattern | Files |
|------------|------|---------|-------|
| `memory-root` | `/home/sysop/.openclaw/workspace` | `MEMORY.md` | 1 |
| `memory-daily` | `/home/sysop/.openclaw/workspace/memory` | `**/*.md` | 17+ |
| `discord-channels` | `/home/sysop/.openclaw/workspace/discord` | `**/*.md` | Variable |

---

## 🔧 Cron Jobs

### **Schedule**

| Job | Schedule | Command | Duration |
|-----|----------|---------|----------|
| **Hourly Update** | `0 * * * *` (every hour) | `qmd-hourly-update.sh` | ~5-10 seconds |
| **Daily Embed** | `0 3 * * *` (03:00 daily) | `qmd-daily-embed.sh` | ~10-30 minutes |

### **Scripts**

**1. Hourly Update** (Fast)
```bash
/home/sysop/.openclaw/workspace/scripts/qmd-hourly-update.sh
```
- Indexes new/changed files
- Fast operation (~5-10 seconds)
- Safe to run frequently

**2. Daily Embed** (Slow)
```bash
/home/sysop/.openclaw/workspace/scripts/qmd-daily-embed.sh
```
- Full sync + vector embeddings
- Slower operation (~10-30 minutes on CPU)
- Runs at 03:00 (low traffic)

### **Logs**

- **Hourly:** `/home/sysop/.openclaw/workspace/logs/qmd-cron.log`
- **Daily:** `/home/sysop/.openclaw/workspace/logs/qmd-embed-cron.log`

**View logs:**
```bash
tail -f /home/sysop/.openclaw/workspace/logs/qmd-cron.log
tail -f /home/sysop/.openclaw/workspace/logs/qmd-embed-cron.log
```

---

## 📊 Status & Monitoring

### **Check QMD Status**
```bash
qmd status
```

**Expected output:**
```
QMD Status

Index: /home/sysop/.cache/qmd/index.sqlite
Size:  3.4 MB

Documents
  Total:    20 files indexed
  Vectors:  20 embedded
  Pending:  0 need embedding

Collections
  memory-root (qmd://memory-root/)
    Files:    1
  memory-daily (qmd://memory-dir/)
    Files:    17
```

### **List Indexed Files**
```bash
qmd ls
qmd ls memory-root
qmd ls memory-daily
```

### **Test Search**
```bash
# Text search (BM25)
qmd search "power monitoring"

# Semantic search (requires embeddings)
qmd query "laptop electricity consumption"

# Search specific collection
qmd query "dashboard design" -c memory-daily
```

### **Test from OpenClaw**
```bash
# In OpenClaw chat, use memory_search tool
memory_search query="power monitoring laptop"
```

---

## 🔍 Usage Examples

### **Manual Index Update**
```bash
# Update index only (fast)
qmd update

# Update + generate embeddings (slow)
qmd embed

# Full refresh
qmd update && qmd embed
```

### **Search Examples**
```bash
# Simple text search
qmd search "memory system"

# Semantic search with query expansion
qmd query "how does memory work"

# Search with filters
qmd query "discord configuration" -n 10
qmd query "API endpoints" -c memory-root

# Get specific document
qmd get qmd://memory-root/MEMORY.md
qmd get qmd://memory-daily/2026-03-06.md
```

---

## ⚠️ Troubleshooting

### **Issue: Empty Search Results**

**Symptoms:**
```
memory_search returns []
```

**Causes:**
1. ❌ Embeddings not generated
2. ❌ Files not indexed
3. ❌ Wrong collection path

**Fix:**
```bash
# 1. Check if files are indexed
qmd status

# 2. If 0 files, update config paths
# Edit ~/.openclaw/openclaw.json

# 3. Rebuild index
qmd update

# 4. Generate embeddings
qmd embed
```

---

### **Issue: Slow Performance**

**Symptoms:**
- `qmd embed` takes >30 minutes
- Search is slow

**Cause:**
- ⚠️ No GPU acceleration (CPU-only mode)

**Current Status:**
```
QMD Warning: no GPU acceleration, running on CPU (slow)
```

**Fix (Optional):**
```bash
# Install CUDA for GPU acceleration
sudo pacman -S cuda cudnn

# Or use Vulkan (AMD/Intel)
sudo pacman -S vulkan-icd-loader

# Then rebuild qmd embeddings
qmd embed
```

**Note:** CPU mode works fine, just slower. Daily embeddings at 03:00 is acceptable.

---

### **Issue: Cron Jobs Not Running**

**Check cron status:**
```bash
# List cron jobs
crontab -l | grep qmd

# Check cron logs
grep qmd /var/log/cron.log  # or journalctl -u cron
```

**Restart cron:**
```bash
sudo systemctl restart cron
# or
sudo systemctl restart crond
```

---

## 📈 Performance Metrics

### **Current Setup**

| Metric | Value |
|--------|-------|
| **Total Files** | 20 files |
| **Index Size** | 3.4 MB |
| **Embedding Model** | embeddinggemma |
| **GPU Acceleration** | ❌ No (CPU-only) |
| **Embed Time** | ~10-30 min (CPU) |
| **Update Time** | ~5-10 sec |

### **Resource Usage**

- **Memory:** ~50-100MB during embed
- **CPU:** 100% during embed (single-threaded)
- **Disk:** ~100KB per day (logs + index updates)

---

## 🎯 Best Practices

### **DO:**
- ✅ Run `qmd update` frequently (hourly is fine)
- ✅ Run `qmd embed` during low-traffic time (03:00)
- ✅ Monitor logs for errors
- ✅ Backup `~/.cache/qmd/index.sqlite` regularly
- ✅ Keep memory files organized in folders

### **DON'T:**
- ❌ Run `qmd embed` during peak hours (slow)
- ❌ Delete `~/.cache/qmd/` folder (rebuild needed)
- ❌ Change config paths without re-indexing
- ❌ Ignore cron failures (check logs)

---

## 🔄 Maintenance

### **Weekly**
```bash
# Check index health
qmd status

# Cleanup old caches
qmd cleanup
```

### **Monthly**
```bash
# Full rebuild (if needed)
rm -rf ~/.cache/qmd/
qmd update
qmd embed
```

### **Backup**
```bash
# Backup QMD index
cp -r ~/.cache/qmd/ /home/sysop/ssd/backups/qmd/

# Backup config
cp ~/.openclaw/openclaw.json /home/sysop/ssd/backups/openclaw/
```

---

## 📚 Related Documentation

- [OpenClaw Memory System](https://docs.openclaw.ai/gateway/memory)
- [QMD Documentation](https://github.com/qmd-ai/qmd)
- [Workspace Setup](./DISCORD_MULTI_CHANNEL_SETUP.md)

---

## 🆘 Quick Commands Reference

```bash
# Status
qmd status

# Update index
qmd update

# Generate embeddings
qmd embed

# Search
qmd search "query"
qmd query "semantic query"

# List files
qmd ls
qmd ls memory-root

# Get document
qmd get qmd://memory-root/MEMORY.md

# Cleanup
qmd cleanup
```

---

**Last Verified:** 2026-03-06 22:53  
**Next Embed:** Daily at 03:00  
**Next Update:** Hourly at :00
