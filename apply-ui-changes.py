#!/usr/bin/env python3
"""
Apply UI changes to Content Details modal
1. Video metadata box: bg-[#eceff4]
2. Smaller font for title, category, upload date values
3. Expiry date: red color
4. Change "Extension" to "File Type" outside metadata boxes
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# 1. Change video metadata box background
# Find: bg-white dark:bg-slate-800 (for metadata section)
content = content.replace(
    'className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"',
    'className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" style="background-color: #eceff4"'
)

# 2. Make font smaller for title, category, upload date
# These use "font-medium" - change to "text-sm font-medium"
content = content.replace(
    '<p className="text-slate-900 dark:text-white font-medium truncate">{selectedVideo.title}</p>',
    '<p className="text-slate-900 dark:text-white text-sm font-medium truncate">{selectedVideo.title}</p>'
)

content = content.replace(
    '<p className="text-slate-900 dark:text-white font-medium capitalize">\n                      {selectedVideo.category || \'-\'}',
    '<p className="text-slate-900 dark:text-white text-sm font-medium capitalize">\n                      {selectedVideo.category || \'-\'}'
)

# For upload date, find and replace the specific pattern
content = content.replace(
    '''<p className="text-slate-900 dark:text-white font-medium">
                      {new Date(selectedVideo.created_at).toLocaleDateString''',
    '''<p className="text-slate-900 dark:text-white text-sm font-medium">
                      {new Date(selectedVideo.created_at).toLocaleDateString'''
)

# 3. Expiry date - add red color (if it exists)
# Find the expiry date display and add text-red-500 class
expiry_pattern = r'''(<p className=")text-slate-900 dark:text-white( font-medium">\{selectedVideo\.expiry_date)'''
content = re.sub(expiry_pattern, r'\1text-red-500 dark:text-red-400\2', content)

# 4. Change "Extension" label to "File Type" (outside metadata boxes)
# This is in the general info section, not in the metadata card
content = content.replace(
    '<Label className="text-muted-foreground text-xs">Extension</Label>',
    '<Label className="text-muted-foreground text-xs">File Type</Label>'
)

with open(file_path, 'w') as f:
    f.write(content)

print("✓ Applied UI changes:")
print("  1. Video metadata box: background #eceff4")
print("  2. Smaller font (text-sm) for title, category, upload date")
print("  3. Expiry date: red color (text-red-500)")
print("  4. Extension → File Type (outside metadata boxes)")
