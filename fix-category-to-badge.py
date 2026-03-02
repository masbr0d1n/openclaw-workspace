#!/usr/bin/env python3
"""
Fix category to badge - more specific approach
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
category_found = False

for i, line in enumerate(lines):
    # Look for the category section in Basic Info
    if '<Label className="text-muted-foreground text-xs">Category</Label>' in line:
        # The next line should be the <p> tag with category value
        category_found = True
        new_lines.append(line)
        continue
    
    # If we just found Category label, replace the next line (the value)
    if category_found:
        # This should be the <p> tag line
        if '<p className="font-medium">{selectedVideo.category ||' in line:
            # Replace with badge
            new_lines.append('                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 uppercase">\n')
            new_lines.append('                    {selectedVideo.category || \'-\'}\n')
            new_lines.append('                  </span>\n')
            category_found = False
            continue
        else:
            # Unexpected format, keep original
            category_found = False
    
    new_lines.append(line)

with open(file_path, 'w') as f:
    f.writelines(new_lines)

print("✓ Changed category to badge with uppercase")

# Verify
with open(file_path, 'r') as f:
    content = f.read()

if 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100' in content and 'uppercase' in content:
    print("✓ Verification: Category badge found")
else:
    print("⚠️  Verification: Badge not found, checking...")
    # Check for category display
    for i, line in enumerate(lines):
        if 'Category</Label>' in line:
            print(f"Found Category label at line {i+1}")
            if i+1 < len(lines):
                print(f"Next line: {lines[i+1].strip()}")
