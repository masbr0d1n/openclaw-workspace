const puppeteer = require('puppeteer');

// Helper function for timeout
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 50,
  });

  const page = await browser.newPage();
  
  // Capture request payloads
  const requestLogs = [];
  page.on('request', async (request) => {
    if (request.url().includes('/api/playlists') && request.method() === 'POST') {
      const url = request.url();
      const method = request.method();
      const postData = request.postData();
      
      try {
        const data = postData ? JSON.parse(postData) : null;
        console.log(`\n📤 [${method}] ${url}`);
        console.log(`Content-Type: ${request.headers()['content-type']}`);
        
        if (data) {
          console.log(`\n📋 Request Body:`);
          console.log(JSON.stringify(data, null, 2));
          
          // Focus on items structure
          if (data.items && data.items.length > 0) {
            console.log(`\n🎬 Items (${data.items.length}):`);
            data.items.forEach((item, idx) => {
              console.log(`  [${idx}] media_id: ${item.media_id} (type: ${typeof item.media_id})`);
              console.log(`      name: "${item.name}"`);
              console.log(`      duration: ${item.duration}`);
              console.log(`      order: ${item.order}`);
              console.log(`      media_type: ${item.media_type}`);
            });
          }
          
          requestLogs.push({ method, url, data });
        }
      } catch (e) {
        console.log(`Failed to parse request data: ${e.message}`);
      }
    }
  });
  
  // Capture response
  page.on('response', async (response) => {
    if (response.url().includes('/api/playlists') && response.request().method() === 'POST') {
      const url = response.url();
      const status = response.status();
      const method = response.request().method();
      
      console.log(`\n📥 [${method}] ${url}`);
      console.log(`Status: ${status} ${response.statusText()}`);
      
      try {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          console.log(`\nResponse Body:`);
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (e) {
        console.log(`Response: (empty or not JSON)`);
      }
    }
  });
  
  // Capture console
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Draft saved') || text.includes('Failed') || text.includes('Error')) {
      console.log(`📱 Console: ${text}`);
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
    
    // Click Create Playlist
    console.log('➕ Clicking Create Playlist button...');
    const createBtn = await page.$('button:has-text("Create Playlist"), button:has-text("New Playlist")');
    if (!createBtn) {
      console.log('❌ Create Playlist button not found');
      await browser.close();
      return;
    }
    
    await createBtn.click();
    await sleep(2000);
    
    // Add items to timeline (drag & drop)
    console.log('🎬 Dragging items to timeline...');
    
    // Find media items
    const mediaItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-media-id], .media-item'));
      return items.slice(0, 2).map(item => ({
        id: item.getAttribute('data-media-id') || item.querySelector('[data-id]')?.getAttribute('data-id'),
        title: item.textContent?.split('\n')[0]?.trim()
      }));
    });
    
    console.log(`Found ${mediaItems.length} media items`);
    
    if (mediaItems.length < 2) {
      console.log('❌ Not enough media items to test');
      await browser.close();
      return;
    }
    
    // Try to drag items (simplified - might need specific selectors)
    for (let i = 0; i < Math.min(2, mediaItems.length); i++) {
      const item = mediaItems[i];
      console.log(`Item ${i}: id=${item.id}, title="${item.title}"`);
    }
    
    await sleep(2000);
    
    // Click Save Draft
    console.log('\n💾 Clicking Save Draft...');
    const saveBtn = await page.$('button:has-text("Save Draft"), button:has-text("Save as Draft")');
    if (!saveBtn) {
      console.log('❌ Save Draft button not found');
      await browser.close();
      return;
    }
    
    await saveBtn.click();
    await sleep(3000);
    
    console.log('\n✅ Test complete!');
    console.log(`📊 Total POST requests captured: ${requestLogs.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-draft-items-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
