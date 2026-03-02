#!/usr/bin/env python3
"""
Replace View Details Dialog with modern design
"""

import re

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

# Read the new modal code
with open('/home/sysop/.openclaw/workspace/MODERN_MODAL_CODE.txt', 'r') as f:
    new_modal = f.read()

# Read the current file
with open(file_path, 'r') as f:
    content = f.read()

# Find the View Details Dialog section
# Pattern: from "{/* View Details Dialog" to the closing "</Dialog>" followed by Edit Dialog
pattern = r'{/\* View Details Dialog.*?\n.*?</Dialog>\n\n      {/\* Edit Dialog'

# Replace with new modal
new_content = re.sub(pattern, new_modal + '\n\n      {/* Edit Dialog', content, flags=re.DOTALL)

# Write back
with open(file_path, 'w') as f:
    f.write(new_content)

print("✓ Replaced View Details Dialog with modern design")
print("")
print("Changes:")
print("  - max-w-6xl → max-w-5xl")
print("  - Added 2-column grid layout (7:5 ratio)")
print("  - Restructured content with proper spacing")
print("  - Added proper cards for General Info and Video Metadata")
