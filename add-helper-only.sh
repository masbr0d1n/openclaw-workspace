#!/bin/bash
# Manual, safe edit using sed with proper escaping

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== APPLYING UI IMPROVEMENTS ==="
echo ""

# 1. First, add the helper function if not exists
if ! grep -q "getFileBadgeColor" "$FILE"; then
  echo "Adding getFileBadgeColor helper..."

  # Find getFileExtension and add helper after it
  awk '
    /^const getFileExtension/,/^}/ {
      print
      if (/^}/ && !added) {
        print ""
        print "// Helper: Get badge color for file type"
        print "const getFileBadgeColor = (contentType: string | undefined, filePath: string | undefined) => {"
        print "  if (contentType === '\''video'\'') {"
        print "    return '\''bg-red-500 text-white border-red-600'\'';"
        print "  } else if (contentType === '\''image'\'') {"
        print "    return '\''bg-green-500 text-white border-green-600'\'';"
        print "  }"
        print "  if (filePath) {"
        print "    const ext = filePath.toLowerCase().split('\''.'\'').pop();"
        print "    if (ext === '\''mp4'\'' || ext === '\''mov'\'' || ext === '\''avi'\'' || ext === '\''mkv'\'') {"
        print "      return '\''bg-red-500 text-white border-red-600'\'';"
        print "    } else if (ext === '\''jpg'\'' || ext === '\''jpeg'\'' || ext === '\''png'\'' || ext === '\''gif'\'' || ext === '\''bmp'\'') {"
        print "      return '\''bg-green-500 text-white border-green-600'\'';"
        print "    }"
        print "  }"
        print "  return '\''bg-slate-500 text-white border-slate-600'\'';"
        print "};"
        print ""
        added = 1
      }
      next
    }
    { print }
  ' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

  echo "✓ Added helper function"
fi

echo ""
echo "Ready to build!"
