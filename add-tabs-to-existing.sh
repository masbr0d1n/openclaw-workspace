#!/bin/bash
# Simplified approach: Add tabs directly to existing page

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

# Backup first
cp "$FILE" "$FILE.backup-tabs"

echo "=== ADDING TABS TO CONTENT PAGE ==="
echo ""

# Add useState for activeTab at the beginning of the component
# Find the line with const [videos, setVideos and add activeTab state before it

# First, let's add the import for tabs at the top
sed -i "/import { Textarea } from '@\/components\/ui\/textarea';/a\\
\\
// Tab components - will be created inline\\
const TABS = [\\
  { id: 'media-library', label: 'Media Library' },\\
  { id: 'playlists', label: 'Playlists' },\\
  { id: 'layouts', label: 'Layouts' },\\
  { id: 'templates', label: 'Templates' },\\
  { id: 'feeds', label: 'Feeds (Dynamic Content)' },\\
  { id: 'campaigns', label: 'Campaigns' },\\
  { id: 'approval-workflow', label: 'Approval Workflow' },\\
  { id: 'archive', label: 'Archive' },\\
];" "$FILE"

echo "✓ Added TABS constant"

# Add activeTab state after videos state
sed -i "/const \[videos, setVideos\] = useState<any\[\]>(\[\]);/a\\
  const \[activeTab, setActiveTab\] = useState<string>('media-library');" "$FILE"

echo "✓ Added activeTab state"
echo ""
echo "=== NEXT STEPS ==="
echo "Now manually add the tabs UI and conditional rendering"
echo "See page-with-tabs.tsx for reference implementation"
