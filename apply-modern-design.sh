#!/bin/bash
# Apply modern modal design from HTML spec

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== APPLYING MODERN MODAL DESIGN ==="
echo ""

# Backup first
cp "$FILE" "$FILE.before-modern-design"

echo "✓ Backup created"
echo ""

# The View Details Dialog starts around line 578
# We need to restructure it to match the HTML design

cat << 'EOF'
Design to implement:
- max-w-5xl (1024px)
- flex flex-col
- 2-column grid (7:5 ratio)
- Left col: Video (aspect-video), description, tags
- Right col: General Info card, Video Metadata card, action buttons
- Header with title + close button
- Footer with close button
EOF

echo ""
echo "This requires manual editing of the modal structure."
echo "Let me create the new modal code..."
