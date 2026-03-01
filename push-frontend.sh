#!/bin/bash

# Script to push frontend to Forgejo with credentials

echo "=== FRONTEND PUSH TO FORGEJO ==="
echo ""

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

# Prompt for password
echo "Enter Forgejo password for sysop:"
read -s FORGEJO_PASSWORD

# Push with credentials
git push http://sysop:${FORGEJO_PASSWORD}@localhost:3333/sysop/streamhub-nextjs.git master

echo ""
echo "✅ Push complete!"
