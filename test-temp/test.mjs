import { test } from 'playwright/test';

test('login test', async ({ page }) => {
  console.log('🧪 Starting Login Test...\n');
  
  await page.evaluate(() => localStorage.clear());
  console.log('✅ Step 1: localStorage cleared\n');

  await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle' });
  console.log('✅ Step 2: Login page loaded\n');

  await page.fill('input[type="email"]', 'sysop@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  console.log('✅ Step 3: Login submitted\n');

  const currentUrl = page.url();
  console.log(`Step 4: Current URL: ${currentUrl}`);
  console.log(currentUrl.includes('/dashboard') ? '✅ Redirected to dashboard\n' : '❌ NOT redirected to dashboard\n');

  const userData = await page.evaluate(() => localStorage.getItem('user'));
  console.log('Step 5: User data from localStorage:', userData);

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

  await page.waitForTimeout(2000);
  const stillResponsive = await page.evaluate(() => document.readyState === 'complete');
  console.log(stillResponsive ? '✅ Step 6: No infinite loop detected\n' : '⚠️ Page may be stuck\n');

  console.log('\n🏁 Test Complete!');
});
