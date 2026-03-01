#!/bin/bash

# Auto Commit & Push Script for Development
# Run this after completing a task

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Auto Commit & Push ===${NC}"
echo ""

# Check if we're in a git repo
if ! git rev-parse --git-head > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Not in a git repository${NC}"
    exit 1
fi

# Get current directory name
REPO_NAME=$(basename "$(git rev-parse --show-toplevel)")
BRANCH=$(git branch --show-current)

echo "Repository: $REPO_NAME"
echo "Branch: $BRANCH"
echo ""

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
    exit 0
fi

# Show changes
echo "Changes detected:"
git status --short
echo ""

# Prompt for commit message
if [ -z "$1" ]; then
    echo "Enter commit message (or press Enter for auto-generated):"
    read -r COMMIT_MSG

    if [ -z "$COMMIT_MSG" ]; then
        # Auto-generate commit message based on changes
        COMMIT_MSG="chore: auto-commit $(date +%Y%m%d_%H%M%S)"
    fi
else
    COMMIT_MSG="$1"
fi

echo ""
echo -e "${GREEN}📝 Commit message: $COMMIT_MSG${NC}"
echo ""

# Add all changes
echo -e "${BLUE}[1/3] Adding changes...${NC}"
git add -A

# Commit
echo -e "${BLUE}[2/3] Committing...${NC}"
git commit -m "$COMMIT_MSG"

# Push
echo -e "${BLUE}[3/3] Pushing to Forgejo...${NC}"
git push forgejo "$BRANCH"

echo ""
echo -e "${GREEN}✅ Auto commit & push complete!${NC}"
echo "Repository: $REPO_NAME"
echo "Branch: $BRANCH"
echo "Commit: $(git log -1 --pretty=%h)"
