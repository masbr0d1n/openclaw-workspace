#!/bin/bash
# Update File Type badge and Expiry Date color in modal

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== UPDATING MODAL DISPLAY ==="
echo ""

# 1. Update File Type display (line ~706)
# Change from plain text to badge
perl -i -pe '
  s{(                <div>\s*                  <Label className="text-muted-foreground text-xs">File Type</Label>\s*                  <p>)(.*?)(</p>)}
  {$1<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border getFileBadgeColor(selectedVideo.content_type, selectedVideo.video_url)">\$2</span>$3}x
' "$FILE"

echo "✓ Updated File Type badge"

# 2. Update Expiry Date color (line ~728)
# Make it red when expiry date exists
perl -i -0777 -pe '
  s{(                <div>\s*                  <Label className="text-muted-foreground text-xs">Expiry Date</Label>\s*                  <p className="font-medium">)(.*?)(</p>)}
  {$1<span className={selectedVideo.expiry_date ? "text-red-500 dark:text-red-400" : ""}>\$2</span>$3}xs
' "$FILE"

echo "✓ Updated Expiry Date color"

echo ""
echo "=== UPDATE COMPLETE ==="
