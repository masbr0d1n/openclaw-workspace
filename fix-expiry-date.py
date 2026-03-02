#!/usr/bin/env python3
import re

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# === Update Expiry Date with exact whitespace match ===
# Looking at the actual output, we need to match the exact indentation

old_expiry = r"""                  <div>
                    <Label className="text-muted-foreground text-xs">Expiry Date</Label>
                    <p className="font-medium">{selectedVideo.expiry_date 
                      ? new Date(selectedVideo.expiry_date).toLocaleDateString()
                      : 'Never'}</p>
                  </div>"""

new_expiry = """                  <div>
                    <Label className="text-muted-foreground text-xs">Expiry Date</Label>
                    <p className={`font-medium ${selectedVideo.expiry_date ? 'text-red-500 dark:text-red-400' : ''}`}>
                      {selectedVideo.expiry_date
                        ? new Date(selectedVideo.expiry_date).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>"""

if old_expiry in content:
    content = content.replace(old_expiry, new_expiry)
    print("✓ Updated Expiry Date (with space)")
else:
    # Try without the trailing space
    old_expiry2 = """                  <div>
                    <Label className="text-muted-foreground text-xs">Expiry Date</Label>
                    <p className="font-medium">{selectedVideo.expiry_date
                      ? new Date(selectedVideo.expiry_date).toLocaleDateString()
                      : 'Never'}</p>
                  </div>"""
    
    if old_expiry2 in content:
        content = content.replace(old_expiry2, new_expiry)
        print("✓ Updated Expiry Date (no space)")
    else:
        print("✗ Expiry Date pattern not found")
        # Show what we're looking for
        print("\nLooking for pattern with 'selectedVideo.expiry_date'...")

with open(file_path, 'w') as f:
    f.write(content)
