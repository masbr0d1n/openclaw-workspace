#!/bin/bash
# Fix all duplicate className issues

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

# Fix line 666 (video metadata)
sed -i '666s/.*/                <div className="border rounded-lg p-4 space-y-3 bg-\\[\\#eceff4\\]">/' "$FILE"

# Fix line 697 (image metadata) - same pattern
sed -i '697s/.*/                <div className="border rounded-lg p-4 space-y-3 bg-\\[\\#eceff4\\]">/' "$FILE"

echo "✓ Fixed duplicate className on lines 666 and 697"
echo ""
echo "Verification:"
echo "Line 666:"
sed -n '666p' "$FILE"
echo ""
echo "Line 697:"
sed -n '697p' "$FILE"
