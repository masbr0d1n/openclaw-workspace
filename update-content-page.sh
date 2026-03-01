#!/bin/bash

# Update content page with View modal

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

# Backup current page
cp src/app/dashboard/content/page.tsx src/app/dashboard/content/page-before-view-modal.tsx

# Replace with new version
mv src/app/dashboard/content/page-with-view-modal.tsx src/app/dashboard/content/page.tsx

echo "✅ Content page updated with View modal"
echo ""
echo "=== NEW FEATURES ==="
echo "1. View button opens modal dialog instead of new tab"
echo "2. Modal shows:"
echo "   - Thumbnail preview"
echo "   - Title, Description, File Type, Upload Date"
echo "   - For videos: Resolution, Duration, FPS, Video Codec, Audio Codec"
echo "   - For images: Dimensions, File Type (JPG/PNG/etc)"
echo "   - Tags and Expiry date"
echo "3. Fallback thumbnails for videos/images without thumbnail_data"
echo ""
echo "=== NEXT ==="
echo "Rebuild frontend and test with Puppeteer"
