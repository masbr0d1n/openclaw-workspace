#!/usr/bin/env python3
"""
Fix category badge display
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# Find and replace category display with badge
# Look for the pattern: <p className="text-sm font-medium capitalize">{selectedVideo.category || '-'}</p>

import re

# Match the category paragraph
category_pattern = r'<p className="text-sm font-medium capitalize">\{selectedVideo\.category \|\| \'-\'\}</p>'

category_badge = '''<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 uppercase">
                      {selectedVideo.category || '-'}
                    </span>'''

# Check if the badge already exists
if 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100' in content and 'uppercase' in content:
    print("✓ Category badge already exists")
else:
    # Replace the paragraph with the badge
    new_content = re.sub(category_pattern, category_badge, content)
    
    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print("✓ Changed category to badge with uppercase")
    else:
        print("⚠️  Could not find category pattern, trying alternative...")
        # Try finding by context
        if '{selectedVideo.category ||' in content:
            # Find the line and replace it
            lines = content.split('\n')
            new_lines = []
            for line in lines:
                if '{selectedVideo.category ||' in line and '</p>' in line and 'capitalize' in line:
                    # Replace this line
                    new_lines.append('                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 uppercase">')
                    new_lines.append('                      {selectedVideo.category || \'-\'}')
                    new_lines.append('                    </span>')
                else:
                    new_lines.append(line)
            
            with open(file_path, 'w') as f:
                f.write('\n'.join(new_lines))
            print("✓ Changed category to badge (alternative method)")
        else:
            print("✗ Could not find category to change")

print("\n=== DONE ===")
