const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testThumbnailsInEditMode() {
  console.log('🧪 Testing thumbnails in edit mode (headless)...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('Step 1: Navigating to playlist page...');
    await page.goto('http://100.74.116.116:3000/dashboard/content', { waitUntil: 'networkidle0' });
    await delay(3000);
    
    console.log('Step 2: Looking for draft playlists...');
    const draftData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          const name = cells[0].textContent?.trim();
          const status = cells[2]?.textContent?.trim();
          const editBtn = row.querySelector('button');
          return { name, status, hasEdit: !!editBtn };
        }
        return null;
      }).filter(Boolean);
    });
    
    console.log(`Found ${draftData.length} drafts`);
    
    if (draftData.length === 0) {
      throw new Error('No drafts found');
    }
    
    console.log(`Clicking Edit on: "${draftData[0].name}"`);
    
    console.log('Step 3: Clicking Edit button...');
    const editClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const editBtn = buttons.find(b => b.textContent?.trim() === 'Edit');
      if (editBtn) {
        editBtn.click();
        return true;
      }
      return false;
    });
    
    if (!editClicked) {
      throw new Error('Edit button not clicked');
    }
    
    console.log('✅ Edit clicked');
    await delay(2000);
    
    console.log('Step 4: Checking thumbnails...');
    const checkResults = await page.evaluate(() => {
      const timelineDivs = Array.from(document.querySelectorAll('[class*="space-y-2"] > div'));
      return timelineDivs.map((div, i) => {
        const img = div.querySelector('img');
        const text = div.textContent || '';
        return {
          index: i + 1,
          hasImage: !!img,
          src: img ? img.src.substring(0, 60) + '...' : null,
          hasVID: text.includes('VID'),
          hasIMG: text.includes('IMG')
        };
      });
    });
    
    console.log('\n📊 Timeline Items:');
    let withImg = 0;
    checkResults.forEach(r => {
      if (r.hasImage) {
        withImg++;
        console.log(`  ${r.index}. ✅ Has image`);
        console.log(`     ${r.src}`);
      } else if (r.hasVID || r.hasIMG) {
        console.log(`  ${r.index}. ⚠️ Has fallback (${r.hasVID ? 'VID' : 'IMG'})`);
      } else {
        console.log(`  ${r.index}. ❌ No thumbnail`);
      }
    });
    
    console.log(`\n📈 Total: ${checkResults.length}, With images: ${withImg}`);
    
    const success = checkResults.length > 0 && withImg > 0;
    console.log(success ? '\n✅ TEST PASSED' : '\n❌ TEST FAILED');
    
    await browser.close();
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
    process.exit(1);
  }
}

testThumbnailsInEditMode();
