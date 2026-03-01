#!/bin/bash
# Install npm and Puppeteer locally (no sudo required)

WORKSPACE="/home/sysop/.openclaw/workspace"
cd "$WORKSPACE"

echo "📦 Installing Puppeteer locally..."

# Create a local npm project
if [ ! -f "$WORKSPACE/package.json" ]; then
    npm init -y >/dev/null 2>&1 || {
        echo "❌ npm not found. Please install:"
        echo "   sudo pacman -S npm"
        echo ""
        echo "Then run this script again."
        exit 1
    }
fi

# Install Puppeteer locally
echo "Downloading Puppeteer and Chromium..."
npm install puppeteer --silent

if [ $? -eq 0 ]; then
    echo "✅ Puppeteer installed successfully!"
    echo "📂 Location: $WORKSPACE/node_modules/puppeteer"
    echo ""
    echo "Chromium will be downloaded automatically on first run."
else
    echo "❌ Installation failed"
    exit 1
fi
