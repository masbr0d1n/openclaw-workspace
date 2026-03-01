#!/bin/bash

# Setup Git Hooks for Auto-Push
# Install post-commit hook for automatic push after commit

echo "=== Setup Git Auto-Push Hooks ==="
echo ""

# Function to install hooks
install_auto_push_hooks() {
    local PROJECT_DIR="$1"
    local PROJECT_NAME="$2"

    if [ ! -d "$PROJECT_DIR/.git" ]; then
        echo "⚠️  $PROJECT_NAME: No git repository found, skipping..."
        return
    fi

    echo "📦 Installing auto-push hook for $PROJECT_NAME..."

    # Create post-commit hook
    cat > "$PROJECT_DIR/.git/hooks/post-commit" << 'EOF'
#!/bin/bash

# Git Post-Commit Hook - Auto Push
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

BRANCH=$(git branch --show-current)

echo -e "${BLUE}📤 Auto-pushing to Forgejo...${NC}"

if git push forgejo "$BRANCH" 2>&1; then
    echo -e "${GREEN}✓ Pushed to forgejo/$BRANCH${NC}"
else
    echo "⚠️  Push failed (might be offline)"
fi

exit 0
EOF

    # Make executable
    chmod +x "$PROJECT_DIR/.git/hooks/post-commit"

    echo -e "${GREEN}✓ Auto-push hook installed for $PROJECT_NAME${NC}"
    echo ""
}

# Install hooks for both projects
install_auto_push_hooks "/home/sysop/.openclaw/workspace/apistreamhub-fastapi" "Backend (apistreamhub-fastapi)"
install_auto_push_hooks "/home/sysop/.openclaw/workspace/streamhub-nextjs" "Frontend (streamhub-nextjs)"

echo "=== Setup Complete ==="
echo ""
echo "Auto-push hooks are now active!"
echo ""
echo "What happens now:"
echo "  1. Every 'git commit' will trigger automatic push"
echo "  2. Push will go to Forgejo (forgejo remote)"
echo "  3. No manual push needed"
echo ""
echo "Example:"
echo "  $ git commit -m 'feat: add new feature'"
echo "  → Database backup runs (pre-commit)"
echo "  → Changes are committed"
echo "  → Auto-push runs (post-commit)"
echo "  → Done!"
echo ""
echo "✅ Ready to use!"
echo ""
echo "Note: You can still use 'git commit --no-verify' to skip hooks"
