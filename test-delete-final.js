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
    if (response.url().includes('/api/playlists')) {
      const url = response.url();
      const status = response.status();
      const method = response.request().method();
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🌐 [${method}] ${url}`);
      console.log(`   Status: ${status} ${response.statusText()}`);
      
      try {
        const text = await response.text();
        if (text) {
          console.log(`   Body: ${text.substring(0, 200)}`);
        } else {
          console.log(`   Body: (empty - ${status} No Content)`);
        }
        networkLogs.push({ timestamp, method, url, status, body: text.substring(0, 200) });
      } catch (e) {
        networkLogs.push({ timestamp, method, url, status, error: e.message });
      }
    }
  });
  
  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[DELETE]') || text.includes('Error')) {
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
    
    // Check drafts
    console.log('🔍 Checking for drafts...\n');
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
      console.log('📝 Testing delete...\n');
      
      // Find and click Delete button
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
        await browser.close();
        return;
      }
      
      await sleep(1000);
      await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-final-1-before.png', fullPage: true });
      console.log('📸 Screenshot 1: Before delete\n');
      
      // Click Delete button
      console.log('🗑️ Clicking Delete button...\n');
      await page.click('button.puppeteer-target');
      
      // Wait for operation
      await sleep(3000);
      
      await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-final-2-after.png', fullPage: true });
      console.log('📸 Screenshot 2: After delete\n');
      
      // Check for alerts
      const alertText = await page.evaluate(() => {
        const alerts = Array.from(document.querySelectorAll('[role="alert"], [role="status"]'));
        return alerts.map(a => a.textContent).find(t => t && t.includes('Draft')) || null;
      });
      
      if (alertText) {
        console.log(`📢 Alert: "${alertText}"\n`);
      }
      
      // Wait for refresh
      console.log('⏳ Waiting for list refresh...\n');
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
        console.log(`   ✅ DELETE SUCCESSFUL! (${draftsCount - finalDraftsCount} draft deleted)`);
      } else if (finalDraftsCount === draftsCount) {
        console.log(`   ⚠️ Draft count did not change`);
      } else {
        console.log(`   ❌ Unexpected: Draft count increased`);
      }
      
    } else {
      console.log('📝 No drafts found to test');
    }
    
    console.log('\n📊 NETWORK SUMMARY:');
    console.log(`Total requests: ${networkLogs.length}`);
    
    const deleteRequests = networkLogs.filter(log => log.method === 'DELETE');
    console.log(`\nDELETE requests: ${deleteRequests.length}`);
    
    if (deleteRequests.length > 0) {
      deleteRequests.forEach((log, idx) => {
        console.log(`\n[${idx + 1}] DELETE /api/playlists/...`);
        console.log(`    Status: ${log.status}`);
        if (log.status === 204) {
          console.log(`    ✅ SUCCESS - 204 No Content (correct!)`);
        } else if (log.status === 500) {
          console.log(`    ❌ FAILED - 500 Internal Server Error`);
        } else if (log.status === 404) {
          console.log(`    ℹ️ Not Found - already deleted or wrong ID`);
        } else {
          console.log(`    ⚠️ Unexpected status: ${log.status}`);
        }
        if (log.body) {
          console.log(`    Response: ${log.body}`);
        }
      });
    } else {
      console.log('  ❌ No DELETE requests made!');
    }
    
    console.log('\n✅ Test complete!');
    console.log('📁 Screenshots: test-delete-final-*.png\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/test-delete-final-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
