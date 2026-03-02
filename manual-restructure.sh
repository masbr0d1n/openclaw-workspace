#!/bin/bash
# Manual edit to restructure modal layout

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== RESTRUCTURING MODAL ==="
echo ""

# The View Details Dialog is around line 578-850
# We need to change from 2-column grid to single column

# Step 1: Change grid to single column
echo "1. Changing grid layout..."
sed -i 's/<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">/<div className="space-y-6">/' "$FILE"

# Step 2: Remove column spans
sed -i 's/<div className="lg:col-span-7 space-y-6">/<div>/' "$FILE"
sed -i '/<div className="lg:col-span-5 space-y-6">/d' "$FILE"

# Step 3: Remove section comments
sed -i '/{\/\* Left Column - 7 cols \*\/}/d' "$FILE"
sed -i '/{\/\* Right Column - 5 cols \*\/}/d' "$FILE"
sed -i '/{\/\* Tags \*\/}/d' "$FILE"

# Step 4: Remove action buttons section
sed -i '/{\/\* Action Buttons \*\/}/,/<\/div>/d' "$FILE"

echo "✓ Layout restructured"
echo ""
echo "Changes:"
echo "  - Grid changed to single column (space-y-6)"
echo "  - Column spans removed"
echo "  - Action buttons section removed"
