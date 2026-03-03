const puppeteer = require('puppeteer');

// Helper function for timeout
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 100,
  });

  const page = await browser.newPage();

  // Capture console
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('saved') || text.includes('Failed') || text.includes('Error')) {
      console.log(`📱 Console: ${text}`);
    }
  });

  // Capture network
  page.on('response', async (response) => {
    if (response.url().includes('/api/playlists') && response.request().method() === 'POST') {
      const url = response.url();
      const status = response.status();

      console.log(`\n📥 POST /api/playlists`);
      console.log(`Status: ${status} ${response.statusText()}`);

      try {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          if (status >= 400) {
            console.log(`\n❌ ERROR RESPONSE:`);
            console.log(JSON.stringify(data, null, 2));
          } else {
            console.log(`\n✅ SUCCESS:`);
            console.log(`ID: ${data.data?.id || data.id}`);
            console.log(`Name: ${data.data?.name || data.name}`);
            console.log(`Items count: ${data.data?.items_count || 0}`);
          }
        }
      } catch (e) {
        console.log(`Response: (empty or not JSON)`);
      }
    }
  });

  try {
    console.log('📱 Opening login page...');
    await page.goto('http://192.168.8.117:3000/login', { waitUntil: 'networkidle0', timeout: 30000 });

    // Login
    console.log('🔐 Logging in...');
    await page.waitForSelector('input[type="text"], input[name="username"]', { timeout: 5000 });
    await page.type('input[type="text"], input[name="username"]', 'admin');
    await page.type('input[type="password"], input[name="password"]', 'admin123');

    await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    console.log('✅ Login successful\n');

    // Navigate to Playlists
    console.log('📋 Navigating to Playlists...');
    await page.goto('http://192.168.8.117:3000/dashboard/content', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(3000);

    // Check initial drafts
    console.log('📊 Checking initial drafts...');
    const initialDrafts = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      let count = 0;
      tables.forEach(table => {
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        count += rows.length;
      });
      return count;
    });
    console.log(`Initial drafts count: ${initialDrafts}\n`);

    // Click Create Playlist
    console.log('➕ Clicking Create Playlist...');
    const buttons = await page.$$('button');
    let createBtn = null;
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && (text.includes('Create') || text.includes('New'))) {
        createBtn = btn;
        break;
      }
    }

    if (!createBtn) {
      console.log('❌ Create button not found');
      await browser.close();
      return;
    }

    await createBtn.click();
    await sleep(2000);

    console.log('✅ Playlist creation form opened\n');

    // Check if there are media items to drag
    const mediaCount = await page.evaluate(() => {
      const items = document.querySelectorAll('[data-media-id], .media-item, [class*="media"]');
      return items.length;
    });

    console.log(`Found ${mediaCount} media items`);

    if (mediaCount === 0) {
      console.log('⚠️ No media items found, testing without items...');

      // Try to save draft with empty timeline
      console.log('\n💾 Testing save draft with empty timeline...');
      const saveBtns = await page.$$('button');
      let saveBtn = null;
      for (const btn of saveBtns) {
        const text = await btn.evaluate(el => el.textContent);
        if (text && text.includes('Save Draft')) {
          saveBtn = btn;
          break;
        }
      }

      if (saveBtn) {
        await saveBtn.click();
        await sleep(3000);

        console.log('\n✅ Test complete!');
        console.log('Empty timeline draft should be created\n');
      }
    } else {
      console.log('\n✅ Test complete!');
      console.log('Form is ready for manual testing\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-pydantic-fix.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
