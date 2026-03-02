#!/usr/bin/env python3
"""
Update Content page margins to match Screen page
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# Replace the outer div className
old_div = '<div className="space-y-6">'
new_div = '<div className="container mx-auto py-8 px-4">'

content = content.replace(old_div, new_div)

with open(file_path, 'w') as f:
    f.write(content)

print("✓ Updated Content page margins to match Screen page")
print("\nBefore: className=\"space-y-6\"")
print("After:  className=\"container mx-auto py-8 px-4\"")
print("\nThis ensures consistent spacing across all dashboard pages")
