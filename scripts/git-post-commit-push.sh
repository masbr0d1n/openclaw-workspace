#!/bin/bash

# Git Post-Commit Hook - Auto Push After Commit
# Automatically push to Forgejo after every commit

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get current branch
BRANCH=$(git branch --show-current)

echo -e "${BLUE}=== Git Post-Commit: Auto Push ===${NC}"
echo "Branch: $BRANCH"
echo ""

# Push to Forgejo
echo -e "${GREEN}📤 Pushing to Forgejo...${NC}"

if git push forgejo "$BRANCH" 2>&1; then
    echo -e "${GREEN}✓ Pushed successfully to forgejo/$BRANCH${NC}"
else
    echo -e "${YELLOW}⚠️  Push failed (this is okay if offline)${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}=== Auto-Push Complete ===${NC}"
