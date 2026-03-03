const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
  });

  const page = await browser.newPage();
  
  try {
    console.log('📱 Opening login page...');
    await page.goto('http://192.168.8.117:3000/login');
    
    // Login
    console.log('🔐 Logging in...');
    await page.type('input[type="text"], input[name="username"]', 'admin');
    await page.type('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Login successful');
    
    // Navigate to Playlists
    console.log('📋 Navigating to Playlists...');
    await page.goto('http://192.168.8.117:3000/dashboard/content');
    await page.waitForSelector('button, a', { timeout: 5000 });
    
    // Take screenshot
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-playlists-edit-1-login.png', fullPage: true });
    console.log('📸 Screenshot 1: After login');
    
    // Check if we're on the playlists page
    const url = page.url();
    console.log('🌐 Current URL:', url);
    
    // Wait a bit for content to load
    await page.waitForTimeout(2000);
    
    // Take screenshot of playlists page
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-playlists-edit-2-playlists.png', fullPage: true });
    console.log('📸 Screenshot 2: Playlists page');
    
    // Check for Published Playlists table
    const publishedExists = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('h3, h4, .text-lg'));
      return headers.some(h => h.textContent.includes('Published Playlists'));
    });
    console.log('📊 Published Playlists table exists:', publishedExists);
    
    // Check for Saved Drafts table
    const draftsExists = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('h3, h4, .text-lg'));
      return headers.some(h => h.textContent.includes('Saved Drafts'));
    });
    console.log('📊 Saved Drafts table exists:', draftsExists);
    
    // Try to create a draft if none exist
    const hasDrafts = await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody tr');
      return rows.length > 0;
    });
    
    if (!hasDrafts) {
      console.log('📝 No drafts found, creating test draft...');
      
      // Click Create Playlist button
      const createButton = await page.$('button');
      if (createButton) {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        // Fill in name
        await page.type('input[placeholder*="name"], input[type="text"].w-full', 'Test Draft Playlist');
        
        // Check for media items
        await page.waitForTimeout(2000);
        const mediaItems = await page.evaluate(() => {
          const items = document.querySelectorAll('[class*="cursor-move"], [draggable="true"]');
          return items.length;
        });
        console.log('📦 Media items found:', mediaItems);
        
        await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-playlists-edit-3-create.png', fullPage: true });
      }
    } else {
      console.log('📝 Drafts exist, checking edit functionality...');
      
      // Find and click Edit button on first draft
      const editClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const editButton = buttons.find(b => b.textContent.includes('Edit'));
        if (editButton) {
          editButton.click();
          return true;
        }
        return false;
      });
      
      if (editClicked) {
        console.log('✏️ Edit button clicked');
        await page.waitForTimeout(2000);
        
        // Take screenshot after clicking edit
        await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-playlists-edit-4-edit-view.png', fullPage: true });
        console.log('📸 Screenshot 4: After clicking Edit');
        
        // Check if timeline has items
        const timelineItems = await page.evaluate(() => {
          const timeline = document.querySelector('[class*="border-dashed"], .min-h-\\[400px\\]');
          if (!timeline) return 0;
          const items = timeline.querySelectorAll('[class*="order"]');
          return items.length;
        });
        console.log('🎬 Timeline items after edit:', timelineItems);
        
        // Check properties panel
        const properties = await page.evaluate(() => {
          const nameInput = document.querySelector('input[placeholder*="name"], input[type="text"].w-full');
          return {
            name: nameInput ? nameInput.value : 'NOT_FOUND',
            loopChecked: document.querySelector('[class*="bg-blue-600"]') !== null
          };
        });
        console.log('⚙️ Properties loaded:', JSON.stringify(properties, null, 2));
        
        // Check API calls
        page.on('response', async (response) => {
          if (response.url().includes('/api/playlists')) {
            console.log('🌐 API Call:', response.url(), response.status());
            try {
              const data = await response.json();
              console.log('📦 API Response:', JSON.stringify(data, null, 2));
            } catch (e) {
              console.log('📦 API Response: (non-json)');
            }
          }
        });
      }
    }
    
    // Final screenshot
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-playlists-edit-5-final.png', fullPage: true });
    console.log('📸 Screenshot 5: Final state');
    
    console.log('✅ Test complete! Check screenshots.');
    console.log('📁 Screenshots saved in /home/sysop/.openclaw/workspace/');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-playlists-edit-error.png' });
  } finally {
    await browser.close();
  }
})();
