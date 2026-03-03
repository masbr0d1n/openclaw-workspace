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
      console.log(`🌐 [${method}] ${url} - Status: ${status}`);
      
      try {
        const data = await response.json();
        console.log(`📦 Response:`, JSON.stringify(data, null, 2));
        networkLogs.push({ method, url, status, data });
      } catch (e) {
        try {
          const text = await response.text();
          console.log(`📦 Response (text):`, text.substring(0, 500));
          networkLogs.push({ method, url, status, text: text.substring(0, 500) });
        } catch (e2) {
          networkLogs.push({ method, url, status, error: e.message });
        }
      }
    }
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
    console.log('✅ Login successful');
    
    // Navigate to Playlists
    console.log('📋 Navigating to Playlists...');
    await page.goto('http://192.168.8.117:3000/dashboard/content', { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(3000);
    
    // Take screenshot of initial state
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-1-playlists.png', fullPage: true });
    console.log('📸 Screenshot 1: Playlists page');
    
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
    
    console.log(`📊 Found ${draftsCount} draft(s)`);
    
    if (draftsCount > 0) {
      console.log('📝 Testing delete on existing draft...');
      
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
        console.log(`Draft to delete: "${draftInfo.name}" (${draftInfo.items} items)`);
      } else {
        console.log('⚠️ Could not find draft info, trying first row...');
      }
      
      // Find and click Delete button
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
          return true;
        }
        return false;
      });
      
      if (!deleteButtonFound) {
        console.log('❌ Delete button not found');
        await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-2-no-button.png', fullPage: true });
        await browser.close();
        return;
      }
      
      await sleep(1000);
      await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-3-before-delete.png', fullPage: true });
      console.log('📸 Screenshot 3: Before delete');
      
      // Click Delete button
      console.log('🖱️ Clicking Delete button...');
      await page.click('button.puppeteer-target');
      await sleep(1500);
      
      // Check for confirm dialog (browser native)
      console.log('⚠️ Checking for confirm dialog...');
      let dialogHandled = false;
      
      page.on('dialog', async (dialog) => {
        console.log(`🔔 Browser dialog detected: "${dialog.message()}"`);
        console.log('🔔 Dialog type:', dialog.type());
        await sleep(500);
        await dialog.accept();
        console.log('✅ Dialog accepted');
        dialogHandled = true;
      });
      
      // Give time for dialog to appear
      await sleep(2000);
      
      if (!dialogHandled) {
        console.log('ℹ️ No browser dialog, checking for custom modal...');
        
        // Check for custom modal
        const modalExists = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"], .modal, [class*="dialog"], [class*="modal"]');
          return !!modal;
        });
        
        if (modalExists) {
          console.log('✅ Custom modal detected');
          await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-4-modal.png', fullPage: true });
          
          // Try to find confirm button
          const confirmClicked = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const confirmButton = buttons.find(b => 
              b.textContent.includes('OK') || 
              b.textContent.includes('Confirm') || 
              b.textContent.includes('Yes') ||
              b.classList.contains('bg-red-600')
            );
            if (confirmButton) {
              confirmButton.click();
              return true;
            }
            return false;
          });
          
          if (confirmClicked) {
            console.log('✅ Confirm button clicked');
          } else {
            console.log('⚠️ Confirm button not found in modal');
          }
        } else {
          console.log('ℹ️ No dialog/modal detected');
        }
      }
      
      await sleep(2000);
      await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-5-after-delete.png', fullPage: true });
      console.log('📸 Screenshot 5: After delete');
      
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
      
      console.log(`📊 Drafts before: ${draftsCount}, after: ${finalDraftsCount}`);
      
      if (finalDraftsCount < draftsCount) {
        console.log('✅ Delete successful!');
      } else if (finalDraftsCount === draftsCount) {
        console.log('⚠️ Draft count did not change - delete may have failed');
      } else {
        console.log('❌ Draft count increased - something went wrong');
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
    console.log(`DELETE requests: ${deleteRequests.length}`);
    deleteRequests.forEach(log => {
      console.log(`  - ${log.url} → ${log.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
