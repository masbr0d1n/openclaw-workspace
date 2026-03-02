#!/bin/bash
# Add Notifications & Alerts to navigation

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/layout.tsx"

echo "=== ADD NOTIFICATIONS MENU ITEM ==="
echo ""

# Add Bell to imports
sed -i '/import {/a\  Bell,' "$FILE"

echo "✓ Added Bell to imports"

# Find the TV Hub navItems array and add Notifications after Integrations (for videotron) or after Settings (for tv_hub)
# Let's add it before Settings for both menus

# For TV Hub menu - add before Settings
sed -i '/tv_hub.*{/,/});/ {
  /title: .Settings.,/i\
        {\
          title: '\''Notifications & Alerts'\'',\
          href: '\''/dashboard/notifications'\'',\
          icon: Bell,\
        },
}' "$FILE"

echo "✓ Added Notifications to TV Hub menu"

# For Videotron menu - add before Settings
sed -i '/videotron.*{/,/});/ {
  /title: .Settings.,/i\
        {\
          title: '\''Notifications & Alerts'\'',\
          href: '\''/dashboard/notifications'\'',\
          icon: Bell,\
        },
}' "$FILE"

echo "✓ Added Notifications to Videotron menu"
echo ""
echo "=== DONE ==="
