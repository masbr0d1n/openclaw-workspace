# Standard Operating Procedure (SOP) - Task Completion with Puppeteer Testing

## Overview

**Before marking any task as complete, ALWAYS test with Puppeteer and verify functionality.**

This SOP ensures quality and prevents bugs from reaching production.

---

## When to Use Puppeteer Testing

### Mandatory Testing (ALWAYS)

1. **UI Changes** - New components, forms, dialogs
2. **User Flows** - Login, upload, CRUD operations
3. **Navigation** - Page routing, redirects
4. **Forms** - Submit, validation, error handling
5. **API Integration** - Frontend ↔ Backend communication
6. **Authentication** - Login, logout, session management

### Optional Testing

1. **Backend-only changes** - Database queries, API endpoints (test with curl instead)
2. **Styling changes** - CSS, Tailwind classes (visual inspection OK)
3. **Documentation** - README, comments (no testing needed)

---

## Standard Operating Procedure

### Phase 1: Pre-Test Checklist

Before writing Puppeteer test, verify:

- [ ] Frontend code changes committed
- [ ] Backend code changes committed
- [ ] Containers rebuilt and deployed
- [ ] Database migrations applied
- [ ] Login credentials confirmed
- [ ] Test data prepared (if needed)

### Phase 2: Write Puppeteer Test

**Template: `tests/puppeteer/test-[feature].js`**

```javascript
const { chromium } = require('playwright');

async function testFeature() {
  console.log('=== [Feature Name] Test ===\n');
  
  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    slowMo: 500 // Slow down actions
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. Login
    console.log('1. Logging in...');
    await page.goto('http://192.168.8.117:3000/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/**');
    console.log('✓ Login successful\n');
    
    // 2. Navigate to feature
    console.log('2. Navigating to feature...');
    await page.goto('http://192.168.8.117:3000/dashboard/feature');
    console.log('✓ Page loaded\n');
    
    // 3. Verify elements
    console.log('3. Verifying elements...');
    const element = await page.$('css-selector');
    if (!element) {
      throw new Error('Element not found!');
    }
    console.log('✓ Element found\n');
    
    // 4. Test functionality
    console.log('4. Testing functionality...');
    await page.click('button');
    await page.waitForSelector('result');
    console.log('✓ Functionality works\n');
    
    console.log('=== Test PASSED ===\n');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    throw error;
    
  } finally {
    await page.screenshot({ path: '/tmp/test-failure.png', fullPage: true });
    await context.close();
    await browser.close();
  }
}

testFeature();
```

### Phase 3: Run Puppeteer Test

**From project directory:**

```bash
cd /home/sysop/.openclaw/workspace/streamhub-nextjs

# Run test
node tests/puppeteer/test-[feature].js

# With verbose output
node tests/puppeteer/test-[feature].js 2>&1 | tee test-output.log
```

**Expected output:**
```
=== [Feature Name] Test ===

1. Logging in...
✓ Login successful

2. Navigating to feature...
✓ Page loaded

3. Verifying elements...
✓ Element found

4. Testing functionality...
✓ Functionality works

=== Test PASSED ===
```

### Phase 4: Verify Results

**Check test output:**

1. ✅ All steps passed
2. ✅ No errors or exceptions
3. ✅ Screenshots only on failure
4. ✅ Clear success/failure indicators

**If test PASSES:**
- Mark task as complete
- Commit Puppeteer test to repo
- Update memory file

**If test FAILS:**
- Review screenshot in `/tmp/test-failure.png`
- Fix the issue
- Re-run test
- Don't mark as complete until test passes

### Phase 5: Documentation

**Update memory file:**

```markdown
# Daily Memory - YYYY-MM-DD - [Feature Name]

## Puppeteer Test Results

### Test File
- Path: `tests/puppeteer/test-[feature].js`
- Status: ✅ PASSED

### Test Coverage
1. Login flow
2. Navigation to [feature]
3. Element verification
4. Functionality testing
5. Error handling

### Screenshots
- Success: N/A (no errors)
- Failure: /tmp/test-failure.png (only if failed)

### Results
✅ All tests passed
✅ Feature working as expected
✅ Ready for production
```

---

## Puppeteer Test Guidelines

### Best Practices

1. **Use `slowMo: 500`** - See what's happening
2. **Use `headless: false`** - Debug easier
3. **Wait for selectors** - Use `waitForSelector` or `waitForURL`
4. **Sleep between steps** - `await sleep(500)` for UI stability
5. **Throw descriptive errors** - "Element X not found at step Y"
6. **Screenshot on failure** - Always in `finally` block
7. **Console logs** - Clear step indicators (1, 2, 3...)

### Selectors to Test

**Always verify:**
- Buttons: `button:has-text("Text")`
- Inputs: `input[name="field"]` or `#id`
- Labels: `label:has-text("Label")`
- Dialogs: `[role="dialog"]`
- Tables: `table` or `.table`
- Forms: `form` or form fields

**Never use:**
- XPath (brittle)
- Index-based selectors (`button:nth-child(2)`)
- Dynamic classes (`.css-12345`)

### Test Structure

**Good test:**
```javascript
// 1. Setup (browser, page)
// 2. Login (credentials, submit)
// 3. Navigate (goto, wait)
// 4. Verify (element exists)
// 5. Action (click, fill)
// 6. Result (wait for outcome)
// 7. Cleanup (screenshot, close)
```

**Bad test:**
```javascript
// All in one try block
// No step logging
// No error handling
// No screenshots
// Hardcoded values
```

---

## Common Test Scenarios

### 1. Form Submission

```javascript
// Fill form
await page.fill('#title', 'Test Title');
await page.fill('#description', 'Test Description');

// Submit
await page.click('button[type="submit"]');

// Wait for result
await page.waitForSelector('text=Success');
```

### 2. Navigation

```javascript
// Click link
await page.click('a:has-text("Dashboard")');

// Wait for URL
await page.waitForURL('**/dashboard/**');

// Verify element
await page.waitForSelector('h1:has-text("Dashboard")');
```

### 3. Dialog/Modal

```javascript
// Open dialog
await page.click('button:has-text("Open")');

// Wait for dialog
await page.waitForSelector('[role="dialog"]');

// Verify content
const title = await page.$('[role="dialog"] h2');
const titleText = await title.textContent();
console.log('Dialog title:', titleText);

// Close dialog
await page.click('button[aria-label="Close"]');
```

### 4. File Upload

```javascript
// Select file
const fileInput = await page.$('input[type="file"]');
await fileInput.setInputFiles('/path/to/file.mp4');

// Wait for file info
await page.waitForSelector('text=/Selected:/');

// Submit
await page.click('button:has-text("Upload")');
```

### 5. Error Handling

```javascript
// Verify error message
await page.click('button:has-text("Submit")');

// Wait for error
await page.waitForSelector('text=Error message');

// Verify error styling
const errorBox = await page.$('.error-message');
if (!errorBox) {
  throw new Error('Error message not displayed!');
}
```

---

## Pre-Task Checklist (Before Starting Work)

Before implementing any feature, verify:

- [ ] Requirements understood
- [ ] UI/UX design reviewed
- [ ] Backend API confirmed
- [ ] Database schema ready
- [ ] Test cases planned
- [ ] Puppeteer test template prepared

---

## Post-Task Checklist (Before Marking Complete)

Before marking task as complete, verify:

- [ ] Code written and committed
- [ ] Containers rebuilt and deployed
- [ ] Puppeteer test written
- [ ] Puppeteer test **PASSED**
- [ ] Screenshots reviewed (if failed)
- [ ] Documentation updated
- [ ] Memory file updated
- [ ] Git commit pushed

---

## Quick Reference

### Run Puppeteer Test

```bash
cd /home/sysop/.openclaw/workspace/streamhub-nextjs
node tests/puppeteer/test-[feature].js
```

### Check Screenshot

```bash
# View failure screenshot
display /tmp/test-failure.png

# Or open in file manager
nautilus /tmp/test-failure.png
```

### Common Issues

**Timeout:**
- Increase wait time: `await page.waitForSelector('selector', { timeout: 10000 })`

**Element not found:**
- Check selector: `await page.$('selector')`
- Wait for element: `await page.waitForSelector('selector')`

**Flaky tests:**
- Add more sleeps: `await sleep(1000)`
- Use headless: false for debugging

---

## Files

- This SOP: `STANDARD_OPERATING_PROCEDURE.md`
- Puppeteer tests: `tests/puppeteer/test-*.js`
- Memory files: `memory/YYYY-MM-DD-*.md`

---

## Remember

**"If it's not tested, it's not done!"**

Before marking any task complete:
1. ✅ Write Puppeteer test
2. ✅ Run Puppeteer test
3. ✅ Verify test PASSES
4. ✅ Then mark as complete

**This is MANDATORY for all UI-related tasks!** 🔴

---

**Follow this SOP for consistent, high-quality deliverables!** ✅
