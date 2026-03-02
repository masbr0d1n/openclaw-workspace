#!/bin/bash
# Manual fixes

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

FILE="src/app/dashboard/content/page.tsx"

echo "=== APPLYING FINAL TWEAKS ==="
echo ""

# 1. Change background color #eceff4 → #f8fafc
sed -i 's/bg-\\\[\\#eceff4\\]/bg-[\\#f8fafc]/' "$FILE"

echo "✓ 1. Background: #eceff4 → #f8fafc"

# 2. File Type → Extension (outside metadata)
sed -i 's/<Label className="text-muted-foreground text-xs">File Type<\/Label>/<Label className="text-muted-foreground text-xs">Extension<\/Label>/' "$FILE"

echo "✓ 2. Label: File Type → Extension"

# 3. Category value to badge with uppercase
# Find the category paragraph and replace with badge
python3 << 'PYTHON'
with open('src/app/dashboard/content/page.tsx', 'r') as f:
    content = f.read()

# Change category to badge
old_cat = '''<p className="text-sm font-medium capitalize">{selectedVideo.category || '-'}</p>'''
new_cat = '''<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 uppercase">{selectedVideo.category || '-'}</span>'''

content = content.replace(old_cat, new_cat)

with open('src/app/dashboard/content/page.tsx', 'w') as f:
    f.write(content)

print("✓ 3. Category: badge with uppercase")
PYTHON

echo ""
echo "=== DONE ==="
