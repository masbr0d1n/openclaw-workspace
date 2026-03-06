const puppeteer = require('puppeteer');

async function testLoginPage(url, name) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Navigate to page
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Check CSS loaded
  const cssLoaded = await page.evaluate(() => {
    const stylesheets = Array.from(document.styleSheets);
    const hasStyles = stylesheets.length > 0;
    const hasTailwind = stylesheets.some(s => {
      try {
        return Array.from(s.cssRules || []).some(rule => 
          rule.cssText && (rule.cssText.includes('tailwind') || rule.cssText.includes('gradient'))
        );
      } catch { return false; }
    });
    return { hasStyles, hasTailwind };
  });
  
  // Check shadcn/ui components
  const hasShadcn = await page.evaluate(() => {
    return {
      hasCard: document.querySelector('[class*="card"]') !== null,
      hasButton: document.querySelector('[class*="button"]') !== null,
      hasInput: document.querySelector('[class*="input"]') !== null,
      hasGradient: document.querySelector('[class*="gradient"]') !== null,
      hasRounded: document.querySelector('[class*="rounded"]') !== null
    };
  });
  
  // Check for hydration errors
  const hasHydrationError = errors.some(e => e.includes('hydrat'));
  
  // Screenshot
  const screenshotPath = `/tmp/qa-${name}-login-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  // Test login form
  const formWorking = await page.evaluate(() => {
    const usernameInput = document.querySelector('input[type="text"], input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const submitButton = document.querySelector('button[type="submit"]');
    return usernameInput !== null && passwordInput !== null && submitButton !== null;
  });
  
  await browser.close();
  
  return {
    url,
    name,
    cssLoaded,
    hasShadcn,
    hasHydrationError,
    formWorking,
    errors: errors.slice(0, 5),
    screenshot: screenshotPath
  };
}

async function runTests() {
  // Test both pages
  const tvhub = await testLoginPage('http://localhost:3001/login', 'tvhub');
  const videotron = await testLoginPage('http://localhost:3002/login', 'videotron');

  console.log('TV Hub:', JSON.stringify(tvhub, null, 2));
  console.log('Videotron:', JSON.stringify(videotron, null, 2));
}

runTests().catch(console.error);
