#!/bin/bash
# Add UI improvements to Content Details modal

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== ADDING UI/UX IMPROVEMENTS ==="
echo ""

# 1. Add helper function to detect file type and return badge color
# Find the getFileExtension function and add the new helper after it

# First, let's check if the helper exists
if ! grep -q "getFileBadgeColor" "$FILE"; then
  echo "Adding getFileBadgeColor helper function..."

  # Find the getFileExtension function and add the new helper after it
  awk '
    /const getFileExtension = \(filePath: string\) => \{/,/^\}/ {
      print
      if (/^\}/) {
        print ""
        print "  // Helper: Get badge color for file type"
        print "  const getFileBadgeColor = (contentType: string | undefined, filePath: string | undefined) => {"
        print "    if (contentType === '\''video'\'') {"
        print "      return '\''bg-red-500 text-white border-red-600'\'';"
        print "    } else if (contentType === '\''image'\'') {"
        print "      return '\''bg-green-500 text-white border-green-600'\'';"
        print "    }"
        print "    // Fallback: check file extension"
        print "    if (filePath) {"
        print "      const ext = filePath.toLowerCase().split('\''.'\'').pop();"
        print "      if (ext === '\''mp4'\'' || ext === '\''mov'\'' || ext === '\''avi'\'' || ext === '\''mkv'\'') {"
        print "        return '\''bg-red-500 text-white border-red-600'\'';"
        print "      } else if (ext === '\''jpg'\'' || ext === '\''jpeg'\'' || ext === '\''png'\'' || ext === '\''gif'\'' || ext === '\''bmp'\'') {"
        print "        return '\''bg-green-500 text-white border-green-600'\'';"
        print "      }"
        print "    }"
        print "    return '\''bg-slate-500 text-white border-slate-600'\''; // Default"
        print "  };"
        print ""
        next
      }
      next
    }
    { print }
  ' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

  echo "✓ Added getFileBadgeColor helper"
else
  echo "✓ getFileBadgeColor already exists"
fi

echo ""
echo "=== UPDATE COMPLETE ==="
echo "Next: Update modal display elements"
