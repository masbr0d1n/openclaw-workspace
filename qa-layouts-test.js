const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();

  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // Navigate to layouts page
  await page.goto('http://localhost:3000/dashboard/layouts', {
    waitUntil: 'networkidle0',
    timeout: 20000
  });

  // Check for specific errors
  const has404 = errors.some(e => e.includes('404'));
  const hasQueryClient = errors.some(e => e.includes('QueryClient'));

  // Screenshot
  await page.screenshot({path: '/tmp/qa-layouts-final.png', fullPage: true});

  const success = !has404 && !hasQueryClient;

  console.log('404 Error:', has404);
  console.log('QueryClient Error:', hasQueryClient);
  console.log('Success:', success);

  await browser.close();
  process.exit(success ? 0 : 1);
})();
