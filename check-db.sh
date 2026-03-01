#!/bin/bash

# Quick Database Permission Check
# Run this anytime to verify database permissions

bash /home/sysop/.openclaw/workspace/scripts/check-db-permissions.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All permissions OK"
    exit 0
else
    echo ""
    echo "❌ Permission issues found!"
    echo ""
    echo "Fix with:"
    echo "  bash /home/sysop/.openclaw/workspace/scripts/fix-db-permissions.sh"
    exit 1
fi
