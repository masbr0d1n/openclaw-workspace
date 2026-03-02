#!/usr/bin/env python3
"""
Clean edit of page.tsx with proper template literals
"""

import re

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

# Read file
with open(file_path, 'r') as f:
    content = f.read()

# === 1. Update File Type display (in the View Details modal) ===
# Line around 705-708
file_type_pattern = r'''(\s+)<div>\s+<Label className="text-muted-foreground text-xs">File Type</Label>\s+<p>\{selectedVideo\.video_url \? getFileExtension\(selectedVideo\.video_url\) : 'Unknown'\}</p>\s+</div>'''

file_type_replacement = r'''\1<div>
\1                  <Label className="text-muted-foreground text-xs">File Type</Label>
\1                  <div className="mt-1">
\1                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getFileBadgeColor(selectedVideo.content_type, selectedVideo.video_url)}`}>
\1                      {selectedVideo.video_url ? getFileExtension(selectedVideo.video_url).toUpperCase() : 'UNKNOWN'}
\1                    </span>
\1                    <span className="ml-2 text-xs text-slate-500">
\1                      {selectedVideo.content_type === 'video' ? 'Video' : selectedVideo.content_type === 'image' ? 'Image' : 'Unknown'}
\1                    </span>
\1                  </div>
\1                </div>'''

content = re.sub(file_type_pattern, file_type_replacement, content)

print("✓ Updated File Type badge")

# === 2. Update Expiry Date display ===
# Line around 727-731
expiry_pattern = r'''(\s+)<div>\s+<Label className="text-muted-foreground text-xs">Expiry Date</Label>\s+<p className="font-medium">\{selectedVideo\.expiry_date \?\s+new Date\(selectedVideo\.expiry_date\)\.toLocaleDateString\(\)\s+: 'Never'\}</p>\s+</div>'''

expiry_replacement = r'''\1<div>
\1                  <Label className="text-muted-foreground text-xs">Expiry Date</Label>
\1                  <p className={`font-medium ${selectedVideo.expiry_date ? 'text-red-500 dark:text-red-400' : ''}`}>
\1                    {selectedVideo.expiry_date
\1                      ? new Date(selectedVideo.expiry_date).toLocaleDateString()
\1                      : 'Never'}
\1                  </p>
\1                </div>'''

content = re.sub(expiry_pattern, expiry_replacement, content)

print("✓ Updated Expiry Date color")

# Write back
with open(file_path, 'w') as f:
    f.write(content)

print("\n=== CHANGES APPLIED ===")
