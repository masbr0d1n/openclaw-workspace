const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting login flow test...\n');
  
  let browser;
  try {
    // 1. Open browser
    console.log('1. Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // 2. Clear localStorage and navigate to login
    console.log('2. Navigating to login page and clearing localStorage...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    console.log('   ✅ localStorage cleared');
    
    // 3. Test login flow
    console.log('3. Entering credentials...');
    await page.type('input[type="text"]', 'sysop@test.com');
    console.log('   ✅ Email entered');
    
    await page.type('input[type="password"]', 'password123');
    console.log('   ✅ Password entered');
    
    console.log('4. Clicking login button...');
    await page.click('button[type="submit"]');
    
    // 5. Wait for redirect
    console.log('5. Waiting for navigation...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    
    // 6. Check results
    const url = page.url();
    console.log(`   📍 Redirected to: ${url}`);
    
    const user = await page.evaluate(() => localStorage.getItem('user'));
    console.log(`   💾 User in localStorage: ${user}`);
    
    // 7. Verify
    console.log('\n✅ VERIFICATION RESULTS:');
    console.log('   ' + (url.includes('dashboard') ? '✅' : '❌') + ' Redirected to dashboard');
    console.log('   ' + (user && user !== 'undefined' ? '✅' : '❌') + ' User data in localStorage (not undefined)');
    console.log('   ✅ No infinite loading loop (navigation completed)');
    
    if (url.includes('dashboard') && user && user !== 'undefined') {
      console.log('\n🎉 LOGIN TEST PASSED!');
    } else {
      console.log('\n⚠️ LOGIN TEST FAILED - Check results above');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🔒 Browser closed');
    }
  }
})();
