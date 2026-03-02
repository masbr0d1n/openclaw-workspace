#!/bin/bash
# Increase modal width from max-w-5xl to max-w-7xl (wider)

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== INCREASE MODAL WIDTH ==="
echo ""

# Check current width
echo "Current width setting:"
grep "DialogContent.*max-w" "$FILE" | head -2

echo ""
echo "Changing max-w-5xl to max-w-7xl..."
echo ""

# Replace max-w-5xl with max-w-7xl for the View Details dialog
sed -i 's/DialogContent className="max-w-5xl max-h-\[90vh\]/DialogContent className="max-w-7xl max-h-[90vh]/' "$FILE"

echo "✓ Modal width increased"
echo ""
echo "New width setting:"
grep "DialogContent.*max-w" "$FILE" | head -2
