#!/usr/bin/env python3
"""
Direct edit of page.tsx to add UI improvements
"""

import re

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

# Read file
with open(file_path, 'r') as f:
    content = f.read()

# === 1. Update File Type display ===
# Find the File Type section and replace it
file_type_old = r'''                <div>
                  <Label className="text-muted-foreground text-xs">File Type</Label>
                  <p>{selectedVideo\.video_url \? getFileExtension\(selectedVideo\.video_url\) : 'Unknown'}</p>
                </div>'''

file_type_new = '''                <div>
                  <Label className="text-muted-foreground text-xs">File Type</Label>
                  <div className="mt-1">
                    <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border \${getFileBadgeColor(selectedVideo.content_type, selectedVideo.video_url)}\`}>
                      {selectedVideo.video_url ? getFileExtension(selectedVideo.video_url).toUpperCase() : 'UNKNOWN'}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      {selectedVideo.content_type === 'video' ? 'Video' : selectedVideo.content_type === 'image' ? 'Image' : 'Unknown'}
                    </span>
                  </div>
                </div>'''

content = re.sub(file_type_old, file_type_new, content)

print("✓ Updated File Type badge")

# === 2. Update Expiry Date color ===
expiry_old = r'''                <div>
                  <Label className="text-muted-foreground text-xs">Expiry Date</Label>
                  <p className="font-medium">{selectedVideo\.expiry_date 
                    \? new Date\(selectedVideo\.expiry_date\)\.toLocaleDateString\(\)
                    : 'Never'}</p>
                </div>'''

expiry_new = '''                <div>
                  <Label className="text-muted-foreground text-xs">Expiry Date</Label>
                  <p className={\`font-medium \${selectedVideo.expiry_date ? 'text-red-500 dark:text-red-400' : ''}\`}>
                    {selectedVideo.expiry_date
                      ? new Date(selectedVideo.expiry_date).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>'''

content = re.sub(expiry_old, expiry_new, content)

print("✓ Updated Expiry Date color")

# Write back
with open(file_path, 'w') as f:
    f.write(content)

print("\n=== UI/UX IMPROVEMENTS APPLIED ===")
print("1. File Type badge with color (red=video, green=image)")
print("2. Expiry Date in red when set")
print("\nReady to build and deploy!")
