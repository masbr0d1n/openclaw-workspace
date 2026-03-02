#!/usr/bin/env python3
"""
Very careful line-by-line replacement
"""

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# === 1. Update File Type ===
old_file_type = """                    <div>
                      <Label className="text-muted-foreground text-xs">File Type</Label>
                      <p>{selectedVideo.video_url ? getFileExtension(selectedVideo.video_url) : 'Unknown'}</p>
                    </div>"""

new_file_type = """                    <div>
                      <Label className="text-muted-foreground text-xs">File Type</Label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getFileBadgeColor(selectedVideo.content_type, selectedVideo.video_url)}`}>
                          {selectedVideo.video_url ? getFileExtension(selectedVideo.video_url).toUpperCase() : 'UNKNOWN'}
                        </span>
                        <span className="ml-2 text-xs text-slate-500">
                          {selectedVideo.content_type === 'video' ? 'Video' : selectedVideo.content_type === 'image' ? 'Image' : 'Unknown'}
                        </span>
                      </div>
                    </div>"""

if old_file_type in content:
    content = content.replace(old_file_type, new_file_type)
    print("✓ Updated File Type badge")
else:
    print("✗ File Type pattern not found")

# === 2. Update Expiry Date ===
old_expiry = """                  <div>
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
    print("✓ Updated Expiry Date color")
else:
    print("✗ Expiry Date pattern not found")

with open(file_path, 'w') as f:
    f.write(content)

print("\n=== DONE ===")
