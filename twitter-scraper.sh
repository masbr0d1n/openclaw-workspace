#!/bin/bash
# Wrapper for Puppeteer-based Twitter scraper
WORKSPACE="/home/sysop/.openclaw/workspace"

echo "[Wrapper] Starting Twitter scraper with Puppeteer..."

# Check if Puppeteer is installed
if ! npm list -g puppeteer >/dev/null 2>&1; then
    echo "❌ Puppeteer not found!"
    echo ""
    echo "Please install Puppeteer first:"
    echo "  npm install -g puppeteer"
    echo ""
    echo "This will download Chromium headless automatically."
    exit 1
fi

# Run the Node.js script
node "$WORKSPACE/twitter-scraper.js"
