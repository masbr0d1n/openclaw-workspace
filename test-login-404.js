const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting login test...\n');
  
  const browser = await puppeteer.launch({
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // Capture ALL requests
  const requests = [];
  
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/')) {
      requests.push({
        url: url,
        method: request.method(),
        resourceType: request.resourceType(),
        status: 'pending'
      });
      console.log(`📤 ${request.method()} ${url}`);
    }
  });
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/')) {
      const req = requests.find(r => r.url === url);
      if (req) req.status = response.status();
      console.log(`📥 ${response.status()} ${response.request().method()} ${url}`);
    }
  });
  
  page.on('console', msg => {
    console.log(`[PAGE CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });
  
  // Go to login page
  console.log('\n📍 Navigating to login page...');
  await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait for page to load
  await new Promise(r => setTimeout(r, 2000));
  
  // Check if we're on the right page
  const currentUrl = page.url();
  console.log(`📍 Current URL: ${currentUrl}`);
  
  // Get page title
  const title = await page.title();
  console.log(`📄 Page title: ${title}`);
  
  // Fill form and submit
  console.log('\n✍️  Filling login form...');
  
  // Try to find the input fields
  const emailInput = await page.$('input[type="text"], input[type="email"], input[name="email"], input[name="username"]');
  const passwordInput = await page.$('input[type="password"]');
  const submitButton = await page.$('button[type="submit"], button[class*="submit"], input[type="submit"]');
  
  if (!emailInput) {
    console.log('⚠️  Email input not found, trying generic selectors...');
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} input elements`);
    if (inputs.length >= 2) {
      await page.type('input:nth-of-type(1)', 'sysop@test.com');
      await page.type('input:nth-of-type(2)', 'password123');
    }
  } else {
    await emailInput.type('sysop@test.com');
    console.log('✓ Email entered');
  }
  
  if (!passwordInput) {
    console.log('⚠️  Password input not found');
  } else {
    await passwordInput.type('password123');
    console.log('✓ Password entered');
  }
  
  if (!submitButton) {
    console.log('⚠️  Submit button not found, trying to click by text...');
    // Try clicking any button
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} button elements`);
    if (buttons.length > 0) {
      await buttons[0].click();
    }
  } else {
    await submitButton.click();
    console.log('✓ Submit button clicked');
  }
  
  // Wait for response
  console.log('\n⏳ Waiting for API response...');
  await new Promise(r => setTimeout(r, 5000));
  
  // Report
  console.log('\n=== LOGIN API CALLS ===');
  console.log(JSON.stringify(requests, null, 2));
  
  // Check for 404
  const has404 = requests.some(r => r.status === 404);
  console.log('\nHas 404 errors:', has404);
  
  // Identify which endpoint returned 404
  const failedRequests = requests.filter(r => r.status === 404);
  if (failedRequests.length > 0) {
    console.log('\n❌ Failed endpoints (404):');
    failedRequests.forEach(r => console.log(`  - ${r.method} ${r.url}`));
  }
  
  // Screenshot
  await page.screenshot({path: '/tmp/login-404-test.png', fullPage: true});
  console.log('\n📸 Screenshot saved to /tmp/login-404-test.png');
  
  await browser.close();
  
  console.log('\n✅ Test complete!');
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total API requests: ${requests.length}`);
  console.log(`404 errors: ${failedRequests.length}`);
  if (requests.length > 0) {
    console.log('\nRequest details:');
    requests.forEach(r => {
      const statusIcon = r.status === 404 ? '❌' : (r.status === 200 ? '✅' : '⚠️');
      console.log(`  ${statusIcon} ${r.status} ${r.method} ${r.url}`);
    });
  }
})();
