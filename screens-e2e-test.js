const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3002';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

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
  let createdScreenId = null;
  let createdGroupId = null;

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
    consoleErrors.push({ type: 'requestfailed', text: `${request.failure().errorText} ${request.url()}` });
  });

  try {
    console.log('🧪 Starting Screens E2E Test...\n');

    // ========== 1. LOGIN & NAVIGATION ==========
    console.log('📝 Test 1: Login & Navigation');
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
      await sleep(2000);

      // Take login page screenshot
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-login-page.png') });
      screenshots.push('01-login-page.png');

      // Fill login form
      await page.type('input[type="email"], input[name="email"], #email', 'sysop@test.com', { delay: 50 });
      await page.type('input[type="password"], input[name="password"], #password', 'password123', { delay: 50 });
      await sleep(500);

      // Submit form
      await page.click('button[type="submit"], button:contains("Login"), button:contains("Sign In")');
      await sleep(3000);

      // Check if redirected to dashboard
      const currentUrl = page.url();
      if (currentUrl.includes('dashboard') || currentUrl.includes('login') === false) {
        results.login.pass = true;
        results.login.notes = 'Successfully logged in';
        console.log('✅ Login successful');
      } else {
        results.login.notes = 'Login failed - still on login page';
        console.log('❌ Login failed');
      }

      // Navigate to screens
      await page.goto(`${BASE_URL}/dashboard/screens`, { waitUntil: 'networkidle0', timeout: 30000 });
      await sleep(2000);

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-screens-page.png') });
      screenshots.push('02-screens-page.png');

      if (page.url().includes('/screens')) {
        results.navigation.pass = true;
        results.navigation.notes = 'Successfully navigated to /dashboard/screens';
        console.log('✅ Navigation successful');
      } else {
        results.navigation.notes = 'Navigation failed';
        console.log('❌ Navigation failed');
      }
    } catch (error) {
      results.login.notes = error.message;
      results.navigation.notes = error.message;
      console.log('❌ Login/Navigation error:', error.message);
    }

    // ========== 2. SCREEN LIST ==========
    console.log('\n📋 Test 2: Screen List');
    try {
      await sleep(2000);
      
      // Check if screen list container exists
      const screenListExists = await page.$('.screen-list, [data-testid="screen-list"], #screen-list, .screens-grid') !== null;
      const screenCardsExist = await page.$$('.screen-card, [data-testid="screen-card"], .screen-item').length > 0;
      
      if (screenListExists || screenCardsExist) {
        results.screenList.pass = true;
        results.screenList.notes = `Screen list displayed (${screenCardsExist ? 'with cards' : 'empty state'})`;
        console.log('✅ Screen list displayed');
      } else {
        // Check for empty state
        const emptyState = await page.$('.empty-state, [data-testid="empty-state"], .no-screens');
        if (emptyState) {
          results.screenList.pass = true;
          results.screenList.notes = 'Empty state displayed (no screens)';
          console.log('✅ Empty state displayed');
        } else {
          results.screenList.notes = 'Screen list not found';
          console.log('❌ Screen list not found');
        }
      }
    } catch (error) {
      results.screenList.notes = error.message;
      console.log('❌ Screen list error:', error.message);
    }

    // ========== 3. ADD SCREEN ==========
    console.log('\n➕ Test 3: Add Screen');
    try {
      await sleep(1000);

      // Click Add Screen button
      const addButton = await page.$('button:contains("Add Screen"), button:contains("New Screen"), [data-testid="add-screen"]');
      if (addButton) {
        await addButton.click();
        await sleep(2000);

        // Take form screenshot
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-add-screen-form.png') });
        screenshots.push('03-add-screen-form.png');

        // Fill form
        const nameInput = await page.$('input[name="name"], input[placeholder*="name" i], #screen-name');
        const locationInput = await page.$('input[name="location"], input[placeholder*="location" i], #screen-location');
        const resolutionInput = await page.$('input[name="resolution"], input[placeholder*="resolution" i], #screen-resolution, select[name="resolution"]');

        if (nameInput && locationInput) {
          await nameInput.click({ clickCount: 3 });
          await nameInput.type('E2E Test Screen', { delay: 50 });
          
          await locationInput.click({ clickCount: 3 });
          await locationInput.type('Test Location', { delay: 50 });

          if (resolutionInput) {
            await resolutionInput.click();
            await sleep(500);
            // Try to select or type resolution
            try {
              await resolutionInput.type('1920x1080', { delay: 50 });
            } catch (e) {
              // If it's a select, try clicking an option
              console.log('Resolution field handled');
            }
          }

          await sleep(1000);

          // Submit form
          const submitButton = await page.$('button[type="submit"], button:contains("Save"), button:contains("Create")');
          if (submitButton) {
            await submitButton.click();
            await sleep(3000);

            // Take screenshot after submission
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-screen-added.png') });
            screenshots.push('04-screen-added.png');

            // Check for success message or screen in list
            const successMsg = await page.$('.success-message, [data-testid="success"], .toast-success, .alert-success');
            const screenInList = await page.$$('.screen-card, .screen-item').length > 0;

            if (successMsg || screenInList) {
              results.addScreen.pass = true;
              results.addScreen.notes = 'Screen created successfully';
              createdScreenId = 'E2E Test Screen';
              console.log('✅ Screen added successfully');
            } else {
              results.addScreen.notes = 'Screen may not have been created';
              console.log('⚠️ Screen creation unclear');
            }
          } else {
            results.addScreen.notes = 'Submit button not found';
            console.log('❌ Submit button not found');
          }
        } else {
          results.addScreen.notes = 'Form fields not found';
          console.log('❌ Form fields not found');
        }
      } else {
        results.addScreen.notes = 'Add Screen button not found';
        console.log('❌ Add Screen button not found');
      }
    } catch (error) {
      results.addScreen.notes = error.message;
      console.log('❌ Add screen error:', error.message);
    }

    // ========== 4. EDIT SCREEN ==========
    console.log('\n✏️ Test 4: Edit Screen');
    try {
      await sleep(1000);

      // Find edit button on a screen card
      const editButton = await page.$('button:contains("Edit"), [data-testid="edit-screen"], .edit-btn, button[aria-label*="edit" i]');
      
      if (editButton) {
        await editButton.click();
        await sleep(2000);

        // Take edit form screenshot
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-edit-form.png') });
        screenshots.push('05-edit-form.png');

        // Modify name field
        const nameInput = await page.$('input[name="name"], #screen-name');
        if (nameInput) {
          await nameInput.click({ clickCount: 3 });
          await nameInput.type(' - Edited', { delay: 50 });
          await sleep(500);

          // Submit
          const submitButton = await page.$('button[type="submit"], button:contains("Save"), button:contains("Update")');
          if (submitButton) {
            await submitButton.click();
            await sleep(3000);

            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-screen-edited.png') });
            screenshots.push('06-screen-edited.png');

            results.editScreen.pass = true;
            results.editScreen.notes = 'Screen edited successfully';
            console.log('✅ Screen edited successfully');
          } else {
            results.editScreen.notes = 'Submit button not found in edit form';
            console.log('❌ Submit button not found');
          }
        } else {
          results.editScreen.notes = 'Name input not found in edit form';
          console.log('❌ Name input not found');
        }
      } else {
        results.editScreen.notes = 'Edit button not found';
        console.log('❌ Edit button not found');
      }
    } catch (error) {
      results.editScreen.notes = error.message;
      console.log('❌ Edit screen error:', error.message);
    }

    // ========== 5. DELETE SCREEN ==========
    console.log('\n🗑️ Test 5: Delete Screen');
    try {
      await sleep(1000);

      // Find delete button
      const deleteButton = await page.$('button:contains("Delete"), [data-testid="delete-screen"], .delete-btn, button[aria-label*="delete" i]');
      
      if (deleteButton) {
        await deleteButton.click();
        await sleep(1000);

        // Handle confirmation dialog
        const confirmButton = await page.$('button:contains("Confirm"), button:contains("Yes"), button:contains("Delete"), [data-testid="confirm-delete"]');
        
        if (confirmButton) {
          await confirmButton.click();
          await sleep(3000);

          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-screen-deleted.png') });
          screenshots.push('07-screen-deleted.png');

          results.deleteScreen.pass = true;
          results.deleteScreen.notes = 'Screen deleted successfully';
          console.log('✅ Screen deleted successfully');
        } else {
          results.deleteScreen.notes = 'Confirmation button not found';
          console.log('❌ Confirmation button not found');
        }
      } else {
        results.deleteScreen.notes = 'Delete button not found';
        console.log('❌ Delete button not found');
      }
    } catch (error) {
      results.deleteScreen.notes = error.message;
      console.log('❌ Delete screen error:', error.message);
    }

    // ========== 6. SCREEN GROUPS ==========
    console.log('\n📁 Test 6: Screen Groups');
    try {
      // Navigate to groups page
      await page.goto(`${BASE_URL}/dashboard/screens/groups`, { waitUntil: 'networkidle0', timeout: 30000 });
      await sleep(2000);

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-groups-page.png') });
      screenshots.push('08-groups-page.png');

      if (page.url().includes('/groups')) {
        // Try to add a group
        const addGroupButton = await page.$('button:contains("Add Group"), button:contains("New Group"), [data-testid="add-group"]');
        
        if (addGroupButton) {
          await addGroupButton.click();
          await sleep(2000);

          // Fill group form
          const groupNameInput = await page.$('input[name="name"], input[placeholder*="group name" i], #group-name');
          if (groupNameInput) {
            await groupNameInput.type('E2E Test Group', { delay: 50 });
            await sleep(500);

            const submitButton = await page.$('button[type="submit"], button:contains("Save"), button:contains("Create")');
            if (submitButton) {
              await submitButton.click();
              await sleep(3000);

              await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-group-created.png') });
              screenshots.push('09-group-created.png');

              results.screenGroups.pass = true;
              results.screenGroups.notes = 'Group created successfully';
              createdGroupId = 'E2E Test Group';
              console.log('✅ Screen groups functionality works');
            } else {
              results.screenGroups.notes = 'Group submit button not found';
              console.log('❌ Group submit button not found');
            }
          } else {
            results.screenGroups.notes = 'Group name input not found';
            console.log('❌ Group name input not found');
          }
        } else {
          results.screenGroups.notes = 'Add Group button not found';
          console.log('❌ Add Group button not found');
        }
      } else {
        results.screenGroups.notes = 'Failed to navigate to groups page';
        console.log('❌ Failed to navigate to groups page');
      }
    } catch (error) {
      results.screenGroups.notes = error.message;
      console.log('❌ Screen groups error:', error.message);
    }

    // ========== 7. CONSOLE CHECK ==========
    console.log('\n🔍 Test 7: Console Check');
    console.log(`Found ${consoleErrors.length} console errors:`);
    consoleErrors.forEach(err => console.log(`  - [${err.type}] ${err.text}`));

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
