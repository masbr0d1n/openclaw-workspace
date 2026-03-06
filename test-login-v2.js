const puppeteer = require('puppeteer');
const fs = require('fs');

const TEST_CONFIG = {
  tvHub: {
    url: 'http://localhost:3001/login',
    name: 'TV Hub',
    color: 'blue',
    expectedTitle: 'TV Hub',
    dashboardRedirect: '/dashboard/channels'
  },
  videotron: {
    url: 'http://localhost:3002/login',
    name: 'Videotron',
    color: 'purple',
    expectedTitle: 'Videotron',
    dashboardRedirect: '/dashboard/screens'
  },
  credentials: {
    username: 'sysop@test.com',
    password: 'password123'
  }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testLogin(page, config, credentials) {
  const results = {
    ui: {},
    functionality: {},
    issues: []
  };

  try {
    console.log(`\n📋 Testing ${config.name} Login Page...`);
    
    // Navigate to login page
    const response = await page.goto(config.url, { 
      waitUntil: 'domcontentloaded', 
      timeout: 15000 
    });
    
    // Wait for React to render
    await sleep(2000);
    
    const title = await page.title();
    results.ui.pageLoad = response.status() === 200;
    console.log(`  ✅ Page loaded (${response.status()}): ${title}`);

    // Check gradient/gradient on parent element
    const gradientCheck = await page.evaluate(() => {
      // Check if there's a gradient background on the main container
      const mainDiv = document.querySelector('.min-h-screen, main, body > div');
      if (mainDiv) {
        const styles = window.getComputedStyle(mainDiv);
        const bg = styles.background;
        const hasGradient = bg.includes('gradient') || bg.includes('linear') || bg.includes('radial');
        return { hasGradient, bg: bg.substring(0, 100) };
      }
      return { hasGradient: false, bg: 'no container found' };
    });
    
    results.ui.hasGradient = gradientCheck.hasGradient;
    console.log(`  ${results.ui.hasGradient ? '✅' : '⚠️ '} Gradient: ${gradientCheck.bg.substring(0, 50)}...`);

    // Check card component
    const cardElement = await page.$('[class*="card"], [class*="Card"]');
    results.ui.hasCard = cardElement !== null;
    console.log(`  ${results.ui.hasCard ? '✅' : '❌'} Card component`);

    // Check form elements
    const usernameInput = await page.$('input[name="username"], input[type="text"]');
    const passwordInput = await page.$('input[type="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    results.ui.hasUsernameInput = usernameInput !== null;
    results.ui.hasPasswordInput = passwordInput !== null;
    results.ui.hasSubmitButton = submitButton !== null;
    
    console.log(`  ${results.ui.hasUsernameInput ? '✅' : '❌'} Username input`);
    console.log(`  ${results.ui.hasPasswordInput ? '✅' : '❌'} Password input`);
    console.log(`  ${results.ui.hasSubmitButton ? '✅' : '❌'} Submit button`);

    // Check icons
    const icons = await page.$$eval('svg', els => els.length);
    results.ui.hasIcons = icons > 0;
    console.log(`  ${results.ui.hasIcons ? '✅' : '❌'} Icons: ${icons} found`);

    // Check branding
    const brandingCheck = await page.evaluate((expectedBrand) => {
      const text = document.body.innerText;
      return {
        hasTVHub: text.includes('TV Hub'),
        hasVideotron: text.includes('Videotron'),
        hasStreamHub: text.includes('StreamHub')
      };
    }, config.name);
    
    results.ui.hasBranding = brandingCheck.hasStreamHub || 
      (config.name === 'TV Hub' && brandingCheck.hasTVHub) ||
      (config.name === 'Videotron' && brandingCheck.hasVideotron);
    
    console.log(`  ${results.ui.hasBranding ? '✅' : '❌'} Branding found`);

    // Test login flow
    if (usernameInput && passwordInput && submitButton) {
      console.log('\n  🧪 Testing login flow...');
      
      await usernameInput.click();
      await usernameInput.type(credentials.username);
      console.log(`  ✅ Username entered`);
      
      await passwordInput.click();
      await passwordInput.type(credentials.password);
      console.log(`  ✅ Password entered`);
      
      await submitButton.click();
      console.log(`  ✅ Submit button clicked`);
      
      // Wait for navigation or response
      await sleep(3000);
      
      const finalUrl = page.url();
      results.functionality.loginSuccess = finalUrl.includes('/dashboard');
      results.functionality.finalUrl = finalUrl;
      
      console.log(`  ${results.functionality.loginSuccess ? '✅' : '❌'} Login result: ${finalUrl}`);
      
      if (!results.functionality.loginSuccess) {
        // Check for error messages
        const errorText = await page.evaluate(() => {
          const errorEl = document.querySelector('[class*="error"], [class*="alert"], [role="alert"]');
          return errorEl ? errorEl.innerText : null;
        });
        
        if (errorText) {
          results.issues.push(`Login error: ${errorText}`);
          console.log(`  ❌ Error message: ${errorText}`);
        } else {
          results.issues.push(`Unexpected redirect: ${finalUrl}`);
        }
      }
    } else {
      results.issues.push('Missing form elements');
      console.log(`  ❌ Missing form elements, skipping login test`);
    }

    // Test mobile responsive
    console.log('\n  📱 Testing mobile responsive...');
    await page.setViewport({ width: 375, height: 667 });
    await sleep(500);
    
    const cardVisible = await page.$eval('[class*="card"], [class*="Card"]', el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.width <= 375;
    }).catch(() => false);
    
    results.ui.mobileResponsive = cardVisible;
    console.log(`  ${results.ui.mobileResponsive ? '✅' : '❌'} Mobile responsive`);

  } catch (error) {
    results.issues.push(`Test error: ${error.message}`);
    console.log(`  ❌ Error: ${error.message}`);
  }

  return results;
}

async function takeScreenshot(page, filename) {
  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.screenshot({ path: filename, fullPage: false });
    console.log(`  📸 Screenshot: ${filename}`);
    return true;
  } catch (error) {
    console.log(`  ❌ Screenshot failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 QA Testing: Login Pages with shadcn/ui\n');
  console.log('='.repeat(60));
  
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
    results.tvHub = await testLogin(page1, TEST_CONFIG.tvHub, TEST_CONFIG.credentials);
    await takeScreenshot(page1, '/home/sysop/.openclaw/workspace/test-tvhub-login-new.png');
    await page1.close();

    // Test Videotron
    const page2 = await browser.newPage();
    results.videotron = await testLogin(page2, TEST_CONFIG.videotron, TEST_CONFIG.credentials);
    await takeScreenshot(page2, '/home/sysop/.openclaw/workspace/test-videotron-login-new.png');
    await page2.close();

    // Calculate overall result
    const allUiTests = [
      results.tvHub?.ui?.pageLoad,
      results.tvHub?.ui?.hasCard,
      results.tvHub?.ui?.hasUsernameInput,
      results.tvHub?.ui?.hasPasswordInput,
      results.tvHub?.ui?.hasSubmitButton,
      results.tvHub?.ui?.hasIcons,
      results.tvHub?.ui?.mobileResponsive,
      results.videotron?.ui?.pageLoad,
      results.videotron?.ui?.hasCard,
      results.videotron?.ui?.hasUsernameInput,
      results.videotron?.ui?.hasPasswordInput,
      results.videotron?.ui?.hasSubmitButton,
      results.videotron?.ui?.hasIcons,
      results.videotron?.ui?.mobileResponsive
    ].filter(x => x !== undefined);
    
    const passCount = allUiTests.filter(x => x === true).length;
    const failCount = allUiTests.filter(x => x === false).length;
    const totalIssues = (results.tvHub?.issues?.length || 0) + (results.videotron?.issues?.length || 0);
    
    if (failCount > 3 || totalIssues > 2) {
      results.overall = 'FAIL';
    } else if (failCount > 0 || totalIssues > 0) {
      results.overall = 'WARN';
    }

  } catch (error) {
    results.overall = 'ERROR';
    results.error = error.message;
    console.error('\n❌ Test suite error:', error.message);
  } finally {
    await browser.close();
  }

  // Generate report
  const report = generateReport(results);
  fs.writeFileSync('/home/sysop/.openclaw/workspace/test-login-shadcn-report.md', report);
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Result: ${results.overall === 'PASS' ? '✅ PASS' : results.overall === 'WARN' ? '⚠️ WARN' : '❌ FAIL'}`);
  console.log(`📄 Report: test-login-shadcn-report.md`);
  console.log('='.repeat(60));
  
  process.exit(results.overall === 'PASS' ? 0 : 1);
}

function generateReport(results) {
  const check = (val) => val ? '✅' : (val === false ? '❌' : '⚠️ ');
  
  return `# Login Page Testing Report (shadcn/ui)

**Date:** ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
**Overall:** ${results.overall === 'PASS' ? '✅ PASS' : results.overall === 'WARN' ? '⚠️ WARN' : '❌ FAIL'}

---

## TV Hub Login (localhost:3001/login)

### UI/UX
| Test | Status |
|------|--------|
| Page Load | ${check(results.tvHub?.ui?.pageLoad)} |
| Gradient Background | ${check(results.tvHub?.ui?.hasGradient)} |
| Card Component | ${check(results.tvHub?.ui?.hasCard)} |
| Username Input | ${check(results.tvHub?.ui?.hasUsernameInput)} |
| Password Input | ${check(results.tvHub?.ui?.hasPasswordInput)} |
| Submit Button | ${check(results.tvHub?.ui?.hasSubmitButton)} |
| Icons | ${check(results.tvHub?.ui?.hasIcons)} |
| Branding | ${check(results.tvHub?.ui?.hasBranding)} |
| Mobile Responsive | ${check(results.tvHub?.ui?.mobileResponsive)} |

### Functionality
| Test | Status |
|------|--------|
| Login Success | ${check(results.tvHub?.functionality?.loginSuccess)} |

### Issues
${results.tvHub?.issues?.length > 0 ? results.tvHub.issues.map(i => `- ${i}`).join('\n') : '✅ No issues'}

---

## Videotron Login (localhost:3002/login)

### UI/UX
| Test | Status |
|------|--------|
| Page Load | ${check(results.videotron?.ui?.pageLoad)} |
| Gradient Background | ${check(results.videotron?.ui?.hasGradient)} |
| Card Component | ${check(results.videotron?.ui?.hasCard)} |
| Username Input | ${check(results.videotron?.ui?.hasUsernameInput)} |
| Password Input | ${check(results.videotron?.ui?.hasPasswordInput)} |
| Submit Button | ${check(results.videotron?.ui?.hasSubmitButton)} |
| Icons | ${check(results.videotron?.ui?.hasIcons)} |
| Branding | ${check(results.videotron?.ui?.hasBranding)} |
| Mobile Responsive | ${check(results.videotron?.ui?.mobileResponsive)} |

### Functionality
| Test | Status |
|------|--------|
| Login Success | ${check(results.videotron?.functionality?.loginSuccess)} |

### Issues
${results.videotron?.issues?.length > 0 ? results.videotron.issues.map(i => `- ${i}`).join('\n') : '✅ No issues'}

---

## Test Credentials
- **Username:** ${TEST_CONFIG.credentials.username}
- **Password:** ${TEST_CONFIG.credentials.password}

## Screenshots
- TV Hub: test-tvhub-login-new.png
- Videotron: test-videotron-login-new.png

---

**Completed:** ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
`;
}

main();