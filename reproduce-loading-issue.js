const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting reproduction script...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  
  const page = await browser.newPage();
  
  // Set up console log capture
  const logs = [];
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    logs.push(logEntry);
    console.log(`[PAGE CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    logs.push({
      type: 'error',
      text: err.message,
      timestamp: new Date().toISOString()
    });
    console.log(`[PAGE ERROR] ${err.message}`);
  });
  
  page.on('requestfailed', request => {
    logs.push({
      type: 'requestfailed',
      text: `${request.url()} - ${request.failure().errorText}`,
      timestamp: new Date().toISOString()
    });
    console.log(`[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`);
  });
  
  try {
    // Navigate to login page
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:3002/login', { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Clear localStorage
    console.log('🧹 Clearing localStorage...');
    await page.evaluate(() => localStorage.clear());
    
    // Take screenshot before login
    await page.screenshot({ 
      path: '/home/sysop/.openclaw/workspace/screenshots/before-login.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: before-login.png');
    
    // Login
    console.log('🔐 Entering credentials...');
    await page.type('input[type="text"]', 'sysop@test.com');
    await page.type('input[type="password"]', 'password123');
    
    console.log('🖱️ Clicking submit button...');
    await page.click('button[type="submit"]');
    
    // Wait for potential loading timeout
    console.log('⏳ Waiting 15 seconds to capture loading state...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Capture localStorage state
    console.log('💾 Capturing localStorage state...');
    const localStorageState = await page.evaluate(() => {
      return {
        user: localStorage.getItem('user'),
        token: localStorage.getItem('access_token'),
        'auth-storage': localStorage.getItem('auth-storage'),
        allKeys: Object.keys(localStorage)
      };
    });
    
    // Take screenshot after wait
    await page.screenshot({ 
      path: '/home/sysop/.openclaw/workspace/screenshots/after-wait.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: after-wait.png');
    
    // Check if we're still on loading page
    const currentUrl = page.url();
    console.log(`🌐 Current URL: ${currentUrl}`);
    
    // Check for loading indicators
    const loadingState = await page.evaluate(() => {
      const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="loader"]');
      return {
        loadingElementsCount: loadingElements.length,
        url: window.location.href,
        title: document.title,
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    
    // Compile results
    const results = {
      timestamp: new Date().toISOString(),
      consoleLogs: logs,
      localStorage: localStorageState,
      loadingState: loadingState,
      currentUrl: currentUrl,
      screenshots: [
        '/home/sysop/.openclaw/workspace/screenshots/before-login.png',
        '/home/sysop/.openclaw/workspace/screenshots/after-wait.png'
      ]
    };
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync(
      '/home/sysop/.openclaw/workspace/loading-issue-results.json',
      JSON.stringify(results, null, 2)
    );
    console.log('💾 Results saved to: loading-issue-results.json');
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total console logs: ${logs.length}`);
    console.log(`LocalStorage keys: ${localStorageState.allKeys.join(', ')}`);
    console.log(`Current URL: ${currentUrl}`);
    console.log(`Loading elements found: ${loadingState.loadingElementsCount}`);
    
    // Check for timeout error
    const timeoutErrors = logs.filter(log => 
      log.text.toLowerCase().includes('timeout') || 
      log.text.toLowerCase().includes('isLoading')
    );
    if (timeoutErrors.length > 0) {
      console.log('\n⚠️ TIMEOUT ERRORS FOUND:');
      timeoutErrors.forEach(err => console.log(`  - ${err.text}`));
    }
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
    logs.push({
      type: 'script-error',
      text: error.message,
      timestamp: new Date().toISOString()
    });
    
    // Screenshot on error
    await page.screenshot({ 
      path: '/home/sysop/.openclaw/workspace/screenshots/error-state.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('🏁 Browser closed');
  }
})();
