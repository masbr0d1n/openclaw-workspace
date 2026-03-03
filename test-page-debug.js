const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugPage() {
  console.log('🧪 Debugging playlist page...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('Step 1: Navigating...');
    await page.goto('http://100.74.116.116:3000/dashboard/content', { waitUntil: 'networkidle0' });
    await delay(3000);
    
    console.log('Step 2: Checking page content...');
    const pageInfo = await page.evaluate(() => {
      // Check for tables
      const tables = document.querySelectorAll('table');
      const tableCount = tables.length;
      
      // Check for rows
      const rows = document.querySelectorAll('tr');
      const rowCount = rows.length;
      
      // Get text content
      const bodyText = document.body.textContent.substring(0, 500);
      
      // Check for buttons
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonTexts = buttons.map(b => b.textContent?.trim()).filter(Boolean);
      
      return {
        tableCount,
        rowCount,
        bodyText,
        buttonTexts: buttonTexts.slice(0, 10)
      };
    });
    
    console.log('\n📊 Page Info:');
    console.log(`  Tables: ${pageInfo.tableCount}`);
    console.log(`  Rows: ${pageInfo.rowCount}`);
    console.log(`  Buttons: ${pageInfo.buttonTexts.join(', ')}`);
    console.log(`\n  Body text preview: ${pageInfo.bodyText.substring(0, 200)}...`);
    
    // Screenshot
    await page.screenshot({ path: '/home/sysop/.openclaw/workspace/debug-page.png' });
    console.log('\n📸 Screenshot: debug-page.png');
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
    process.exit(1);
  }
}

debugPage();
