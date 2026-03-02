#!/bin/bash
# Change View Details modal width

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== WIDEN VIEW DETAILS MODAL ==="
echo ""

# Find and replace the exact line
sed -i 's/DialogContent className="max-w-2xl max-h-\[80vh\] overflow-y-auto"/DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto"/' "$FILE"

echo "✓ Changed max-w-2xl to max-w-6xl"
echo ""
echo "Verification:"
grep "DialogContent.*max-w-6xl" "$FILE"
