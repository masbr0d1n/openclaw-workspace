#!/usr/bin/env node
/**
 * Fetch complete Twitter thread and convert to article
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const TWEET_URL = 'https://x.com/bardanslm/status/1888407459045445794';
const OUTPUT_FILE = '/home/sysop/.openclaw/workspace/thread-article.md';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchThread() {
    let browser = null;

    try {
        console.log('📱 Launching browser...');
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

        console.log(`📄 Loading: ${TWEET_URL}`);
        await page.goto(TWEET_URL, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await delay(5000);

        // Scroll to load all thread tweets
        console.log('⬇️  Scrolling to load all tweets...');

        for (let i = 0; i < 20; i++) {
            await page.evaluate(() => {
                window.scrollBy(0, 300);
            });
            await delay(500);
        }

        // Scroll back up
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });
        await delay(2000);

        // Extract all tweets from the thread
        console.log('📝 Extracting thread content...');

        // Get article count first
        const articleCount = await page.evaluate(() => {
            return document.querySelectorAll('article[data-testid="tweet"]').length;
        });

        console.log(`📊 Found ${articleCount} article elements`);

        const threadData = await page.evaluate(() => {
            const tweets = [];

            // Find all tweet articles in the thread
            const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');

            tweetElements.forEach((tweetEl, index) => {
                try {
                    // Author info
                    const authorName = tweetEl.querySelector('[data-testid="User-Name"] span')?.innerText || '';
                    const authorHandle = tweetEl.querySelector('[data-testid="User-Name"] a')?.href?.split('/')?.pop() || '';

                    // Tweet text
                    const textEl = tweetEl.querySelector('[data-testid="tweetText"]');
                    const text = textEl ? textEl.innerText : '';

                    // Time
                    const timeEl = tweetEl.querySelector('time');
                    const time = timeEl ? timeEl.getAttribute('datetime') : '';

                    // Engagement
                    const likes = tweetEl.querySelector('[data-testid="like"] span')?.innerText || '0';
                    const retweets = tweetEl.querySelector('[data-testid="retweet"] span')?.innerText || '0';
                    const replies = tweetEl.querySelector('[data-testid="reply"] span')?.innerText || '0';

                    // Images
                    const images = [];
                    tweetEl.querySelectorAll('[data-testid="tweetPhoto"] img').forEach(img => {
                        images.push(img.src);
                    });

                    // Only include tweets with text from the thread author
                    if (text) {
                        tweets.push({
                            index: index + 1,
                            author: authorName || authorHandle,
                            handle: authorHandle,
                            text: text,
                            time: time,
                            likes: likes,
                            retweets: retweets,
                            replies: replies,
                            images: images
                        });
                    }
                } catch (error) {
                    // Skip problematic tweets
                }
            });

            return tweets;
        });

        console.log(`✅ Extracted ${threadData.length} tweets`);

        await browser.close();
        return threadData;

    } catch (error) {
        if (browser) await browser.close();
        console.error('Error:', error.message);
        return null;
    }
}

function generateArticle(threadData) {
    if (!threadData || threadData.length === 0) {
        return null;
    }

    const firstTweet = threadData[0];
    const tweetDate = firstTweet.time ? new Date(firstTweet.time).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : '';

    let article = `# Thread: ${firstTweet.text.substring(0, 50).replace(/\n/g, ' ')}...\n\n`;
    article += `**Oleh:** @${firstTweet.handle}\n`;
    article += `**Tanggal:** ${tweetDate}\n`;
    article += `**Jumlah Tweet:** ${threadData.length}\n\n`;
    article += `---\n\n`;

    // Thread content
    threadData.forEach((tweet, idx) => {
        article += `## 🧵 Tweet ${idx + 1}/${threadData.length}\n\n`;

        if (tweet.text) {
            article += `${tweet.text}\n\n`;
        }

        if (tweet.images.length > 0) {
            article += `*📎 ${tweet.images.length} gambar terlampir*\n\n`;
        }

        // Engagement data for first tweet
        if (idx === 0) {
            article += `*📊 Engagement: ❤️ ${tweet.likes} | 🔄 ${tweet.retweets} | 💬 ${tweet.replies}*\n\n`;
        }

        article += `---\n\n`;
    });

    // Footer
    article += `\n**Sumber:** [Thread Asli di X/Twitter](${TWEET_URL})\n`;
    article += `\n*Dokumen ini dibuat secara otomatis oleh OpenClaw*`;

    return article;
}

async function main() {
    console.log('=== Twitter Thread to Article Converter ===\n');

    const threadData = await fetchThread();

    if (!threadData || threadData.length === 0) {
        console.log('❌ Gagal mengambil thread');
        process.exit(1);
    }

    console.log(`\n✅ Berhasil mengambil ${threadData.length} tweet\n`);

    const article = generateArticle(threadData);

    if (!article) {
        console.log('❌ Gagal generate artikel');
        process.exit(1);
    }

    // Save to file
    fs.writeFileSync(OUTPUT_FILE, article);

    console.log(`📄 Artikel disimpan: ${OUTPUT_FILE}`);
    console.log(`📊 Ukuran: ${article.length} karakter`);
    console.log(`\n✅ Selesai!`);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
