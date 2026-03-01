#!/bin/bash
# Wrapper script untuk OpenClaw Memory System
# Usage: ./sync-memory.sh [sync|search|backup]

PYTHON_SCRIPT="/home/sysop/.openclaw/workspace/scripts/memory-system.py"

case "${1:-sync}" in
  sync)
    echo "🔄 Syncing MEMORY.md files to database..."
    python3 "$PYTHON_SCRIPT" sync
    ;;
  search)
    if [ -z "$2" ]; then
      echo "Usage: $0 search '<query>'"
      exit 1
    fi
    echo "🔍 Searching memory for: $2"
    python3 "$PYTHON_SCRIPT" search "$2"
    ;;
  backup)
    echo "💾 Backing up memory database..."
    python3 "$PYTHON_SCRIPT" backup
    ;;
  *)
    echo "OpenClaw Memory System"
    echo ""
    echo "Usage: $0 [sync|search|backup]"
    echo ""
    echo "Commands:"
    echo "  sync     - Sync MEMORY.md files to SQLite database"
    echo "  search Q - Search memory database"
    echo "  backup   - Backup database to /home/sysop/ssd/backups/openclaw/"
    echo ""
    echo "Examples:"
    echo "  $0 sync"
    echo "  $0 search 'github setup'"
    echo "  $0 backup"
    exit 0
    ;;
esac
