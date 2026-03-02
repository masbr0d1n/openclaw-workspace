#!/usr/bin/env python3
"""
Fix the Switch import issue
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/notifications/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# Remove Switch from imports
content = content.replace(
    "import { Bell, Mail, MessageSquare, Slack, HardDrive, Wifi, AlertCircle, Check, Switch } from 'lucide-react';",
    "import { Bell, Mail, MessageSquare, Slack, HardDrive, Wifi, AlertCircle, Check } from 'lucide-react';"
)

with open(file_path, 'w') as f:
    f.write(content)

print("✓ Removed Switch from imports")
print("\n=== DONE ===")
