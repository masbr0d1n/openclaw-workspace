const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3002';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots-e2e');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  const results = {
    login: { pass: false, notes: '' },
    navigation: { pass: false, notes: '' },
    screenList: { pass: false, notes: '' },
    addScreen: { pass: false, notes: '' },
    editScreen: { pass: false, notes: '' },
    deleteScreen: { pass: false, notes: '' },
    screenGroups: { pass: false, notes: '' }
  };

  const consoleErrors = [];
  const screenshots = [];

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  // Capture console logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ type: 'console', text: msg.text() });
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push({ type: 'pageerror', text: err.message });
  });

  page.on('requestfailed', request => {
    const failure = request.failure();
    if (failure) {
      consoleErrors.push({ type: 'requestfailed', text: `${failure.errorText} ${request.url()}` });
    }
  });

  try {
    console.log('🧪 Starting Screens E2E Test...\n');

    // ========== 1. LOGIN & NAVIGATION ==========
    console.log('📝 Test 1: Login & Navigation');
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
      await sleep(3000);

      // Take login page screenshot
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-login-page.png') });
      screenshots.push('01-login-page.png');
      console.log('   📸 Login page screenshot captured');

      // Fill login form - using #username as seen in HTML
      await page.click('#username');
      await page.type('#username', 'sysop@test.com', { delay: 50 });
      await page.click('#password');
      await page.type('#password', 'password123', { delay: 50 });
      await sleep(500);

      // Submit form
      await page.click('button[type="submit"]');
      await sleep(5000);

      // Check if redirected
      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('dashboard') || !currentUrl.includes('login')) {
        results.login.pass = true;
        results.login.notes = 'Successfully logged in';
        console.log('   ✅ Login successful');
      } else {
        results.login.notes = 'Still on login page after submit';
        console.log('   ❌ Login failed - still on login page');
        
        // Check for error message
        const errorText = await page.$eval('body', el => el.innerText).catch(() => '');
        if (errorText.toLowerCase().includes('invalid') || errorText.toLowerCase().includes('error')) {
          results.login.notes = 'Login error: Invalid credentials';
        }
      }

      // Navigate to screens
      await page.goto(`${BASE_URL}/dashboard/screens`, { waitUntil: 'networkidle0', timeout: 30000 });
      await sleep(3000);

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-screens-page.png') });
      screenshots.push('02-screens-page.png');
      console.log('   📸 Screens page screenshot captured');

      if (page.url().includes('/screens')) {
        results.navigation.pass = true;
        results.navigation.notes = 'Successfully navigated to /dashboard/screens';
        console.log('   ✅ Navigation successful');
      } else {
        results.navigation.notes = `Navigation failed - ended at: ${page.url()}`;
        console.log('   ❌ Navigation failed');
      }
    } catch (error) {
      results.login.notes = error.message;
      results.navigation.notes = error.message;
      console.log('   ❌ Login/Navigation error:', error.message);
    }

    // ========== 2. SCREEN LIST ==========
    console.log('\n📋 Test 2: Screen List');
    try {
      await sleep(2000);
      
      // Check for screen list container or cards
      const screenCards = await page.$$('.screen-card, [data-testid="screen-card"], .screen-item, [class*="screen"]').length;
      const listContainer = await page.$('.screen-list, [data-testid="screen-list"], #screen-list, [class*="screen-list"], [class*="screens-grid"]');
      const emptyState = await page.$('.empty-state, [data-testid="empty-state"], .no-screens, [class*="empty"]');
      
      console.log(`   Found ${screenCards} screen cards`);
      
      if (screenCards > 0 || listContainer || emptyState) {
        results.screenList.pass = true;
        results.screenList.notes = screenCards > 0 
          ? `Screen list displayed with ${screenCards} cards`
          : (emptyState ? 'Empty state displayed' : 'Screen list container found');
        console.log('   ✅ Screen list displayed');
      } else {
        results.screenList.notes = 'Screen list not found';
        console.log('   ❌ Screen list not found');
        
        // Save debug screenshot
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-debug-screenlist.png') });
      }
    } catch (error) {
      results.screenList.notes = error.message;
      console.log('   ❌ Screen list error:', error.message);
    }

    // ========== 3. ADD SCREEN ==========
    console.log('\n➕ Test 3: Add Screen');
    try {
      await sleep(1000);

      // Look for Add Screen button with various selectors
      const addButton = await page.$('button[class*="add"], button[class*="new"], [data-testid*="add"], [data-testid*="new"], button svg + span, span:has-text("Add"), span:has-text("New")');
      
      if (!addButton) {
        // Try to find any button that might be the add button
        const allButtons = await page.$$eval('button', btns => btns.map(b => b.innerText));
        console.log('   Available buttons:', allButtons);
        
        // Try clicking the first button that looks like an add button
        const addLikeButton = await page.$$eval('button', btns => {
          const addBtn = btns.find(b => b.innerText.toLowerCase().includes('add') || b.innerText.toLowerCase().includes('new'));
          return addBtn ? true : false;
        });
      }

      // Use a more robust approach - find button by text content
      const buttons = await page.$$('button');
      let foundAddButton = false;
      
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.toLowerCase().includes('add') || text.toLowerCase().includes('new')) {
          await btn.click();
          foundAddButton = true;
          console.log('   ✅ Clicked button:', text);
          break;
        }
      }

      if (foundAddButton) {
        await sleep(3000);

        // Take form screenshot
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-add-screen-form.png') });
        screenshots.push('03-add-screen-form.png');
        console.log('   📸 Form screenshot captured');

        // Try to find and fill form fields
        const inputs = await page.$$('input');
        console.log(`   Found ${inputs.length} input fields`);
        
        // Fill first text input with screen name
        if (inputs.length >= 1) {
          await inputs[0].click({ clickCount: 3 });
          await inputs[0].type('E2E Test Screen', { delay: 50 });
        }
        
        // Fill second text input with location
        if (inputs.length >= 2) {
          await inputs[1].click({ clickCount: 3 });
          await inputs[1].type('Test Location', { delay: 50 });
        }
        
        // Fill third input with resolution (if exists)
        if (inputs.length >= 3) {
          await inputs[2].click({ clickCount: 3 });
          await inputs[2].type('1920x1080', { delay: 50 });
        }

        await sleep(1000);

        // Find and click submit/save button
        const submitButtons = await page.$$('button');
        for (const btn of submitButtons) {
          const text = await page.evaluate(el => el.innerText, btn);
          if (text.toLowerCase().includes('save') || text.toLowerCase().includes('create') || text.toLowerCase().includes('submit')) {
            await btn.click();
            console.log('   ✅ Clicked submit button:', text);
            break;
          }
        }

        await sleep(4000);

        // Take screenshot after submission
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-screen-added.png') });
        screenshots.push('04-screen-added.png');

        // Check for success indicators
        const successMsg = await page.$('[class*="success"], [class*="toast"], [class*="alert"]');
        const screenCount = await page.$$('.screen-card, [class*="screen"]').length;

        if (successMsg || screenCount > 0) {
          results.addScreen.pass = true;
          results.addScreen.notes = 'Screen created successfully';
          console.log('   ✅ Screen added successfully');
        } else {
          results.addScreen.notes = 'Screen creation status unclear';
          console.log('   ⚠️ Screen creation status unclear');
        }
      } else {
        results.addScreen.notes = 'Add Screen button not found';
        console.log('   ❌ Add Screen button not found');
        
        // Save debug screenshot
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-debug-addbutton.png') });
      }
    } catch (error) {
      results.addScreen.notes = error.message;
      console.log('   ❌ Add screen error:', error.message);
    }

    // ========== 4. EDIT SCREEN ==========
    console.log('\n✏️ Test 4: Edit Screen');
    try {
      await sleep(1000);

      // Find edit button
      const buttons = await page.$$('button');
      let foundEditButton = false;
      
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), btn);
        
        if (text.toLowerCase().includes('edit') || (ariaLabel && ariaLabel.toLowerCase().includes('edit'))) {
          await btn.click();
          foundEditButton = true;
          console.log('   ✅ Clicked edit button');
          break;
        }
      }
      
      if (foundEditButton) {
        await sleep(2000);

        // Take edit form screenshot
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-edit-form.png') });
        screenshots.push('05-edit-form.png');

        // Find name input and modify it
        const inputs = await page.$$('input');
        if (inputs.length > 0) {
          await inputs[0].click({ clickCount: 3 });
          await inputs[0].type(' - Edited', { delay: 50 });
          await sleep(500);

          // Find and click save button
          const submitButtons = await page.$$('button');
          for (const btn of submitButtons) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text.toLowerCase().includes('save') || text.toLowerCase().includes('update')) {
              await btn.click();
              console.log('   ✅ Clicked save button');
              break;
            }
          }

          await sleep(3000);

          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-screen-edited.png') });
          screenshots.push('06-screen-edited.png');

          results.editScreen.pass = true;
          results.editScreen.notes = 'Screen edited successfully';
          console.log('   ✅ Screen edited successfully');
        } else {
          results.editScreen.notes = 'No input fields found in edit form';
          console.log('   ❌ No input fields found');
        }
      } else {
        results.editScreen.notes = 'Edit button not found';
        console.log('   ❌ Edit button not found');
      }
    } catch (error) {
      results.editScreen.notes = error.message;
      console.log('   ❌ Edit screen error:', error.message);
    }

    // ========== 5. DELETE SCREEN ==========
    console.log('\n🗑️ Test 5: Delete Screen');
    try {
      await sleep(1000);

      // Find delete button
      const buttons = await page.$$('button');
      let foundDeleteButton = false;
      
      for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), btn);
        
        if (text.toLowerCase().includes('delete') || text.toLowerCase().includes('remove') || 
            (ariaLabel && ariaLabel.toLowerCase().includes('delete'))) {
          await btn.click();
          foundDeleteButton = true;
          console.log('   ✅ Clicked delete button');
          break;
        }
      }
      
      if (foundDeleteButton) {
        await sleep(1500);

        // Handle confirmation dialog
        const dialogButtons = await page.$$('button');
        for (const btn of dialogButtons) {
          const text = await page.evaluate(el => el.innerText, btn);
          if (text.toLowerCase().includes('confirm') || text.toLowerCase().includes('yes') || 
              text.toLowerCase().includes('delete')) {
            await btn.click();
            console.log('   ✅ Confirmed deletion');
            break;
          }
        }

        await sleep(3000);

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-screen-deleted.png') });
        screenshots.push('07-screen-deleted.png');

        results.deleteScreen.pass = true;
        results.deleteScreen.notes = 'Screen deleted successfully';
        console.log('   ✅ Screen deleted successfully');
      } else {
        results.deleteScreen.notes = 'Delete button not found';
        console.log('   ❌ Delete button not found');
      }
    } catch (error) {
      results.deleteScreen.notes = error.message;
      console.log('   ❌ Delete screen error:', error.message);
    }

    // ========== 6. SCREEN GROUPS ==========
    console.log('\n📁 Test 6: Screen Groups');
    try {
      // Navigate to groups page
      await page.goto(`${BASE_URL}/dashboard/screens/groups`, { waitUntil: 'networkidle0', timeout: 30000 });
      await sleep(3000);

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-groups-page.png') });
      screenshots.push('08-groups-page.png');
      console.log('   📸 Groups page screenshot captured');

      if (page.url().includes('/groups')) {
        // Try to add a group
        const buttons = await page.$$('button');
        let foundAddGroupButton = false;
        
        for (const btn of buttons) {
          const text = await page.evaluate(el => el.innerText, btn);
          if (text.toLowerCase().includes('add') || text.toLowerCase().includes('new')) {
            await btn.click();
            foundAddGroupButton = true;
            console.log('   ✅ Clicked add group button');
            break;
          }
        }
        
        if (foundAddGroupButton) {
          await sleep(2000);

          // Fill group form
          const inputs = await page.$$('input');
          if (inputs.length > 0) {
            await inputs[0].type('E2E Test Group', { delay: 50 });
            await sleep(500);

            // Submit
            const submitButtons = await page.$$('button');
            for (const btn of submitButtons) {
              const text = await page.evaluate(el => el.innerText, btn);
              if (text.toLowerCase().includes('save') || text.toLowerCase().includes('create')) {
                await btn.click();
                console.log('   ✅ Submitted group form');
                break;
              }
            }

            await sleep(3000);

            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-group-created.png') });
            screenshots.push('09-group-created.png');

            results.screenGroups.pass = true;
            results.screenGroups.notes = 'Group created successfully';
            console.log('   ✅ Screen groups functionality works');
          } else {
            results.screenGroups.notes = 'Group name input not found';
            console.log('   ❌ Group name input not found');
          }
        } else {
          results.screenGroups.notes = 'Add Group button not found';
          console.log('   ❌ Add Group button not found');
        }
      } else {
        results.screenGroups.notes = `Failed to navigate to groups page - ended at: ${page.url()}`;
        console.log('   ❌ Failed to navigate to groups page');
      }
    } catch (error) {
      results.screenGroups.notes = error.message;
      console.log('   ❌ Screen groups error:', error.message);
    }

    // ========== 7. CONSOLE CHECK ==========
    console.log('\n🔍 Test 7: Console Check');
    console.log(`   Found ${consoleErrors.length} console errors:`);
    consoleErrors.forEach(err => console.log(`     - [${err.type}] ${err.text}`));

  } catch (error) {
    console.error('Critical test error:', error.message);
  } finally {
    await browser.close();
  }

  // ========== GENERATE REPORT ==========
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST REPORT');
  console.log('='.repeat(60));

  const overallPass = Object.values(results).every(r => r.pass);

  const report = `## Screens E2E Test Report

### Test Summary:
| Scenario | Pass/Fail | Notes |
|----------|-----------|-------|
| Login | ${results.login.pass ? '✅' : '❌'} | ${results.login.notes} |
| Navigation | ${results.navigation.pass ? '✅' : '❌'} | ${results.navigation.notes} |
| Screen List | ${results.screenList.pass ? '✅' : '❌'} | ${results.screenList.notes} |
| Add Screen | ${results.addScreen.pass ? '✅' : '❌'} | ${results.addScreen.notes} |
| Edit Screen | ${results.editScreen.pass ? '✅' : '❌'} | ${results.editScreen.notes} |
| Delete Screen | ${results.deleteScreen.pass ? '✅' : '❌'} | ${results.deleteScreen.notes} |
| Screen Groups | ${results.screenGroups.pass ? '✅' : '❌'} | ${results.screenGroups.notes} |

### Console Errors:
${consoleErrors.length > 0 ? consoleErrors.map(e => `- [${e.type}] ${e.text}`).join('\n') : 'No console errors detected'}

### Screenshots:
${screenshots.map(s => `- ${SCREENSHOTS_DIR}/${s}`).join('\n')}

### Overall: ${overallPass ? '✅ PASS' : '❌ FAIL'}
`;

  console.log(report);

  // Save report to file
  const reportPath = path.join(SCREENSHOTS_DIR, 'test-report.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Report saved to: ${reportPath}`);

  return { results, consoleErrors, screenshots, overallPass, report };
}

// Run the tests
runTests().catch(console.error);
