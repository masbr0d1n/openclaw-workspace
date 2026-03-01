#!/usr/bin/env node
/**
 * Fetch complete Twitter thread using Nitter (no login required)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

const NITTER_INSTANCE = 'https://nitter.net';
const TWEET_ID = '1888407459045445794';
const AUTHOR = 'bardanslm';
const OUTPUT_FILE = '/home/sysop/.openclaw/workspace/thread-article.md';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchThreadFromNitter() {
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

        const url = `${NITTER_INSTANCE}/${AUTHOR}/status/${TWEET_ID}`;
        console.log(`📄 Loading: ${url}`);
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await delay(3000);

        // Scroll to load thread
        console.log('⬇️  Scrolling to load thread...');
        for (let i = 0; i < 10; i++) {
            await page.evaluate(() => {
                window.scrollBy(0, 500);
            });
            await delay(500);
        }

        await delay(2000);

        console.log('📝 Extracting thread content...');

        const threadData = await page.evaluate(() => {
            const tweets = [];

            // Find all timeline items (tweets)
            const tweetElements = document.querySelectorAll('.timeline-item');

            tweetElements.forEach((tweetEl, index) => {
                try {
                    // Tweet text
                    const textEl = tweetEl.querySelector('.tweet-content');
                    const text = textEl ? textEl.innerText.trim() : '';

                    // Author
                    const authorEl = tweetEl.querySelector('.fullname');
                    const author = authorEl ? authorEl.innerText.trim() : '';

                    const handleEl = tweetEl.querySelector('.username');
                    const handle = handleEl ? handleEl.innerText.trim().replace('@', '') : '';

                    // Time
                    const timeEl = tweetEl.querySelector('span.tweet-date');
                    const time = timeEl ? timeEl.getAttribute('title') : '';

                    // Stats
                    const likes = tweetEl.querySelector('.icon-heart+ span')?.innerText || '0';
                    const retweets = tweetEl.querySelector('.icon-retweet+ span')?.innerText || '0';
                    const replies = tweetEl.querySelector('.icon-comment+ span')?.innerText || '0';

                    // Images
                    const images = [];
                    tweetEl.querySelectorAll('.still-image').forEach(img => {
                        images.push(img.src);
                    });

                    // Only include tweets from thread author
                    if (text && handle.toLowerCase() === 'bardanslm') {
                        tweets.push({
                            index: index + 1,
                            author: author,
                            handle: handle,
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

    let article = `# ${firstTweet.text.substring(0, 60).replace(/\n/g, ' ').trim()}...\n\n`;
    article += `**Oleh:** @${firstTweet.handle}\n`;
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

        article += `---\n\n`;
    });

    // Footer
    article += `\n**Sumber:** [Nitter](${NITTER_INSTANCE}/${AUTHOR}/status/${TWEET_ID})\n`;
    article += `\n*Dokumen ini dibuat secara otomatis oleh OpenClaw*`;

    return article;
}

async function main() {
    console.log('=== Twitter Thread to Article (Nitter) ===\n');

    const threadData = await fetchThreadFromNitter();

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
