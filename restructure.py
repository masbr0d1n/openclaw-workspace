#!/usr/bin/env python3
"""
Restructure modal to single column layout
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    lines = f.readlines()

# Find and modify the relevant lines
output = []
skip_until_closing_div = 0
in_right_column = False

for i, line in enumerate(lines):
    # Change grid to single column
    if 'grid grid-cols-1 lg:grid-cols-12 gap-8' in line:
        output.append('                <div className="space-y-6">\n')
        continue
    
    # Remove left column span
    if 'lg:col-span-7' in line and 'space-y-6' in line:
        output.append('                  <div>\n')
        continue
    
    # Detect right column start
    if '{/* Right Column - 5 cols */}' in line or 'lg:col-span-5' in line:
        in_right_column = True
        skip_until_closing_div = 1  # Skip the opening div
        continue
    
    # If we're in right column, count nested divs to find the closing one
    if in_right_column:
        if '<div' in line:
            skip_until_closing_div += 1
        if '</div>' in line:
            skip_until_closing_div -= 1
            if skip_until_closing_div == 0:
                in_right_column = False
                # Don't add this line - we're removing the entire right column
                continue
        # Skip all lines in right column
        continue
    
    # Otherwise keep the line
    output.append(line)

with open(file_path, 'w') as f:
    f.writelines(output)

print("✓ Restructured to single column layout")
print("  - Grid changed to space-y-6")
print("  - Left column span removed")
print("  - Right column with action buttons removed")
