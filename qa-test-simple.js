const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();

  // Capture console logs
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  page.on('pageerror', err => logs.push(err.message));

  // Go to login page
  console.log('Navigating to login page...');
  const response = await page.goto('http://localhost:3002/login', {waitUntil: 'domcontentloaded', timeout: 30000});
  console.log('Response status:', response.status());
  console.log('Page URL:', page.url());
  
  // Get page content
  const content = await page.content();
  console.log('Page content length:', content.length);
  console.log('Contains "username":', content.includes('username'));
  console.log('Contains "password":', content.includes('password'));
  console.log('Contains "Videotron":', content.includes('Videotron'));
  
  // Check if it's a 404 page
  const is404 = content.includes('404') || content.includes('This page could not be found');
  console.log('Is 404 page:', is404);
  
  // Try to find all inputs
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(el => ({
      id: el.id,
      type: el.type,
      name: el.name,
      className: el.className
    }));
  });
  console.log('Input elements found:', inputs.length);
  console.log('Input details:', JSON.stringify(inputs, null, 2));
  
  // Take screenshot
  await page.screenshot({path: '/home/sysop/.openclaw/workspace/qa-debug-screenshot.png', fullPage: true});
  console.log('Screenshot saved to qa-debug-screenshot.png');

  await browser.close();
})();
