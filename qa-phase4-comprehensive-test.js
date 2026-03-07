const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const RESULTS_DIR = '/home/sysop/.openclaw/workspace/test-results';
const SCREENSHOTS_DIR = path.join(RESULTS_DIR, 'phase4-screenshots');

// Ensure directories exist
if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const TEST_RESULTS = {
  tvhub: { login: {}, pages: {}, console: [] },
  videotron: { login: {}, pages: {}, console: [] }
};

const BASE_URLS = {
  tvhub: 'http://localhost:3001',
  videotron: 'http://localhost:3002'
};

const TEST_CREDENTIALS = {
  email: 'sysop@test.com',
  password: 'password123'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  try {
    const filename = path.join(SCREENSHOTS_DIR, `${name}-${Date.now()}.png`);
    await page.screenshot({ path: filename, fullPage: true });
    return filename;
  } catch (e) {
    console.log(`Screenshot failed for ${name}: ${e.message}`);
    return null;
  }
}

async function testLogin(page, product, baseUrl) {
  const result = {
    loginWorks: false,
    userDataSaved: false,
    redirectWorks: false,
    sessionPersists: false,
    errors: []
  };

  try {
    console.log(`\n[${product.toUpperCase()}] Testing Login...`);
    
    // Navigate to login page
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(3000);
    
    // Take screenshot of login page
    await takeScreenshot(page, `${product}-login-page`);
    
    // Check if login form exists
    const loginForm = await page.$('#username, input[type="email"], input[name="email"]');
    if (!loginForm) {
      result.errors.push('Login form not found');
      await takeScreenshot(page, `${product}-login-form-missing`);
      return result;
    }

    // Fill login form
    await page.type('#username, input[type="email"], input[name="email"]', TEST_CREDENTIALS.email);
    await page.type('#password, input[type="password"], input[name="password"]', TEST_CREDENTIALS.password);
    
    // Submit form - use XPath for text matching
    const submitButton = await page.$('button[type="submit"]');
    if (!submitButton) {
      result.errors.push('Submit button not found');
      await takeScreenshot(page, `${product}-submit-button-missing`);
      return result;
    }
    
    await submitButton.click();
    await sleep(2000);
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => null);
    
    await sleep(5000);
    
    // Take screenshot after login attempt
    await takeScreenshot(page, `${product}-after-login`);
    
    // Check if redirected to dashboard
    const currentUrl = page.url();
    console.log(`[${product}] Current URL after login: ${currentUrl}`);
    result.redirectWorks = currentUrl.includes('/dashboard');
    
    if (!result.redirectWorks) {
      result.errors.push(`Redirect failed. Current URL: ${currentUrl}`);
    } else {
      result.loginWorks = true;
    }
    
    // Check user data (look for user info in localStorage or page)
    const userData = await page.evaluate(() => {
      try {
        const user = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');
        const token = localStorage.getItem('token');
        const session = localStorage.getItem('session');
        return { user, accessToken, token, session, url: window.location.href };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log(`[${product}] User data: ${JSON.stringify(userData).substring(0, 200)}`);
    result.userDataSaved = userData.user && userData.user !== 'undefined' && (userData.accessToken || userData.token || userData.session);
    
    if (!result.userDataSaved) {
      result.errors.push(`User data not saved properly`);
    }
    
    // Test session persistence (reload page)
    if (result.loginWorks) {
      await page.reload({ waitUntil: 'networkidle0' });
      await sleep(3000);
      
      const afterReload = await page.evaluate(() => {
        try {
          const user = localStorage.getItem('user');
          const accessToken = localStorage.getItem('access_token');
          const token = localStorage.getItem('token');
          const session = localStorage.getItem('session');
          return { user, accessToken, token, session, url: window.location.href };
        } catch (e) {
          return { error: e.message };
        }
      });
      
      result.sessionPersists = afterReload.user && (afterReload.accessToken || afterReload.token || afterReload.session);
      
      if (!result.sessionPersists) {
        result.errors.push('Session does not persist after reload');
      }
    }
    
  } catch (error) {
    result.errors.push(`Login test error: ${error.message}`);
    console.error(`[${product}] Login error:`, error);
    await takeScreenshot(page, `${product}-login-error`);
  }
  
  TEST_RESULTS[product].login = result;
  return result;
}

async function testPage(page, product, pagePath, name) {
  const baseUrl = BASE_URLS[product];
  const result = { loads: false, errors: [] };
  
  try {
    console.log(`[${product.toUpperCase()}] Testing ${name} (${pagePath})...`);
    
    await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(3000);
    
    // Take screenshot
    await takeScreenshot(page, `${product}-${name.replace(/\//g, '-')}`);
    
    // Check for errors in the page
    const pageErrors = await page.evaluate(() => {
      return {
        has404: document.title.includes('404') || document.body.innerText.includes('404'),
        hasError: document.querySelector('.error') !== null,
        title: document.title
      };
    });
    
    if (pageErrors.has404) {
      result.errors.push('404 error detected');
    } else {
      result.loads = true;
    }
    
  } catch (error) {
    result.errors.push(`Page load error: ${error.message}`);
    console.error(`[${product}] Page error for ${name}:`, error);
    await takeScreenshot(page, `${product}-${name.replace(/\//g, '-')}-error`);
  }
  
  TEST_RESULTS[product].pages[pagePath] = result;
  return result;
}

async function runTests() {
  console.log('🚀 Starting PHASE 4 QA Comprehensive Testing...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    // Test TV Hub
    console.log('📺 Testing TV Hub...\n');
    const tvhubPage = await browser.newPage();
    
    await testLogin(tvhubPage, 'tvhub', BASE_URLS.tvhub);
    
    if (TEST_RESULTS.tvhub.login.loginWorks) {
      await testPage(tvhubPage, 'tvhub', '/dashboard', 'dashboard');
      await sleep(1000);
      await testPage(tvhubPage, 'tvhub', '/dashboard/channels', 'channels');
      await sleep(1000);
      await testPage(tvhubPage, 'tvhub', '/dashboard/videos', 'videos');
      await sleep(1000);
      await testPage(tvhubPage, 'tvhub', '/dashboard/content/playlists', 'playlists');
      await sleep(1000);
      await testPage(tvhubPage, 'tvhub', '/dashboard/schedules', 'schedules');
    } else {
      console.log('[TVHUB] Login failed, skipping page tests');
      // Still test pages but mark as failed
      TEST_RESULTS.tvhub.pages['/dashboard'] = { loads: false, errors: ['Login failed'] };
      TEST_RESULTS.tvhub.pages['/dashboard/channels'] = { loads: false, errors: ['Login failed'] };
      TEST_RESULTS.tvhub.pages['/dashboard/videos'] = { loads: false, errors: ['Login failed'] };
      TEST_RESULTS.tvhub.pages['/dashboard/content/playlists'] = { loads: false, errors: ['Login failed'] };
      TEST_RESULTS.tvhub.pages['/dashboard/schedules'] = { loads: false, errors: ['Login failed'] };
    }
    
    // Test Videotron
    console.log('\n🎬 Testing Videotron...\n');
    const videotronPage = await browser.newPage();
    
    await testLogin(videotronPage, 'videotron', BASE_URLS.videotron);
    
    if (TEST_RESULTS.videotron.login.loginWorks) {
      await testPage(videotronPage, 'videotron', '/dashboard', 'dashboard');
      await sleep(1000);
      await testPage(videotronPage, 'videotron', '/dashboard/screens', 'screens');
      await sleep(1000);
      await testPage(videotronPage, 'videotron', '/dashboard/content', 'content');
      await sleep(1000);
      await testPage(videotronPage, 'videotron', '/dashboard/layouts', 'layouts');
      await sleep(1000);
      await testPage(videotronPage, 'videotron', '/dashboard/campaign', 'campaign');
    } else {
      console.log('[VIDEOTRON] Login failed, skipping page tests');
      // Still test pages but mark as failed
      TEST_RESULTS.videotron.pages['/dashboard'] = { loads: false, errors: ['Login failed'] };
      TEST_RESULTS.videotron.pages['/dashboard/screens'] = { loads: false, errors: ['Login failed'] };
      TEST_RESULTS.videotron.pages['/dashboard/content'] = { loads: false, errors: ['Login failed'] };
      TEST_RESULTS.videotron.pages['/dashboard/layouts'] = { loads: false, errors: ['Login failed'] };
      TEST_RESULTS.videotron.pages['/dashboard/campaign'] = { loads: false, errors: ['Login failed'] };
    }
    
  } finally {
    await browser.close();
  }
  
  return TEST_RESULTS;
}

function generateReport(results) {
  let report = '# PHASE 4 QA Comprehensive Testing Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  // TV Hub Results
  report += '## 📺 TV Hub Results\n\n';
  report += '### Login\n';
  const tvhubLogin = results.tvhub.login;
  totalTests += 4;
  if (tvhubLogin.loginWorks) { report += '- ✅ Login works\n'; passedTests++; } 
  else { report += '- ❌ Login works\n'; failedTests++; }
  
  if (tvhubLogin.userDataSaved) { report += '- ✅ User data saved (NOT "undefined")\n'; passedTests++; } 
  else { report += '- ❌ User data saved (NOT "undefined")\n'; failedTests++; }
  
  if (tvhubLogin.redirectWorks) { report += '- ✅ Redirect to dashboard\n'; passedTests++; } 
  else { report += '- ❌ Redirect to dashboard\n'; failedTests++; }
  
  if (tvhubLogin.sessionPersists) { report += '- ✅ Session persists\n'; passedTests++; } 
  else { report += '- ❌ Session persists\n'; failedTests++; }
  
  if (tvhubLogin.errors && tvhubLogin.errors.length > 0) {
    report += `\n**Errors:** ${tvhubLogin.errors.join('; ')}\n`;
  }
  
  report += '\n### Pages\n';
  const tvhubPages = ['/dashboard', '/dashboard/channels', '/dashboard/videos', '/dashboard/content/playlists', '/dashboard/schedules'];
  tvhubPages.forEach(pagePath => {
    totalTests++;
    const result = results.tvhub.pages[pagePath];
    if (result && result.loads) {
      report += `- ✅ ${pagePath} loads\n`;
      passedTests++;
    } else {
      report += `- ❌ ${pagePath} loads\n`;
      failedTests++;
      if (result && result.errors && result.errors.length > 0) {
        report += `  **Errors:** ${result.errors.join('; ')}\n`;
      } else if (!result) {
        report += `  **Note:** Page not tested (login failed)\n`;
      }
    }
  });
  
  // Videotron Results
  report += '\n## 🎬 Videotron Results\n\n';
  report += '### Login\n';
  const videotronLogin = results.videotron.login;
  totalTests += 4;
  if (videotronLogin.loginWorks) { report += '- ✅ Login works\n'; passedTests++; } 
  else { report += '- ❌ Login works\n'; failedTests++; }
  
  if (videotronLogin.userDataSaved) { report += '- ✅ User data saved (NOT "undefined")\n'; passedTests++; } 
  else { report += '- ❌ User data saved (NOT "undefined")\n'; failedTests++; }
  
  if (videotronLogin.redirectWorks) { report += '- ✅ Redirect to dashboard\n'; passedTests++; } 
  else { report += '- ❌ Redirect to dashboard\n'; failedTests++; }
  
  if (videotronLogin.sessionPersists) { report += '- ✅ Session persists\n'; passedTests++; } 
  else { report += '- ❌ Session persists\n'; failedTests++; }
  
  if (videotronLogin.errors && videotronLogin.errors.length > 0) {
    report += `\n**Errors:** ${videotronLogin.errors.join('; ')}\n`;
  }
  
  report += '\n### Pages\n';
  const videotronPages = ['/dashboard', '/dashboard/screens', '/dashboard/content', '/dashboard/layouts', '/dashboard/campaign'];
  videotronPages.forEach(pagePath => {
    totalTests++;
    const result = results.videotron.pages[pagePath];
    if (result && result.loads) {
      report += `- ✅ ${pagePath} loads\n`;
      passedTests++;
    } else {
      report += `- ❌ ${pagePath} loads\n`;
      failedTests++;
      if (result && result.errors && result.errors.length > 0) {
        report += `  **Errors:** ${result.errors.join('; ')}\n`;
      } else if (!result) {
        report += `  **Note:** Page not tested (login failed)\n`;
      }
    }
  });
  
  // Summary
  report += '\n## 📊 Summary\n\n';
  report += `**Total Tests:** ${totalTests}\n`;
  report += `**Passed:** ${passedTests}\n`;
  report += `**Failed:** ${failedTests}\n`;
  report += `**Success Rate:** ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%\n\n`;
  
  const readyForProduction = failedTests === 0;
  report += `## 🚀 READY FOR PRODUCTION: ${readyForProduction ? 'YES ✅' : 'NO ❌'}\n\n`;
  
  if (!readyForProduction) {
    report += '### Issues to Fix:\n';
    report += '- See failed tests above\n';
    report += `- Screenshots saved in: ${SCREENSHOTS_DIR}\n`;
  }
  
  return report;
}

// Main execution
(async () => {
  try {
    const results = await runTests();
    const report = generateReport(results);
    
    // Save report
    const reportPath = path.join(RESULTS_DIR, 'phase4-qa-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved to: ${reportPath}`);
    
    // Save JSON results
    const jsonPath = path.join(RESULTS_DIR, 'phase4-qa-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    console.log(`📄 JSON results saved to: ${jsonPath}`);
    
    console.log('\n' + report);
    
  } catch (error) {
    console.error('Test execution failed:', error);
    const errorReport = `# PHASE 4 QA Test Failed\n\nError: ${error.message}\n\nStack: ${error.stack}`;
    fs.writeFileSync(path.join(RESULTS_DIR, 'phase4-qa-error.md'), errorReport);
  }
})();
