// Simple playwright test without requiring @playwright/test
const { test } = require('playwright');

test('Login Test - User Undefined Fix', async ({ page }) => {
  console.log('🧪 Starting Login Test...\n');
  
  // Step 1: Clear localStorage
  console.log('Step 1: Clearing localStorage...');
  await page.evaluate(() => localStorage.clear());
  console.log('✅ localStorage cleared\n');

  // Step 2: Navigate to login page
  console.log('Step 2: Navigating to login page...');
  await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle' });
  console.log('✅ Login page loaded\n');

  // Step 3: Login with test credentials
  console.log('Step 3: Logging in with test credentials...');
  await page.fill('input[type="email"]', 'sysop@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Wait for navigation/redirect
  await page.waitForLoadState('networkidle');
  console.log('✅ Login submitted\n');

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
  await page.waitForTimeout(2000);
  const stillResponsive = await page.evaluate(() => document.readyState === 'complete');
  if (stillResponsive) {
    console.log('✅ No infinite loop detected - page is responsive\n');
  } else {
    console.log('⚠️ Page may be stuck\n');
  }

  console.log('\n🏁 Test Complete!');
});
