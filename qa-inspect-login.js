const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage();

  await page.goto('http://localhost:3002/login');
  await new Promise(r => setTimeout(r, 3000));
  
  // Get the HTML content
  const html = await page.content();
  console.log('=== LOGIN PAGE HTML ===');
  console.log(html);
  
  // Take screenshot
  await page.screenshot({path: '/home/sysop/.openclaw/workspace/qa-login-page.png', fullPage: true});
  
  // Find all input elements
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(el => ({
      type: el.type,
      name: el.name,
      id: el.id,
      className: el.className,
      placeholder: el.placeholder
    }));
  });
  console.log('=== INPUT ELEMENTS ===');
  console.log(JSON.stringify(inputs, null, 2));
  
  // Find all buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(el => ({
      type: el.type,
      text: el.textContent.trim(),
      id: el.id,
      className: el.className
    }));
  });
  console.log('=== BUTTON ELEMENTS ===');
  console.log(JSON.stringify(buttons, null, 2));
  
  await browser.close();
})();
