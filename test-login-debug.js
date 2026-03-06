const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 Debug: Checking localStorage contents after login...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      const args = msg.args().map(a => a.toString());
      console.log('   [Console]', msg.type(), ...args);
    });
    
    console.log('1. Navigate to login and clear storage...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle0' });
    await page.evaluate(() => localStorage.clear());
    
    console.log('2. Enter credentials and login...');
    await page.type('input[type="text"]', 'sysop@test.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    console.log('3. Wait for navigation...');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    
    console.log('4. Check ALL localStorage items:');
    const allItems = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        items[key] = localStorage.getItem(key);
      }
      return items;
    });
    console.log('   localStorage contents:', JSON.stringify(allItems, null, 2));
    
    console.log('\n5. Check for user-related keys specifically:');
    const user = await page.evaluate(() => localStorage.getItem('user'));
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const auth = await page.evaluate(() => localStorage.getItem('auth'));
    console.log(`   user: ${user}`);
    console.log(`   token: ${token}`);
    console.log(`   auth: ${auth}`);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    if (browser) await browser.close();
  }
})();
