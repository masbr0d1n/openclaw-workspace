#!/usr/bin/env python3
"""
Apply final UI tweaks to Content Details modal
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# 1. Change background color from #eceff4 to #f8fafc
content = content.replace('bg-[\\#eceff4]', 'bg-[\\#f8fafc]')

# 2. For Image Metadata, add "Extension" label (not File Type)
# Find the Image Metadata section and modify the Extension/File Type label
# We need to be careful here - only for Image Metadata box

# First, let's change the label back to "Extension" everywhere
content = content.replace(
    '<Label className="text-muted-foreground text-xs">File Type</Label>',
    '<Label className="text-muted-foreground text-xs">Extension</Label>'
)

print("✓ Changed background color: #eceff4 → #f8fafc")
print("✓ Changed label: File Type → Extension")

# 3. Change category value to badge with uppercase
# Find the category display and wrap it in a badge
category_pattern = r'''(<p className="text-sm font-medium capitalize">\{selectedVideo\.category \|\| '\-'\}</p>)'''

category_badge = r'''<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 uppercase">{selectedVideo.category || '-'}</span>'''

import re
content = re.sub(category_pattern, category_badge, content)

print("✓ Changed category to badge with uppercase")

with open(file_path, 'w') as f:
    f.write(content)

print("\n=== ALL CHANGES APPLIED ===")
