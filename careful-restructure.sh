#!/bin/bash
# Fix the JSX syntax error by restoring and doing a careful edit

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

# Restore again
git checkout src/app/dashboard/content/page.tsx

# Now do more careful edits
FILE="src/app/dashboard/content/page.tsx"

echo "=== CAREFUL RESTRUCTURE ==="
echo ""

# 1. Change the grid container
sed -i 's/<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">/<div className="space-y-6">/' "$FILE"

# 2. Remove column span classes
sed -i 's/ className="lg:col-span-7 space-y-6"//' "$FILE

# 3. Find and remove the right column div and its contents (action buttons)
# This is tricky - we need to find the opening and closing tags

# Use Python for this complex edit
python3 << 'PYTHON'
import re

with open('src/app/dashboard/content/page.tsx', 'r') as f:
    content = f.read()

# Remove the right column section (from "Right Column" comment to its closing div)
pattern = r'\s+{/\* Right Column - 5 cols \*/}\s+<div className="lg:col-span-5 space-y-6">.*?</div>\s+</div>\s+</div>'

content = re.sub(pattern, '\n                  </div>\n                </div>', content, flags=re.DOTALL)

with open('src/app/dashboard/content/page.tsx', 'w') as f:
    f.write(content)

print("✓ Removed right column and action buttons")
PYTHON

echo "✓ Done"
