const puppeteer = require('puppeteer');
const fs = require('fs');

const TEST_CONFIG = {
  tvHub: {
    url: 'http://localhost:3001/login',
    name: 'TV Hub',
    color: 'blue',
    expectedTitle: 'Login - TV Hub',
    dashboardRedirect: '/dashboard/channels'
  },
  videotron: {
    url: 'http://localhost:3002/login',
    name: 'Videotron',
    color: 'purple',
    expectedTitle: 'Login - Videotron',
    dashboardRedirect: '/dashboard/screens'
  },
  credentials: {
    email: 'sysop@test.com',
    password: 'password123'
  }
};

async function testLogin(page, config, credentials) {
  const results = {
    ui: {},
    functionality: {},
    issues: []
  };

  try {
    // Test 1: Page Load
    console.log(`\n📋 Testing ${config.name} Login Page...`);
    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 10000 });
    
    const title = await page.title();
    results.ui.pageLoad = title === config.expectedTitle;
    console.log(`  ✅ Page loaded: ${title}`);

    // Test 2: UI Elements - Gradient Background
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        background: computed.background,
        backgroundColor: computed.backgroundColor
      };
    });
    
    // Check if gradient exists (should have gradient or at least a background color)
    results.ui.hasBackground = bodyStyles.background !== 'none' || bodyStyles.backgroundColor !== 'rgba(0, 0, 0, 0)';
    console.log(`  ${results.ui.hasBackground ? '✅' : '❌'} Background: ${bodyStyles.background.substring(0, 50)}...`);

    // Test 3: shadcn/ui Card Component
    const cardElement = await page.$('[class*="card"], [class*="Card"], .card, [data-testid="login-card"]');
    results.ui.hasCard = cardElement !== null;
    console.log(`  ${results.ui.hasCard ? '✅' : '❌'} Card component found`);

    // Test 4: Form Elements
    const emailInput = await page.$('input[type="email"], input[name="email"], input[name="username"], input[placeholder*="email" i]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    results.ui.hasEmailInput = emailInput !== null;
    results.ui.hasPasswordInput = passwordInput !== null;
    results.ui.hasSubmitButton = submitButton !== null;
    
    console.log(`  ${results.ui.hasEmailInput ? '✅' : '❌'} Email input found`);
    console.log(`  ${results.ui.hasPasswordInput ? '✅' : '❌'} Password input found`);
    console.log(`  ${results.ui.hasSubmitButton ? '✅' : '❌'} Submit button found`);

    // Test 5: Icons/Branding
    const icons = await page.$$eval('svg, img, [class*="icon"]', els => els.length);
    results.ui.hasIcons = icons > 0;
    console.log(`  ${results.ui.hasIcons ? '✅' : '❌'} Icons found: ${icons}`);

    // Test 6: Form Validation (Empty Submit)
    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Check for validation messages
      const validationMessages = await page.$$eval('[class*="error"], [class*="invalid"], [role="alert"]', els => els.length);
      results.functionality.hasValidation = validationMessages > 0;
      console.log(`  ${results.functionality.hasValidation ? '✅' : '⚠️ '} Form validation: ${validationMessages} messages`);
    }

    // Test 7: Login Flow
    if (emailInput && passwordInput && submitButton) {
      await page.goto(config.url, { waitUntil: 'networkidle2' });
      
      await emailInput.type(credentials.email);
      console.log(`  ✅ Email entered: ${credentials.email}`);
      
      await passwordInput.type(credentials.password);
      console.log(`  ✅ Password entered: ******`);
      
      await submitButton.click();
      console.log(`  ✅ Submit button clicked`);
      
      // Wait for redirect or error
      try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
        const finalUrl = page.url();
        
        results.functionality.loginSuccess = finalUrl.includes('/dashboard');
        console.log(`  ${results.functionality.loginSuccess ? '✅' : '❌'} Login successful! Redirected to: ${finalUrl}`);
        
        if (!results.functionality.loginSuccess) {
          results.issues.push(`Unexpected redirect: ${finalUrl}`);
        }
      } catch (navError) {
        // Check if there's an error message
        const errorElement = await page.$('[class*="error"], [role="alert"], .text-red-500, .text-destructive');
        if (errorElement) {
          const errorText = await errorElement.evaluate(el => el.textContent);
          results.functionality.loginError = errorText;
          results.issues.push(`Login error: ${errorText}`);
          console.log(`  ❌ Login error: ${errorText}`);
        } else {
          results.issues.push(`Navigation timeout - login might have failed`);
          console.log(`  ⚠️  Navigation timeout`);
        }
      }
    } else {
      results.functionality.loginSuccess = false;
      results.issues.push('Missing form elements for login test');
    }

    // Test 8: Mobile Responsive (Resize to mobile)
    await page.setViewport({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileCard = await page.$('[class*="card"], [class*="Card"], .card');
    const cardBounds = mobileCard ? await mobileCard.boundingBox() : null;
    
    results.ui.mobileResponsive = cardBounds && cardBounds.width <= 375;
    console.log(`  ${results.ui.mobileResponsive ? '✅' : '❌'} Mobile responsive test`);

  } catch (error) {
    results.issues.push(`Test error: ${error.message}`);
    console.log(`  ❌ Error: ${error.message}`);
  }

  return results;
}

async function takeScreenshot(page, filename) {
  try {
    await page.screenshot({ path: filename, fullPage: true });
    console.log(`  📸 Screenshot saved: ${filename}`);
    return true;
  } catch (error) {
    console.log(`  ❌ Screenshot failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 QA Testing: Login Pages with shadcn/ui\n');
  console.log('=' .repeat(60));
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    tvHub: null,
    videotron: null,
    timestamp: new Date().toISOString(),
    overall: 'PASS'
  };

  try {
    // Test TV Hub
    const page1 = await browser.newPage();
    await page1.setViewport({ width: 1920, height: 1080 });
    
    results.tvHub = await testLogin(page1, TEST_CONFIG.tvHub, TEST_CONFIG.credentials);
    await takeScreenshot(page1, '/home/sysop/.openclaw/workspace/test-tvhub-login-new.png');
    
    await page1.close();

    // Test Videotron
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 1920, height: 1080 });
    
    results.videotron = await testLogin(page2, TEST_CONFIG.videotron, TEST_CONFIG.credentials);
    await takeScreenshot(page2, '/home/sysop/.openclaw/workspace/test-videotron-login-new.png');
    
    await page2.close();

    // Determine overall result
    const allTests = [
      ...Object.values(results.tvHub.ui),
      ...Object.values(results.tvHub.functionality),
      ...Object.values(results.videotron.ui),
      ...Object.values(results.videotron.functionality)
    ];
    
    const failedTests = allTests.filter(t => t === false).length;
    const totalIssues = results.tvHub.issues.length + results.videotron.issues.length;
    
    if (failedTests > 0 || totalIssues > 0) {
      results.overall = failedTests > 3 ? 'FAIL' : 'WARN';
    }

  } catch (error) {
    results.overall = 'ERROR';
    results.error = error.message;
    console.error('❌ Test suite failed:', error.message);
  } finally {
    await browser.close();
  }

  // Write report
  const reportPath = '/home/sysop/.openclaw/workspace/test-login-shadcn-report.md';
  const report = generateReport(results);
  fs.writeFileSync(reportPath, report);
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Result: ${results.overall}`);
  console.log(`📄 Report saved: ${reportPath}`);
  console.log('='.repeat(60));
  
  // Exit with appropriate code
  process.exit(results.overall === 'PASS' ? 0 : 1);
}

function generateReport(results) {
  const pass = '✅';
  const fail = '❌';
  const warn = '⚠️ ';
  
  const checkMark = (val) => val ? pass : (val === false ? fail : warn);
  
  return `# Login Page Testing Report (shadcn/ui)

**Date:** ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
**Overall Result:** ${results.overall === 'PASS' ? '✅ PASS' : results.overall === 'WARN' ? '⚠️ WARN' : '❌ FAIL'}

---

## TV Hub Login (localhost:3001/login)

### UI/UX Testing
| Test | Status | Notes |
|------|--------|-------|
| Page Load | ${checkMark(results.tvHub?.ui?.pageLoad)} | Login page accessible |
| Background/Gradient | ${checkMark(results.tvHub?.ui?.hasBackground)} | Visual design |
| Card Component | ${checkMark(results.tvHub?.ui?.hasCard)} | shadcn/ui card |
| Email Input | ${checkMark(results.tvHub?.ui?.hasEmailInput)} | Form element |
| Password Input | ${checkMark(results.tvHub?.ui?.hasPasswordInput)} | Form element |
| Submit Button | ${checkMark(results.tvHub?.ui?.hasSubmitButton)} | Form element |
| Icons/Branding | ${checkMark(results.tvHub?.ui?.hasIcons)} | Visual elements |
| Mobile Responsive | ${checkMark(results.tvHub?.ui?.mobileResponsive)} | 375px viewport |

### Functionality Testing
| Test | Status | Notes |
|------|--------|-------|
| Form Validation | ${checkMark(results.tvHub?.functionality?.hasValidation)} | Empty field check |
| Login Success | ${checkMark(results.tvHub?.functionality?.loginSuccess)} | Valid credentials |

### Issues
${results.tvHub?.issues?.length > 0 ? results.tvHub.issues.map(i => `- ${i}`).join('\n') : 'No issues found'}

---

## Videotron Login (localhost:3002/login)

### UI/UX Testing
| Test | Status | Notes |
|------|--------|-------|
| Page Load | ${checkMark(results.videotron?.ui?.pageLoad)} | Login page accessible |
| Background/Gradient | ${checkMark(results.videotron?.ui?.hasBackground)} | Visual design |
| Card Component | ${checkMark(results.videotron?.ui?.hasCard)} | shadcn/ui card |
| Email Input | ${checkMark(results.videotron?.ui?.hasEmailInput)} | Form element |
| Password Input | ${checkMark(results.videotron?.ui?.hasPasswordInput)} | Form element |
| Submit Button | ${checkMark(results.videotron?.ui?.hasSubmitButton)} | Form element |
| Icons/Branding | ${checkMark(results.videotron?.ui?.hasIcons)} | Visual elements |
| Mobile Responsive | ${checkMark(results.videotron?.ui?.mobileResponsive)} | 375px viewport |

### Functionality Testing
| Test | Status | Notes |
|------|--------|-------|
| Form Validation | ${checkMark(results.videotron?.functionality?.hasValidation)} | Empty field check |
| Login Success | ${checkMark(results.videotron?.functionality?.loginSuccess)} | Valid credentials |

### Issues
${results.videotron?.issues?.length > 0 ? results.videotron.issues.map(i => `- ${i}`).join('\n') : 'No issues found'}

---

## Test Credentials
- **Email:** ${TEST_CONFIG.credentials.email}
- **Password:** ${TEST_CONFIG.credentials.password}

## Screenshots
- TV Hub: \`test-tvhub-login-new.png\`
- Videotron: \`test-videotron-login-new.png\`

---

**Testing completed at:** ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
`;
}

main();