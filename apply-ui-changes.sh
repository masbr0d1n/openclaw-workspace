#!/bin/bash
# Apply UI changes using sed

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== APPLYING UI CHANGES ==="
echo ""

# 1. Change metadata box background - add inline style
# Find the border rounded-lg p-4 for video metadata and add background
sed -i 's/<div className="border rounded-lg p-4 space-y-3">/<div className="border rounded-lg p-4 space-y-3" style="background-color: #eceff4">/' "$FILE"

echo "✓ 1. Video metadata box: background #eceff4"

# 2. Add text-sm to font-medium for title, category, upload date
sed -i 's/<p className="font-medium">{selectedVideo.title<\/p>/<p className="text-sm font-medium">{selectedVideo.title<\/p>/' "$FILE"
sed -i 's/<p className="font-medium capitalize">{selectedVideo.category/<p className="text-sm font-medium capitalize">{selectedVideo.category/' "$FILE"
sed -i 's/<p className="font-medium">{new Date(selectedVideo.created_at)/<p className="text-sm font-medium">{new Date(selectedVideo.created_at)/' "$FILE"

echo "✓ 2. Smaller font (text-sm) for title, category, upload date"

# 3. Expiry date - add red color
sed -i 's/<p className="font-medium">{selectedVideo.expiry_date/<p className="text-sm font-medium text-red-500">{selectedVideo.expiry_date/' "$FILE"

echo "✓ 3. Expiry date: red color (text-red-500)"

# 4. Change Extension to File Type (outside metadata)
sed -i 's/<Label className="text-muted-foreground text-xs">Extension<\/Label>/<Label className="text-muted-foreground text-xs">File Type<\/Label>/' "$FILE"

echo "✓ 4. Extension → File Type"

echo ""
echo "=== DONE ==="
