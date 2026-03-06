const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();

  // Capture console logs
  const logs = [];
  page.on('console', msg => {
    logs.push(msg.text());
    console.log('PAGE LOG:', msg.text());
  });

  try {
    // Clear localStorage
    await page.goto('http://localhost:3002/login');
    await page.evaluate(() => localStorage.clear());

    // Login
    await page.type('input[type="text"]', 'sysop@test.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation (might take longer due to /me call)
    await page.waitForNavigation({waitUntil: 'networkidle0', timeout: 15000});

    // Check results
    const url = page.url();
    const user = await page.evaluate(() => localStorage.getItem('user'));
    const token = await page.evaluate(() => localStorage.getItem('access_token'));

    console.log('URL:', url);
    console.log('User:', user);
    console.log('Token:', !!token);

    // Verify
    const success = url.includes('/dashboard') && user && user !== 'undefined' && user.includes('email') && token;
    console.log('✅ SUCCESS:', success);

    // Screenshot
    await page.screenshot({path: '/tmp/qa-login-me-fix.png', fullPage: true});
    await browser.close();

    // Output summary
    console.log('\n=== QA TEST SUMMARY ===');
    console.log('Screenshot: /tmp/qa-login-me-fix.png');
    console.log('Success:', success ? 'YES' : 'NO');
    console.log('URL:', url);
    console.log('User data:', user);
    console.log('Token present:', !!token);
    console.log('Console logs:', logs);

    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('TEST ERROR:', error.message);
    await browser.close();
    process.exit(1);
  }
})();
