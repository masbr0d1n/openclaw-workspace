#!/bin/bash
# Local Puppeteer-based Twitter scraper
# Runs from workspace with local npm modules

WORKSPACE="/home/sysop/.openclaw/workspace"
cd "$WORKSPACE"

echo "[Wrapper] Checking local Puppeteer installation..."

# Check if Puppeteer is installed locally
if [ ! -d "$WORKSPACE/node_modules/puppeteer" ]; then
    echo "❌ Puppeteer not found locally!"
    echo ""
    echo "Installing Puppeteer locally (no sudo required)..."
    echo ""

    # Initialize npm project if needed
    if [ ! -f "$WORKSPACE/package.json" ]; then
        npm init -y >/dev/null 2>&1
    fi

    # Install Puppeteer locally
    npm install puppeteer --silent

    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Failed to install Puppeteer locally."
        echo ""
        echo "Please install npm first:"
        echo "  sudo pacman -S npm"
        echo ""
        echo "Then run:"
        echo "  cd $WORKSPACE"
        echo "  npm install puppeteer"
        exit 1
    fi

    echo "✅ Puppeteer installed!"
    echo ""
fi

# Run the scraper with local node_modules
echo "[Wrapper] Starting Twitter scraper..."
NODE_PATH="$WORKSPACE/node_modules" node "$WORKSPACE/twitter-scraper.js"
