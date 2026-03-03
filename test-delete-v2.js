const puppeteer = require('puppeteer');

// Helper function for timeout
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 50,
  });

  const page = await browser.newPage();
  
  // Capture network requests
  const networkLogs = [];
  page.on('response', async (response) => {
    if (response.url().includes('/api/playlists') || response.url().includes('/api/videos')) {
      const url = response.url();
      const status = response.status();
      const method = response.request().method();
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🌐 [${method}] ${url} - Status: ${status}`);
      
      try {
        const data = await response.json();
        console.log(`📦 Response:`, JSON.stringify(data, null, 2));
        networkLogs.push({ timestamp, method, url, status, data });
      } catch (e) {
        try {
          const text = await response.text();
          console.log(`📦 Response (text):`, text.substring(0, 500));
          networkLogs.push({ timestamp, method, url, status, text: text.substring(0, 500) });
        } catch (e2) {
          networkLogs.push({ timestamp, method, url, status, error: e.message });
        }
      }
    }
  });
  
  // IMPORTANT: Setup dialog handler BEFORE any interactions
  page.on('dialog', async (dialog) => {
    console.log(`\n🔔 DIALOG DETECTED!`);
    console.log(`   Type: ${dialog.type()}`);
    console.log(`   Message: ${dialog.message()}`);
    
    await sleep(500); // Small delay to see what's happening
    
    // Accept the dialog
    console.log(`   ✅ Accepting dialog...`);
    await dialog.accept();
    console.log(`   ✅ Dialog accepted\n`);
  });
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Browser Console Error:', msg.text());
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
    
    // Wait for login button and click
    await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    console.log('✅ Login successful\n');
    
    // Navigate to Playlists
    console.log('📋 Navigating to Playlists...');
    await page.goto('http://192.168.8.117:3000/dashboard/content', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(3000);
    
    // Take screenshot of initial state
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-v2-1-playlists.png', fullPage: true });
    console.log('📸 Screenshot 1: Playlists page\n');
    
    // Check for drafts
    console.log('🔍 Checking for drafts...');
    const draftsCount = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      let count = 0;
      tables.forEach(table => {
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        count += rows.length;
      });
      return count;
    });
    
    console.log(`📊 Found ${draftsCount} draft(s)\n`);
    
    if (draftsCount > 0) {
      console.log('📝 Testing delete on existing draft...\n');
      
      // Get first draft details
      const draftInfo = await page.evaluate(() => {
        const tables = document.querySelectorAll('table');
        for (const table of tables) {
          const header = table.querySelector('th, h3, .text-lg');
          if (header && header.textContent.includes('Saved Drafts')) {
            const firstRow = table.querySelector('tbody tr');
            if (firstRow) {
              const cells = firstRow.querySelectorAll('td');
              return {
                name: cells[0]?.textContent?.trim(),
                items: cells[1]?.textContent?.trim(),
              };
            }
          }
        }
        return null;
      });
      
      if (draftInfo) {
        console.log(`📄 Draft to delete: "${draftInfo.name}" (${draftInfo.items} items)\n`);
      }
      
      // Find and highlight Delete button
      console.log('🗑️ Looking for Delete button...');
      await sleep(1000);
      
      const deleteButtonFound = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const deleteButtons = buttons.filter(b => {
          const text = b.textContent || '';
          const title = b.getAttribute('title') || '';
          return text.includes('Delete') || title.includes('Delete');
        });
        
        if (deleteButtons.length > 0) {
          deleteButtons[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
          deleteButtons[0].classList.add('puppeteer-target');
          deleteButtons[0].style.border = '3px solid red';
          deleteButtons[0].style.boxShadow = '0 0 10px red';
          return true;
        }
        return false;
      });
      
      if (!deleteButtonFound) {
        console.log('❌ Delete button not found');
        await browser.close();
        return;
      }
      
      await sleep(1000);
      await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-v2-2-before-click.png', fullPage: true });
      console.log('📸 Screenshot 2: Before delete (with highlighted button)\n');
      
      // Click Delete button
      console.log('🖱️ Clicking Delete button...');
      console.log('⏳ Waiting for dialog (max 5 seconds)...\n');
      
      await page.click('button.puppeteer-target');
      
      // Wait for dialog and processing
      await sleep(5000);
      
      await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-v2-3-after-click.png', fullPage: true });
      console.log('📸 Screenshot 3: After click (dialog should be handled)\n');
      
      // Check for alerts
      const alertInfo = await page.evaluate(() => {
        // Check for toast notifications
        const toasts = Array.from(document.querySelectorAll('[role="alert"], [role="status"], [class*="toast"], [class*="notification"]'));
        const alerts = toasts.map(t => t.textContent).filter(t => t && t.trim());
        
        // Check for error messages
        const errors = Array.from(document.querySelectorAll('[class*="error"], [class*="alert"]'));
        const errorTexts = errors.map(e => e.textContent).filter(t => t && t.trim());
        
        return {
          toasts: alerts,
          errors: errorTexts
        };
      });
      
      if (alertInfo.toasts.length > 0) {
        console.log('📢 Toast/Alert messages:', alertInfo.toasts);
      }
      
      if (alertInfo.errors.length > 0) {
        console.log('⚠️ Error messages:', alertInfo.errors);
      }
      
      // Wait a bit more for any async operations
      console.log('⏳ Waiting for delete operation to complete...\n');
      await sleep(3000);
      
      // Check final state
      const finalDraftsCount = await page.evaluate(() => {
        const tables = document.querySelectorAll('table');
        let count = 0;
        tables.forEach(table => {
          const rows = Array.from(table.querySelectorAll('tbody tr'));
          count += rows.length;
        });
        return count;
      });
      
      console.log(`📊 FINAL RESULTS:`);
      console.log(`   Drafts before: ${draftsCount}`);
      console.log(`   Drafts after: ${finalDraftsCount}`);
      
      if (finalDraftsCount < draftsCount) {
        console.log(`   ✅ DELETE SUCCESSFUL! (${draftsCount - finalDraftsCount} draft(s) deleted)`);
      } else if (finalDraftsCount === draftsCount) {
        console.log(`   ⚠️ Draft count did not change`);
      } else {
        console.log(`   ❌ Draft count increased (unexpected)`);
      }
      
    } else {
      console.log('📝 No drafts found');
      console.log('ℹ️ Please create a draft first, then run this script again');
    }
    
    console.log('\n✅ Test complete!');
    console.log('📁 Screenshots saved in /home/sysop/.openclaw/workspace/');
    console.log('\n📊 Network Summary:');
    console.log(`Total requests captured: ${networkLogs.length}`);
    
    const deleteRequests = networkLogs.filter(log => log.method === 'DELETE');
    console.log(`\nDELETE requests: ${deleteRequests.length}`);
    if (deleteRequests.length > 0) {
      deleteRequests.forEach(log => {
        console.log(`  [${log.timestamp}] ${log.url} → ${log.status}`);
        if (log.data) {
          console.log(`    Response:`, JSON.stringify(log.data, null, 2));
        }
      });
    } else {
      console.log('  ❌ No DELETE requests were made!');
      console.log('  ℹ️ This means the delete operation was blocked before reaching the API');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-v2-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
