#!/usr/bin/env python3

file_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content/page.tsx"

with open(file_path, 'r') as f:
    content = f.read()

# Helper function code
helper_code = """

// Helper: Get badge color for file type
const getFileBadgeColor = (contentType: string | undefined, filePath: string | undefined) => {
  if (contentType === 'video') {
    return 'bg-red-500 text-white border-red-600';
  } else if (contentType === 'image') {
    return 'bg-green-500 text-white border-green-600';
  }
  // Fallback: check file extension
  if (filePath) {
    const ext = filePath.toLowerCase().split('.').pop();
    if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv') {
      return 'bg-red-500 text-white border-red-600';
    } else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'bmp') {
      return 'bg-green-500 text-white border-green-600';
    }
  }
  return 'bg-slate-500 text-white border-slate-600'; // Default
};
"""

# Find getFileExtension function and add helper after it
import re

pattern = r"(const getFileExtension = \(filePath: string\) => \{[^}]+\})"
match = re.search(pattern, content)

if match:
    # Insert helper after getFileExtension
    insert_pos = match.end()
    content = content[:insert_pos] + helper_code + content[insert_pos:]
    print("✓ Added getFileBadgeColor helper function")
else:
    print("✗ Could not find getFileExtension function")

with open(file_path, 'w') as f:
    f.write(content)

print("=== DONE ===")
