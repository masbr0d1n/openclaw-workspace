#!/usr/bin/env python3
"""
Simple approach: Just create a new tabbed page and move the old content to a component
"""

import shutil
import os

base_path = "/home/sysop/.openclaw/workspace/streamhub-nextjs/src/app/dashboard/content"

# Step 1: Move the current page.tsx to media-library.tsx component
old_page = os.path.join(base_path, "page-before-tabs.tsx")
new_component = os.path.join(base_path, "components", "media-library-full.tsx")

# Read the old page
with open(old_page, 'r') as f:
    content = f.read()

# Modify it to be a named export instead of default
content = content.replace("export default function ContentPage() {", "export function MediaLibraryFull() {")
content = content.replace("export default function ContentPage(", "export function MediaLibraryFull(")

# Add forward comment at the top
content = "/**\n * Media Library Component\n * Original content page functionality\n * Moved here to support tabbed interface\n */\n\n" + content

# Write as component
with open(new_component, 'w') as f:
    f.write(content)

print("✓ Created media-library-full.tsx component")

# Step 2: Update the placeholder media-library-content.tsx to use this
placeholder_path = os.path.join(base_path, "components", "media-library-content.tsx")

with open(placeholder_path, 'r') as f:
    placeholder = f.read()

new_placeholder = ''''use client';

/**
 * Media Library Content Component
 * Imports and renders the original content page functionality
 */

import { MediaLibraryFull } from './media-library-full';

export function MediaLibraryContent() {
  return <MediaLibraryFull />;
}
'''

with open(placeholder_path, 'w') as f:
    f.write(new_placeholder)

print("✓ Updated media-library-content.tsx to use full component")

# Step 3: Now we can use the page-with-tabs.tsx as the new page.tsx
tabs_page = os.path.join(base_path, "page-with-tabs.tsx")
main_page = os.path.join(base_path, "page.tsx")

# Copy the tabs page to main page
shutil.copy(tabs_page, main_page)

print("✓ Set page-with-tabs.tsx as the new main page.tsx")
print("")
print("=== DONE ===")
print("The content page now has tabs with all existing functionality in Media Library tab")
