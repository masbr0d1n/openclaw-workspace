const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // Capture all network requests
  const requests = [];
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/v1/')) {
      requests.push({
        url: url,
        method: request.method(),
        isProxy: url.includes(':300') || url.includes(':3002') || url.includes(':3003'),
        isDirect: url.includes(':8001')
      });
    }
  });

  console.log('Navigating to login page...');
  await page.goto('http://localhost:3002/login');
  
  console.log('Logging in...');
  await page.type('input[type="text"]', 'sysop@test.com');
  await page.type('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for navigation...');
  await page.waitForNavigation({waitUntil: 'networkidle0', timeout: 30000});
  
  console.log('Navigating to screens page...');
  await page.goto('http://localhost:3002/dashboard/screens');
  
  console.log('Waiting for API calls to complete...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Take screenshot
  await page.screenshot({
    path: '/home/sysop/.openclaw/workspace/network-tab-screenshot.png',
    fullPage: true
  });
  
  // Report
  console.log('\n=== API REQUESTS REPORT ===');
  console.log('API Requests:', requests);
  const directCalls = requests.filter(r => r.isDirect);
  const proxyCalls = requests.filter(r => r.isProxy);
  console.log('\nDirect to backend (localhost:8001):', directCalls.length);
  console.log('Through proxy (localhost:300X):', proxyCalls.length);
  
  console.log('\n=== DETAILED BREAKDOWN ===');
  requests.forEach((r, i) => {
    console.log(`${i + 1}. ${r.method} ${r.url}`);
  });
  
  await browser.close();
  
  console.log('\nScreenshot saved to: /home/sysop/.openclaw/workspace/network-tab-screenshot.png');
  console.log('\n=== VERIFICATION COMPLETE ===');
})();
