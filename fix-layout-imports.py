#!/usr/bin/env python3
"""
Fix the layout.tsx imports and add Notifications menu properly
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/layout.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# 1. Fix imports - remove duplicate Bell entries and add it properly to the lucide-react import
# Find the lucide-react import and add Bell there
import re

# Remove the bad Bell imports
content = re.sub(r'\n\s*Bell,\s*\n', '\n', content)
content = re.sub(r'\n\s*Bell,\s*import Link', '\nimport Link', content)

# Now add Bell to the lucide-react import properly
content = re.sub(
    r"(from 'lucide-react';)",
    r", Bell\n  } from 'lucide-react';"
)

# Fix the closing brace
content = content.replace("} from 'lucide-react';", "  Bell,\n} from 'lucide-react';")

# Actually, let's be more precise
content = re.sub(
    r"from 'lucide-react';",
    "from 'lucide-react';",
    content
)

# Better approach - completely rewrite the import section
lines = content.split('\n')
new_lines = []
skip_next = False
fixed_imports = False

for i, line in enumerate(lines):
    if 'from lucide-react' in line and not fixed_imports:
        # Add Bell to this import
        if 'Building2' in line:
            new_lines.append(line.replace("Building2,", "Building2, Bell,"))
            fixed_imports = True
            continue
        elif '}' in line:
            # This is the closing brace, add Bell before it
            new_lines.append(line.replace("}", "  Bell,"))
            fixed_imports = True
            continue
    elif 'Bell,' in line and 'import' not in line and (i == 9 or i == 12):
        # Skip the orphan Bell imports
        continue
    
    new_lines.append(line)

with open(file_path, 'w') as f:
    f.write('\n'.join(new_lines))

print("✓ Fixed imports and added Bell to lucide-react")

# Verify
with open(file_path, 'r') as f:
    content = f.read()

# Check if we need to remove duplicates
count = content.count("Notifications & Alerts")
if count > 2:
    print(f"⚠️  Found {count} Notifications entries, should be 2")
    # Remove duplicates by keeping only the first occurrence before each Settings
    lines = content.split('\n')
    seen_before_settings = []
    new_lines = []
    in_videotron = False
    
    for line in lines:
        if 'videotron' in line and '{' in line:
            in_videotron = True
            seen_before_settings = []
        
        if 'Notifications & Alerts' in line:
            # Check if we've seen this section before in current menu
            if seen_before_settings.count(True) > 0:
                # Skip duplicate
                continue
            seen_before_settings.append(True)
        
        new_lines.append(line)
    
    with open(file_path, 'w') as f:
        f.write('\n'.join(new_lines))
    
    print("✓ Removed duplicate Notifications entries")

print("\n=== DONE ===")
