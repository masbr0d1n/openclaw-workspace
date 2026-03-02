#!/usr/bin/env python3
"""
Properly add Notifications & Alerts menu item to layout.tsx
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/layout.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# 1. Add Bell to the lucide-react imports
# Find the import statement and add Bell
content = content.replace(
    "import {\n  LayoutDashboard,\n  Video,\n  Users,\n  Settings,\n  Music,\n  ChevronLeft,\n  ChevronRight,\n  Menu,\n  X,\n  FileText,\n  Building2,\n} from 'lucide-react';",
    "import {\n  LayoutDashboard,\n  Video,\n  Users,\n  Settings,\n  Music,\n  ChevronLeft,\n  ChevronRight,\n  Menu,\n  X,\n  FileText,\n  Building2,\n  Bell,\n} from 'lucide-react';"
)

# 2. Add Notifications menu item before Settings in TV Hub menu
tv_hub_notifications = """        {
          title: 'Notifications & Alerts',
          href: '/dashboard/notifications',
          icon: Bell,
        },
        {
          title: 'Settings',
          href: '/dashboard/settings',
          icon: Settings,
        },"""

# Find the TV Hub Settings entry and replace with Notifications + Settings
content = content.replace(
    """        {
          title: 'Settings',
          href: '/dashboard/settings',
          icon: Settings,
        },
      ];""",
    tv_hub_notifications + "\n      ];"
)

# 3. Add Notifications menu item before Settings in Videotron menu
# Find the videotron section
videotron_section = """// Videotron Menu - Different structure
    if (loginCategory === 'videotron') {
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Screens',
          href: '/dashboard/screens',
          icon: Video,
        },
        {
          title: 'Content',
          href: '/dashboard/content',
          icon: Video,
        },
        {
          title: 'Schedules',
          href: '/dashboard/schedules',
          icon: Music,
        },
        {
          title: 'Layouts',
          href: '/dashboard/layouts',
          icon: LayoutDashboard,
        },
        {
          title: 'Analytics',
          href: '/dashboard/analytics',
          icon: FileText,
        },
        {
          title: 'Users',
          href: '/dashboard/users',
          icon: Users,
        },
        {
          title: 'Integrations',
          href: '/dashboard/integrations',
          icon: Settings,
        },
        {
          title: 'Settings',
          href: '/dashboard/settings',
          icon: Settings,
        },
      ];"""

videotron_new = """// Videotron Menu - Different structure
    if (loginCategory === 'videotron') {
      return [
        {
          title: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Screens',
          href: '/dashboard/screens',
          icon: Video,
        },
        {
          title: 'Content',
          href: '/dashboard/content',
          icon: Video,
        },
        {
          title: 'Schedules',
          href: '/dashboard/schedules',
          icon: Music,
        },
        {
          title: 'Layouts',
          href: '/dashboard/layouts',
          icon: LayoutDashboard,
        },
        {
          title: 'Analytics',
          href: '/dashboard/analytics',
          icon: FileText,
        },
        {
          title: 'Users',
          href: '/dashboard/users',
          icon: Users,
        },
        {
          title: 'Integrations',
          href: '/dashboard/integrations',
          icon: Settings,
        },
        {
          title: 'Notifications & Alerts',
          href: '/dashboard/notifications',
          icon: Bell,
        },
        {
          title: 'Settings',
          href: '/dashboard/settings',
          icon: Settings,
        },
      ];"""

content = content.replace(videotron_section, videotron_new)

with open(file_path, 'w') as f:
    f.write(content)

print("✓ Added Bell to lucide-react imports")
print("✓ Added Notifications menu to TV Hub")
print("✓ Added Notifications menu to Videotron")
print("\n=== DONE ===")
