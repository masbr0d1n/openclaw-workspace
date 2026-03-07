#!/bin/bash

# Git Post-Commit Hook - Auto Backup
# This hook automatically backs up the repository after each commit

set -e

# Backup script location
BACKUP_SCRIPT="/home/sysop/.openclaw/workspace/backup-repos.sh"

# Run backup script if it exists
if [ -f "$BACKUP_SCRIPT" ]; then
    echo "🔄 Running repository backup..."
    "$BACKUP_SCRIPT" 2>&1 | tail -5
    echo "✅ Backup complete!"
else
    echo "⚠️  Backup script not found at $BACKUP_SCRIPT"
fi
