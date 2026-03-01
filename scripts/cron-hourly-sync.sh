#!/bin/bash
# Hourly memory sync to database
# Syncs all MEMORY.md files to SQLite database

echo "🔄 Hourly memory sync: $(date)"
python3 /home/sysop/.openclaw/workspace/scripts/memory-system.py sync
echo "✅ Memory sync completed: $(date)"
