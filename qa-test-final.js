const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();

  // Capture console logs
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  page.on('pageerror', err => logs.push(err.message));

  console.log('=== QA TEST: Loading Timeout Fix ===\n');
  
  // Go to login page
  console.log('1. Navigating to login page...');
  const response = await page.goto('http://localhost:3002/login', {waitUntil: 'networkidle0', timeout: 30000});
  console.log('   Response status:', response.status());
  
  if (response.status() === 404) {
    console.log('   ❌ FAIL: Login page returned 404');
    await browser.close();
    process.exit(1);
  }
  
  // Clear localStorage
  await page.evaluate(() => localStorage.clear());
  
  // Wait for username input
  console.log('2. Waiting for login form...');
  await page.waitForSelector('#username', {timeout: 10000});
  console.log('   ✓ Login form loaded');
  
  // Type credentials
  console.log('3. Entering credentials...');
  await page.type('#username', 'sysop@test.com');
  await page.type('#password', 'password123');
  
  // Click submit
  console.log('4. Submitting login...');
  await page.click('button[type="submit"]');

  // Wait for navigation
  console.log('5. Waiting for navigation to dashboard...');
  try {
    await page.waitForNavigation({waitUntil: 'networkidle0', timeout: 20000});
    console.log('   ✓ Navigation complete');
  } catch (e) {
    console.log('   ⚠ Navigation timeout:', e.message);
  }
  
  // Wait additional time for dashboard to load
  await new Promise(r => setTimeout(r, 5000));

  // Take screenshot
  await page.screenshot({path: '/home/sysop/.openclaw/workspace/qa-test-result.png', fullPage: true});
  console.log('6. Screenshot saved: qa-test-result.png');

  // Check for timeout error
  const hasTimeout = logs.some(l => l.includes('LOADING TIMEOUT'));
  const hasDashboard = page.url().includes('/dashboard');

  console.log('\n=== TEST RESULTS ===');
  console.log('Final URL:', page.url());
  console.log('On Dashboard:', hasDashboard);
  console.log('Loading Timeout Error:', hasTimeout);
  console.log('Relevant logs:', logs.filter(l => l.includes('loading') || l.includes('auth') || l.includes('dashboard') || l.includes('Loading')));

  const success = !hasTimeout && hasDashboard;
  console.log('\n✅ TEST RESULT:', success ? 'PASS' : 'FAIL');
  
  if (success) {
    console.log('   ✓ No loading timeout detected');
    console.log('   ✓ Successfully navigated to dashboard');
    console.log('   ✓ checkAuth() fix is working correctly');
  } else {
    if (hasTimeout) console.log('   ✗ Loading timeout detected');
    if (!hasDashboard) console.log('   ✗ Did not reach dashboard');
  }

  await browser.close();
  process.exit(success ? 0 : 1);
})();
