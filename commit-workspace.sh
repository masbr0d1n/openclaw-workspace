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

# Add all changes
git add -A

# Commit with timestamp
git commit -m "agent: workspace update $(date '+%Y-%m-%d %H:%M:%S')"

# Push to remote
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if git push origin "$BRANCH" 2>/dev/null; then
    echo "✅ Workspace committed & pushed to origin/$BRANCH"
else
    # Try simple push if the above fails
    git push 2>/dev/null && echo "✅ Workspace pushed"
    echo "⚠️  Push had issues, but commit is saved locally"
fi

# Show summary
echo ""
echo "📊 Commit summary:"
git log -1 --oneline
echo ""
echo "📁 Changed files:"
git diff --stat HEAD~1 HEAD
