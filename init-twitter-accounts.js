#!/usr/bin/env node
/**
 * Initialize new Twitter accounts in state
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const STATE_FILE = '/home/sysop/.openclaw/workspace/twitter-scraper-state.json';
const ACCOUNTS = ['lwastuargo', 'Y_D_Y_P', 'tom_doerr'];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchLatestTweetId(account) {
    let browser = null;
    try {
        console.log(`Fetching @${account}...`);
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(`https://x.com/${account}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        await delay(3000);

        const tweetIds = await page.evaluate(() => {
            const links = document.querySelectorAll('a[href*="/status/"]');
            const ids = new Set();

            links.forEach(link => {
                const href = link.getAttribute('href');
                const match = href.match(/\/status\/(\d+)/);
                if (match) {
                    ids.add(match[1]);
                }
            });

            return Array.from(ids).sort((a, b) => b - a);
        });

        await browser.close();
        return tweetIds.length > 0 ? tweetIds[0] : null;

    } catch (error) {
        if (browser) await browser.close();
        console.error(`  Error: ${error.message}`);
        return null;
    }
}

async function main() {
    console.log('=== Initializing New Twitter Accounts ===\n');

    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));

    for (const account of ACCOUNTS) {
        const tweetId = await fetchLatestTweetId(account);

        if (tweetId) {
            state.last_seen[account] = tweetId;
            console.log(`  ✓ @${account}: ${tweetId}`);
        } else {
            console.log(`  ✗ Failed to fetch @${account}`);
        }
    }

    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log('\n✅ State updated! New accounts initialized.');
    console.log(`Now monitoring ${Object.keys(state.last_seen).length} accounts total.`);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
