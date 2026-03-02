#!/bin/bash
# Fix modal layout properly

cd /home/sysop/.openclaw/workspace/streamhub-nextjs

# Backup
cp src/app/dashboard/content/page.tsx src/app/dashboard/content/page-before-layout-fix.tsx

# Fix DialogContent
perl -i -pe 's/DialogContent className="max-w-5xl max-h-\[90vh\] p-0 overflow-hidden rounded-2xl/DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden rounded-2xl flex flex-col"/' src/app/dashboard/content/page.tsx

# Fix overflow area  
perl -i -pe 's/className="flex-1 overflow-y-auto px-8 py-6 min-h-0"/className="flex-1 overflow-y-auto px-8 py-6 min-h-0"/' src/app/dashboard/content/page.tsx

# Fix header
perl -i -pe 's/<div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">/<div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">/' src/app/dashboard/content/page.tsx

# Fix footer
perl -i -pe 's/<div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50\/50 dark:bg-slate-900\/50 flex justify-end">/<div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50\/50 dark:bg-slate-900\/50 flex justify-end shrink-0">/' src/app/dashboard/content/page.tsx

# Fix grid gap
perl -i -pe 's/<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">/<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">/' src/app/dashboard/content/page.tsx

echo "✓ Layout fixes applied properly"
echo ""
echo "Verifying..."
grep "DialogContent className.*flex flex-col" src/app/dashboard/content/page.tsx | head -1
grep "min-h-0" src/app/dashboard/content/page.tsx | head -1
grep "shrink-0" src/app/dashboard/content/page.tsx | head -2
