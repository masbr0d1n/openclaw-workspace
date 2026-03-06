const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  console.log('Navigating to login page...');
  await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle0' });
  
  console.log('\nPage HTML:');
  const html = await page.content();
  console.log(html.substring(0, 3000));
  
  console.log('\n\nAll input elements:');
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(el => ({
      type: el.type,
      name: el.name,
      id: el.id,
      className: el.className,
      placeholder: el.placeholder
    }));
  });
  console.log(JSON.stringify(inputs, null, 2));
  
  console.log('\n\nAll button elements:');
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(el => ({
      type: el.type,
      text: el.textContent.trim(),
      id: el.id,
      className: el.className
    }));
  });
  console.log(JSON.stringify(buttons, null, 2));

  await browser.close();
})();
