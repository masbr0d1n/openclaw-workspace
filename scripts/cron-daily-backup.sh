#!/bin/bash
# Daily full backup (workspace + database)
# Runs every day at 2 AM

echo "📦 Daily backup started: $(date)"

# Backup workspace
bash /home/sysop/.openclaw/workspace/scripts/backup-workspace.sh

# Backup memory database
python3 /home/sysop/.openclaw/workspace/scripts/memory-system.py backup

echo "✅ Daily backup completed: $(date)"
