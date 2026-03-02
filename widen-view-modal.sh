#!/bin/bash
# Change View Details modal width from max-w-2xl to max-w-6xl

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== INCREASE VIEW DETAILS MODAL WIDTH ==="
echo ""

# Line 581: View Details Dialog
# Change from max-w-2xl to max-w-6xl (much wider)
sed -i '581s/max-w-2xl/max-w-6xl/' "$FILE"

echo "✓ Changed max-w-2xl to max-w-6xl at line 581"
echo ""
echo "Verification:"
sed -n '581p' "$FILE"
