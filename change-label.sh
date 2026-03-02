#!/bin/bash
# Change "File Type" label to "Extension"

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== CHANGE FILE TYPE → EXTENSION ==="
echo ""

# Find and replace in the View Details modal
# Looking for the File Type label in the modal

sed -i 's/<Label className="text-muted-foreground text-xs">File Type<\/Label>/<Label className="text-muted-foreground text-xs">Extension<\/Label>/' "$FILE"

echo "✓ Changed 'File Type' to 'Extension'"
echo ""
echo "Verification:"
grep -n "Extension" src/app/dashboard/content/page.tsx | head -3
