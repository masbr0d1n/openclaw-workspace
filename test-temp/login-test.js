const puppeteer = require('puppeteer');

(async () => {
  console.log('🧪 Starting Login Test...\n');
  
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Step 1 & 2: Navigate to login page first, then clear localStorage
  console.log('Step 1: Navigating to login page...');
  await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle0' });
  console.log('✅ Login page loaded');
  
  console.log('Step 2: Clearing localStorage...');
  await page.evaluate(() => localStorage.clear());
  console.log('✅ localStorage cleared\n');

  // Step 3: Login with test credentials
  console.log('Step 3: Logging in with test credentials...');
  await page.type('#username', 'sysop@test.com');
  await page.type('#password', 'password123');
  await page.click('button[type="submit"]');

  // Wait for navigation/redirect
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {
    console.log('⚠️ No navigation detected (might be SPA redirect)\n');
  });
  console.log('✅ Login submitted\n');

  // Small delay to ensure redirect completes
  await new Promise(r => setTimeout(r, 2000));

  // Step 4: Check if redirected to dashboard
  console.log('Step 4: Checking redirect...');
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);

  if (currentUrl.includes('/dashboard')) {
    console.log('✅ Redirected to dashboard\n');
  } else {
    console.log('❌ NOT redirected to dashboard\n');
  }

  // Step 5: Check localStorage user data
  console.log('Step 5: Checking localStorage user data...');
  const userData = await page.evaluate(() => localStorage.getItem('user'));
  console.log('User data from localStorage:', userData);

  if (userData && userData !== 'undefined' && userData !== 'null') {
    try {
      const parsed = JSON.parse(userData);
      console.log('✅ User data is valid JSON object');
      console.log('Parsed user:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('⚠️ User data exists but is not valid JSON:', userData);
    }
  } else if (userData === 'undefined') {
    console.log('❌ FAIL: User data is string "undefined"');
  } else if (!userData) {
    console.log('❌ FAIL: User data is empty/null');
  }

  // Step 6: Check for infinite loop
  console.log('\nStep 6: Checking for infinite loop...');
  await new Promise(r => setTimeout(r, 2000));
  const stillResponsive = await page.evaluate(() => document.readyState === 'complete');
  if (stillResponsive) {
    console.log('✅ No infinite loop detected - page is responsive\n');
  } else {
    console.log('⚠️ Page may be stuck\n');
  }

  await browser.close();
  console.log('\n🏁 Test Complete!');
})();
