#!/usr/bin/env python3
import sys

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    lines = f.readlines()

# Find and replace File Type section (lines 704-708, 0-indexed: 703-707)
# Replace:
#   <div>
#     <Label className="text-muted-foreground text-xs">File Type</Label>
#     <p>{selectedVideo.video_url ? getFileExtension(selectedVideo.video_url) : 'Unknown'}</p>
#   </div>

# With:
#   <div>
#     <Label className="text-muted-foreground text-xs">File Type</Label>
#     <div className="mt-1">
#       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getFileBadgeColor(selectedVideo.content_type, selectedVideo.video_url)}`}>
#         {selectedVideo.video_url ? getFileExtension(selectedVideo.video_url).toUpperCase() : 'UNKNOWN'}
#       </span>
#       <span className="ml-2 text-xs text-slate-500">
#         {selectedVideo.content_type === 'video' ? 'Video' : selectedVideo.content_type === 'image' ? 'Image' : 'Unknown'}
#       </span>
#     </div>
#   </div>

for i in range(len(lines) - 4):
    if i == 703:  # Line 704 (0-indexed)
        if '<Label className="text-muted-foreground text-xs">File Type</Label>' in lines[i+1]:
            # Found the section
            new_section = [
                '                    <div>\n',
                '                      <Label className="text-muted-foreground text-xs">File Type</Label>\n',
                '                      <div className="mt-1">\n',
                '                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getFileBadgeColor(selectedVideo.content_type, selectedVideo.video_url)}`}>\n',
                '                          {selectedVideo.video_url ? getFileExtension(selectedVideo.video_url).toUpperCase() : \'UNKNOWN\'}\n',
                '                        </span>\n',
                '                        <span className="ml-2 text-xs text-slate-500">\n',
                '                          {selectedVideo.content_type === \'video\' ? \'Video\' : selectedVideo.content_type === \'image\' ? \'Image\' : \'Unknown\'}\n',
                '                        </span>\n',
                '                      </div>\n',
                '                    </div>\n'
            ]
            # Replace lines 703-707 (5 lines) with 10 new lines
            lines = lines[:703] + new_section + lines[708:]
            print("✓ Updated File Type display")
            break

# Find and update Expiry Date section
# Need to find new line numbers after the above change
for i in range(len(lines) - 4):
    if '<Label className="text-muted-foreground text-xs">Expiry Date</Label>' in lines[i]:
        if i > 700 and 'selectedVideo.expiry_date' in lines[i+1]:
            # Found it - line ~727
            new_expiry = [
                '                  <div>\n',
                '                    <Label className="text-muted-foreground text-xs">Expiry Date</Label>\n',
                '                    <p className={`font-medium ${selectedVideo.expiry_date ? \'text-red-500 dark:text-red-400\' : ''}`}>\n',
                '                      {selectedVideo.expiry_date\n',
                '                        ? new Date(selectedVideo.expiry_date).toLocaleDateString()\n',
                '                        : \'Never\'}\n',
                '                    </p>\n',
                '                  </div>\n'
            ]
            # Find the closing </div> and replace entire block
            end_line = i + 4
            while end_line < len(lines) and '</div>' not in lines[end_line]:
                end_line += 1
            end_line += 1  # Include the closing div
            
            lines = lines[:i] + new_expiry + lines[end_line+1:]
            print("✓ Updated Expiry Date display")
            break

with open(file_path, 'w') as f:
    f.writelines(lines)

print("\n=== UI IMPROVEMENTS APPLIED ===")
