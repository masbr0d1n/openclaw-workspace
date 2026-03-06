const puppeteer = require('puppeteer');

(async () => {
  console.log('🧪 Starting Login Test - User Undefined Fix Verification\n');
  console.log('=' .repeat(60));
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Enable console logging from browser
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🧪') || text.includes('✅') || text.includes('❌') || 
        text.includes('🚀') || text.includes('📦') || text.includes('👤') ||
        text.includes('🔐') || text.includes('💾') || text.includes('📍')) {
      console.log(`  [Browser] ${text}`);
    }
  });

  try {
    // Step 1: Navigate to login page
    console.log('\n📍 Step 1: Navigate to login page');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle0' });
    console.log('✅ Login page loaded\n');

    // Step 2: Clear localStorage
    console.log('📍 Step 2: Clear localStorage');
    await page.evaluate(() => {
      localStorage.clear();
      console.log('LocalStorage cleared');
    });
    console.log('✅ localStorage cleared\n');

    // Step 3: Login with test credentials
    console.log('📍 Step 3: Login with test credentials');
    console.log('   - Username: sysop@test.com');
    console.log('   - Password: password123');
    
    await page.type('#username', 'sysop@test.com');
    await page.type('#password', 'password123');
    await page.click('button[type="submit"]');
    
    console.log('✅ Credentials entered, form submitted\n');

    // Wait for login to complete (SPA redirect)
    console.log('📍 Step 4: Waiting for login and redirect...');
    await page.waitForFunction(
      () => {
        const url = window.location.href;
        return url.includes('/dashboard') || url.includes('/login');
      },
      { timeout: 15000 }
    );
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}\n`);

    // Step 5: Check redirect
    console.log('📍 Step 5: Verify redirect');
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Redirected to dashboard\n');
    } else {
      console.log('❌ NOT redirected to dashboard (still on login page)\n');
    }

    // Step 6: Check localStorage user data
    console.log('📍 Step 6: Check localStorage user data');
    const userData = await page.evaluate(() => localStorage.getItem('user'));
    console.log(`   Raw user data: ${userData ? userData.substring(0, 200) : 'null'}...`);
    
    if (!userData) {
      console.log('❌ FAIL: User data is empty/null');
    } else if (userData === 'undefined') {
      console.log('❌ FAIL: User data is string "undefined"');
    } else if (userData === 'null') {
      console.log('❌ FAIL: User data is string "null"');
    } else {
      try {
        const parsed = JSON.parse(userData);
        console.log('✅ User data is valid JSON object');
        console.log('   Parsed user:', JSON.stringify(parsed, null, 2).substring(0, 300));
      } catch (e) {
        console.log('⚠️ User data exists but is not valid JSON');
      }
    }

    // Step 7: Check for infinite loop
    console.log('\n📍 Step 7: Check for infinite loop');
    await new Promise(r => setTimeout(r, 3000));
    const stillResponsive = await page.evaluate(() => document.readyState === 'complete');
    if (stillResponsive) {
      console.log('✅ No infinite loop detected - page is responsive\n');
    } else {
      console.log('⚠️ Page may be stuck\n');
    }

    console.log('=' .repeat(60));
    console.log('\n🏁 Test Complete!\n');
    
    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   - Redirect: ${currentUrl.includes('/dashboard') ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   - User Data: ${userData && userData !== 'undefined' && userData !== 'null' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   - No Infinite Loop: ${stillResponsive ? '✅ PASS' : '❌ FAIL'}`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  } finally {
    await browser.close();
  }
})();
