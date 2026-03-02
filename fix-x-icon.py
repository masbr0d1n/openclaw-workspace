#!/usr/bin/env python3
"""
Fix imports for modern modal
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# Check if X is imported
if 'from "lucide-react"' in content or "from 'lucide-react'" in content:
    # Find the lucide-react import and add X if not present
    if "'X'" not in content and '"X"' not in content:
        # Replace the import line
        import_pattern = r"(from ['\"]lucide-react['\"])([^)]*)"
        
        def add_x_icon(match):
            base = match.group(1)
            imports = match.group(2)
            if imports.strip():
                return f'{base}, X{imports}'
            else:
                return f'{base}, X'
        
        content = re.sub(import_pattern, add_x_icon, content)
        print("✓ Added X icon import")
    else:
        print("✓ X icon already imported")
else:
    print("⚠️  No lucide-react imports found")

with open(file_path, 'w') as f:
    f.write(content)
