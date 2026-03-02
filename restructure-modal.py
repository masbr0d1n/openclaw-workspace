#!/usr/bin/env python3
"""
Restructure modal layout: Move cards below description, remove action buttons
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# The current structure has a grid with 2 columns
# We need to change it to a single column layout

# Find and replace the grid section
# Old: 2-column grid with left (7) and right (5) columns
# New: Single column with all content stacked

old_grid = '''              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column - 7 cols */}
                  <div className="lg:col-span-7 space-y-6">'''

new_grid = '''              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="space-y-6">'''

content = content.replace(old_grid, new_grid)

# Now we need to restructure the content
# The video player should stay, then description, then tags, then the cards
# And remove the right column div

# Find the closing of left column and opening of right column
old_col_split = '''                  </div>
                  {/* Right Column - 5 cols */}
                  <div className="lg:col-span-5 space-y-6">'''

new_col_split = '''                  {/* Description */}
                  </div>

                  {/* General Information Card */}
                  <div className="space-y-6">'''

content = content.replace(old_col_split, new_col_split)

# Remove the right column closing div and action buttons
# Find the action buttons section and remove it
old_actions = '''                    {/* Action Buttons */}
                    <div className="pt-4 flex gap-3">
                      <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>'''

new_actions = '''                  </div>
                </div>
              </div>'''

content = content.replace(old_actions, new_actions)

with open(file_path, 'w') as f:
    f.write(content)

print("✓ Restructured modal layout")
print("  - Changed from 2-column grid to single column")
print("  - Moved General Information and Video Metadata below Description")
print("  - Removed Download and Share buttons")
