#!/bin/bash

set -e

echo "🚀 Membuat RSPress Blog..."

# Create project directory
mkdir -p rspress-blog
cd rspress-blog

# Initialize RSPress project using Docker
echo "📦 Menginstall RSPress..."
docker run --rm -v "$(pwd):/app" -w /app node:20-alpine sh -c "
    npm create rspress@latest . -- --template default
"

echo "✅ RSPress blog berhasil dibuat!"
echo ""
echo "📍 Lokasi: /home/sysop/.openclaw/workspace/rspress-blog"
echo ""
