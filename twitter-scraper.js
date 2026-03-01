#!/usr/bin/env node
/**
 * Twitter/X Scraper using Puppeteer
 * Headless browser automation for tweet monitoring
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = '/home/sysop/.openclaw/workspace';
const STATE_FILE = path.join(WORKSPACE, 'twitter-scraper-state.json');
const LOG_FILE = path.join(WORKSPACE, 'twitter-scraper.log');
const CHAT_ID = '-1003883313656';
const TOPIC_ID = '362';

const ACCOUNTS = [
  'hanifproduktif', 'DilumSanjaya', 'levifikri', 'RayFernando1337',
  'AISecHub', 'bardanslm', 'KimiProduct', 'syfaeth'
];

// Logging
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage);
    console.log(message);
}

// Initialize state file
function initState() {
    if (!fs.existsSync(STATE_FILE)) {
        const initialState = {
            last_seen: {},
            last_check: Math.floor(Date.now() / 1000)
        };
        fs.writeFileSync(STATE_FILE, JSON.stringify(initialState, null, 2));
        log('State initialized');
    }
}

// Load state
function loadState() {
    try {
        const data = fs.readFileSync(STATE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        log(`Error loading state: ${error.message}`);
        return { last_seen: {}, last_check: 0 };
    }
}

// Save state
function saveState(state) {
    state.last_check = Math.floor(Date.now() / 1000);
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Get last seen tweet for account
function getLastSeen(account) {
    const state = loadState();
    return state.last_seen[account] || null;
}

// Update last seen tweet
function updateLastSeen(account, tweetId) {
    const state = loadState();
    state.last_seen[account] = tweetId;
    saveState(state);
    log(`✓ Updated @${account}: ${tweetId}`);
}

// Fetch tweet details with context
async function fetchTweetDetails(page, account, tweetId) {
    try {
        await page.goto(`https://x.com/${account}/status/${tweetId}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await delay(2000);

        const tweetData = await page.evaluate(() => {
            const tweetText = document.querySelector('[data-testid="tweetText"]')?.innerText || '';
            const time = document.querySelector('time')?.getAttribute('datetime') || '';
            const likes = document.querySelector('[data-testid="like"]')?.innerText || '0';
            const retweets = document.querySelector('[data-testid="retweet"]')?.innerText || '0';
            const replies = document.querySelector('[data-testid="reply"]')?.innerText || '0';
            const views = document.querySelector('[data-testid="views"]')?.innerText || '0';

            // Get images
            const images = [];
            document.querySelectorAll('[data-testid="tweetPhoto"] img').forEach(img => {
                images.push(img.src);
            });

            return {
                text: tweetText,
                time: time,
                likes: likes,
                retweets: retweets,
                replies: replies,
                views: views,
                images: images.slice(0, 3) // Max 3 images
            };
        });

        return tweetData;
    } catch (error) {
        log(`  ✗ Error fetching tweet details: ${error.message}`);
        return null;
    }
}

// Analyze tweet with rule-based interpretation (fast & reliable)
function analyzeTweetContext(tweetText, account) {
    const text = tweetText.toLowerCase();
    
    // Topic detection
    let topic = 'General';
    if (text.includes('productivity') || text.includes('workflow') || text.includes('tool')) topic = 'Productivity';
    else if (text.includes('ai') || text.includes('machine learning') || text.includes('llm')) topic = 'AI/Tech';
    else if (text.includes('startup') || text.includes('business') || text.includes('revenue')) topic = 'Business';
    else if (text.includes('coding') || text.includes('programming') || text.includes('dev')) topic = 'Tech/Coding';
    else if (text.includes('life') || text.includes('personal') || text.includes('journey')) topic = 'Personal';
    else if (text.includes('thread') || text.includes('🧵')) topic = 'Thread';
    
    // Sentiment detection
    let sentiment = 'Netral';
    const positiveWords = ['great', 'awesome', 'love', 'best', 'amazing', 'bagus', 'keren', 'sukses', 'selamat', '✨', '🔥', '💪'];
    const negativeWords = ['bad', 'fail', 'worst', 'hate', 'problem', 'issue', 'gagal', 'buruk', '❌', '😞'];
    
    const positiveCount = positiveWords.filter(w => text.includes(w)).length;
    const negativeCount = negativeWords.filter(w => text.includes(w)).length;
    
    if (positiveCount > negativeCount) sentiment = 'Positif';
    else if (negativeCount > positiveCount) sentiment = 'Negatif';
    
    // Context & takeaway based on keywords
    let context = '';
    let takeaway = '';
    
    if (topic === 'Productivity') {
        context = 'Berisi tips/insight seputar produktivitas';
        takeaway = text.includes('cara') ? 'Metode praktis untuk improvement' : 'Insight untuk optimasi workflow';
    } else if (topic === 'AI/Tech') {
        context = 'Update atau opinion seputar AI/teknologi';
        takeaway = 'Info terkini perkembangan tech';
    } else if (topic === 'Business') {
        context = 'Konten bisnis/entrepreneurship';
        takeaway = 'Pelajaran bisnis dari pengalaman';
    } else if (topic === 'Thread') {
        context = 'Thread edu/konten';
        takeaway = 'Pembahasan topik secara mendalam';
    } else {
        context = `Tweet dari @${account}`;
        takeaway = 'Konten sesuai topic pembahasan';
    }
    
    log(`  ✓ Context analysis: ${topic} | ${sentiment}`);
    return { topic, sentiment, context, takeaway };
}

// Send notification to Telegram with detailed context
async function sendNotification(account, tweetId, tweetData) {
    const tweetUrl = `https://x.com/${account}/status/${tweetId}`;
    
    let message = `🐦 **@${account}** posted something new!\n\n`;
    
    if (tweetData && tweetData.text) {
        message += `📝 **Tweet Content:**\n${tweetData.text}\n\n`;
        
        // AI Analysis section
        if (tweetData.aiAnalysis) {
            const ai = tweetData.aiAnalysis;
            const sentimentEmoji = ai.sentiment.toLowerCase().includes('positif') ? '😊' : 
                                  ai.sentiment.toLowerCase().includes('negatif') ? '😟' : '😐';
            
            message += `🤖 **AI Analysis:**\n`;
            message += `📌 Topic: ${ai.topic}\n`;
            message += `${sentimentEmoji} Sentiment: ${ai.sentiment}\n`;
            if (ai.context) message += `🎯 Konteks: ${ai.context}\n`;
            if (ai.takeaway) message += `💡 Takeaway: ${ai.takeaway}\n`;
            message += `\n`;
        }
        
        if (tweetData.likes || tweetData.retweets || tweetData.views) {
            message += `📊 **Engagement:**\n`;
            if (tweetData.likes) message += `❤️ Likes: ${tweetData.likes}\n`;
            if (tweetData.retweets) message += `🔄 Retweets: ${tweetData.retweets}\n`;
            if (tweetData.replies) message += `💬 Replies: ${tweetData.replies}\n`;
            if (tweetData.views) message += `👁️ Views: ${tweetData.views}\n`;
            message += `\n`;
        }

        if (tweetData.time) {
            const date = new Date(tweetData.time);
            message += `🕒 Posted: ${date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`;
        }
    }
    
    message += `🔗 ${tweetUrl}`;

    try {
        execSync(
            `/home/sysop/.npm-global/bin/openclaw message send ` +
            `--channel telegram ` +
            `--target "${CHAT_ID}" ` +
            `--thread-id "${TOPIC_ID}" ` +
            `--message "${message}"`,
            { stdio: 'inherit' }
        );
        log('✓ Notification sent');
    } catch (error) {
        log(`Error sending notification: ${error.message}`);
    }
}

// Send status update
function sendStatus(summary) {
    try {
        execSync(
            `/home/sysop/.npm-global/bin/openclaw message send ` +
            `--channel telegram ` +
            `--target "${CHAT_ID}" ` +
            `--thread-id "${TOPIC_ID}" ` +
            `--message "${summary}"`,
            { stdio: 'inherit' }
        );
    } catch (error) {
        log(`Error sending status: ${error.message}`);
    }
}

// Helper function for delay (Puppeteer-compatible)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch latest tweet using Puppeteer
async function fetchLatestTweet(account) {
    let browser = null;

    try {
        log(`  Launching headless browser for @${account}...`);

        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navigate to profile
        log(`  Loading https://x.com/${account}...`);
        await page.goto(`https://x.com/${account}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for tweets to load
        await delay(3000);

        // Extract tweet IDs from the page
        const tweetIds = await page.evaluate((acct) => {
            const links = document.querySelectorAll('a[href*="/status/"]');
            const ids = new Set();

            links.forEach(link => {
                const href = link.getAttribute('href');
                const match = href.match(/\/status\/(\d+)/);
                if (match) {
                    ids.add(match[1]);
                }
            });

            return Array.from(ids).sort((a, b) => b - a); // Sort descending (newest first)
        }, account);

        if (tweetIds.length > 0) {
            log(`  ✓ Found ${tweetIds.length} tweets, latest: ${tweetIds[0]}`);
            
            // Return both tweet ID and page for fetching details
            return { 
                tweetId: tweetIds[0], 
                page: page,
                browser: browser
            };
        } else {
            log(`  ⚠️  No tweets found`);
            await browser.close();
            return { tweetId: null, page: null, browser: null };
        }

    } catch (error) {
        if (browser) {
            await browser.close();
        }
        log(`  ✗ Error: ${error.message}`);
        return null;
    }
}

// Main check function
async function checkUpdates() {
    initState();
    log('=== Twitter Update Check Started ===');

    let updatesFound = 0;
    let failed = 0;
    let success = 0;

    for (const account of ACCOUNTS) {
        log(`Checking @${account}...`);

        const lastSeen = getLastSeen(account);
        log(`  Last seen: ${lastSeen || 'none'}`);

        const result = await fetchLatestTweet(account);

        if (!result || !result.tweetId) {
            log(`  ✗ Failed to fetch @${account}`);
            failed++;
            continue;
        }

        const latestTweet = result.tweetId;
        log(`  Latest: ${latestTweet}`);
        success++;

        if (latestTweet !== lastSeen) {
            log(`  🎉 NEW TWEET!`);
            
            // Fetch tweet details with context
            let tweetData = null;
            if (result.page) {
                log(`  Fetching tweet details...`);
                tweetData = await fetchTweetDetails(result.page, account, latestTweet);
                
                // Run context analysis if we have tweet text
                if (tweetData && tweetData.text) {
                    log(`  Analyzing context...`);
                    const analysis = analyzeTweetContext(tweetData.text, account);
                    if (analysis) {
                        tweetData.aiAnalysis = analysis;
                    }
                }
            }
            
            // Close browser
            if (result.browser) {
                await result.browser.close();
            }
            
            sendNotification(account, latestTweet, tweetData);
            updateLastSeen(account, latestTweet);
            updatesFound++;
        } else {
            log(`  ✓ No new tweets`);
            // Close browser if no new tweets
            if (result.browser) {
                await result.browser.close();
            }
        }
    }

    log(`=== Check Complete: ${updatesFound} updates, ${success} OK, ${failed} failed ===`);

    // Send summary if all failed
    if (failed === ACCOUNTS.length || success === 0) {
        const summary = `⚠️ **Twitter Scraper Status**\n\n` +
            `📊 Akun: ${ACCOUNTS.length} | Sukses: ${success} | Gagal: ${failed}\n\n` +
            `❌ Gagal fetch tweets. Mungkin rate limit atau halaman gagal load.\n\n` +
            `Script akan auto-retry setiap 30 menit.`;
        sendStatus(summary);
    }

    process.exit(updatesFound > 0 ? 0 : 1);
}

// Run
checkUpdates().catch(error => {
    log(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
});
