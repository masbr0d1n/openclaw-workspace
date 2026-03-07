const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();

  // Capture console logs
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  page.on('pageerror', err => logs.push(err.message));

  // Go to login page
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3002/login', {waitUntil: 'networkidle0', timeout: 30000});
  console.log('Page loaded, URL:', page.url());
  
  // Take screenshot
  await page.screenshot({path: '/home/sysop/.openclaw/workspace/qa-screenshot-login.png', fullPage: true});
  console.log('Screenshot saved');

  // Clear localStorage
  await page.evaluate(() => localStorage.clear());
  
  // Wait for username input to appear
  console.log('Waiting for username input...');
  await page.waitForSelector('#username', {timeout: 10000});
  console.log('Username input found');
  
  // Type credentials
  await page.type('#username', 'sysop@test.com');
  await page.type('#password', 'password123');
  console.log('Credentials entered');
  
  // Click submit
  await page.click('button[type="submit"]');
  console.log('Submit clicked');

  // Wait for navigation
  try {
    console.log('Waiting for navigation...');
    await page.waitForNavigation({waitUntil: 'networkidle0', timeout: 20000});
    console.log('Navigation complete');
  } catch (e) {
    console.log('Navigation timeout or error:', e.message);
  }
  
  // Wait additional time
  await new Promise(r => setTimeout(r, 5000));

  // Take final screenshot
  await page.screenshot({path: '/home/sysop/.openclaw/workspace/qa-screenshot-final.png', fullPage: true});
  console.log('Final screenshot saved');

  // Check for timeout error
  const hasTimeout = logs.some(l => l.includes('LOADING TIMEOUT'));
  const hasDashboard = page.url().includes('/dashboard');

  console.log('=== TEST RESULTS ===');
  console.log('Timeout Error:', hasTimeout);
  console.log('On Dashboard:', hasDashboard);
  console.log('Final URL:', page.url());
  console.log('Console Logs (relevant):', logs.filter(l => l.includes('loading') || l.includes('auth') || l.includes('Login') || l.includes('dashboard')));

  const success = !hasTimeout && hasDashboard;
  console.log('✅ SUCCESS:', success);

  await browser.close();
  process.exit(success ? 0 : 1);
})();
