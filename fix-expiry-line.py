#!/usr/bin/env python3

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    lines = f.readlines()

# Find Expiry Date section around line 734
for i in range(len(lines) - 5):
    if i >= 730 and i <= 740:
        if 'Expiry Date</Label>' in lines[i+1]:
            # Found it at line i+1 = 734
            # Replace lines i+1 to i+5 (5 lines) with new version
            new_expiry = [
                '                  <Label className="text-muted-foreground text-xs">Expiry Date</Label>\n',
                '                  <p className={`font-medium ${selectedVideo.expiry_date ? \'text-red-500 dark:text-red-400\' : ''}`}>\n',
                '                    {selectedVideo.expiry_date\n',
                '                      ? new Date(selectedVideo.expiry_date).toLocaleDateString()\n',
                '                      : \'Never\'}\n',
                '                  </p>\n'
            ]
            # Replace from i to i+5 (6 lines including the opening div)
            lines = lines[:i] + new_expiry + lines[i+6:]
            print(f"✓ Updated Expiry Date at line {i+1}")
            break

with open(file_path, 'w') as f:
    f.writelines(lines)

print("=== DONE ===")
