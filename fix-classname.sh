#!/bin/bash
# Fix the duplicate className issue

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

# Replace the broken line with correct single className
# Find the duplicate className and fix it
sed -i '666s/.*/                <div className="border rounded-lg p-4 space-y-3 bg-\\[\\#eceff4\\]">/' "$FILE"

echo "✓ Fixed duplicate className on line 666"
echo ""
echo "Verification:"
sed -n '666p' "$FILE"
