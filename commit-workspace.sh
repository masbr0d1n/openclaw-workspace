#!/bin/bash
# Auto-commit OpenClaw workspace after task completion
# Usage: Run this after completing any task that modifies files

cd /home/sysop/.openclaw/workspace

# Check if this is a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not a git repository. Run: git init"
    exit 1
fi

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  No changes to commit"
    exit 0
fi

# Sync MEMORY files to database (Level 3)
echo "💾 Syncing memory to database..."
python3 /home/sysop/.openclaw/workspace/scripts/memory-system.py sync 2>&1 | grep -E "^✅|Sync complete" || true

# Add all changes
git add -A

# Commit with timestamp
git commit -m "agent: workspace update $(date '+%Y-%m-%d %H:%M:%S')"

# Push to remote(s)
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Check if we have multiple push URLs configured
PUSH_URLS=$(git remote get-url --push origin 2>/dev/null | wc -l)

if [ "$PUSH_URLS" -gt 1 ]; then
    # Multiple push URLs configured
    echo "📤 Pushing to multiple remotes..."
    if git push origin "$BRANCH" 2>/dev/null; then
        echo "✅ Workspace pushed to all remotes (origin/$BRANCH)"
    else
        echo "⚠️  Push had issues, but commit is saved locally"
    fi
else
    # Single remote or no remote
    if git push origin "$BRANCH" 2>/dev/null; then
        echo "✅ Workspace committed & pushed to origin/$BRANCH"
    elif git push "$BRANCH" 2>/dev/null; then
        echo "✅ Workspace pushed to $BRANCH"
    else
        echo "ℹ️  No remote configured. Commit saved locally only."
        echo "   To setup multi-remote push, run:"
        echo "   git remote set-url --add --push origin <url1>"
        echo "   git remote set-url --add --push origin <url2>"
    fi
fi

# Backup to SSD (Level 2)
echo "💾 Backing up to SSD..."
bash /home/sysop/.openclaw/workspace/scripts/backup-workspace.sh 2>&1 | grep -E "^✅|📦" || true

# Backup database to SSD (Level 3)
echo "💾 Backing up memory database..."
python3 /home/sysop/.openclaw/workspace/scripts/memory-system.py backup 2>&1 | grep "^✅" || true

# Show summary
echo ""
echo "📊 Commit summary:"
git log -1 --oneline
echo ""
echo "📁 Changed files:"
git diff --stat HEAD~1 HEAD
