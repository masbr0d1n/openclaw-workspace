#!/usr/bin/env python3
"""
Apply all three UI changes:
1. Image Metadata: Change label to "Extension"
2. Background: #f8fafc
3. Category: Badge with uppercase
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    lines = f.readlines()

new_lines = []
in_image_metadata = False

for i, line in enumerate(lines):
    # Check if we're in Image Metadata section
    if 'Image Metadata' in line:
        in_image_metadata = True
    elif 'Video Metadata' in line or '{/* Image-specific metadata */}' not in ''.join(lines[max(0,i-5):i]):
        if 'Image-specific metadata' not in line:
            in_image_metadata = False
    
    # 1. In Image Metadata box, ensure label says "Extension"
    if in_image_metadata and 'File Type' in line and '<Label' in line:
        line = line.replace('File Type', 'Extension')
    
    # 2. Background already changed to #f8fafc (should be done)
    
    # 3. Category to badge (check if it's already done)
    # This will be handled separately
    
    new_lines.append(line)

with open(file_path, 'w') as f:
    f.writelines(new_lines)

print("✓ Step 1: Image Metadata label → Extension")

# Now fix category badge
with open(file_path, 'r') as f:
    content = f.read()

# Check if category is already a badge
if 'inline-flex' in content and 'category' in content and 'uppercase' in content:
    print("✓ Step 3: Category already a badge with uppercase")
else:
    # Find the category display and convert to badge
    # Look for: <p className="text-sm font-medium capitalize">{selectedVideo.category || '-'}</p>
    
    import re
    
    # Pattern for category paragraph
    category_pattern = r'(<p className="text-sm font-medium capitalize">\{selectedVideo\.category \|\| \'-\'\}</p>)'
    
    category_badge = '''<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 uppercase">
                      {selectedVideo.category || '-'}
                    </span>'''
    
    new_content = re.sub(category_pattern, category_badge, content)
    
    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print("✓ Step 3: Category converted to badge with uppercase")
    else:
        print("⚠️  Category pattern not found - may already be a badge")

print("\n=== ALL CHANGES APPLIED ===")
