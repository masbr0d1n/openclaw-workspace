/**
 * Puppeteer Test for Playlists API
 * Test playlists functionality via browser
 */

const { chromium } = require('puppeteer');
const http = require('http');

const API_BASE = 'http://192.168.8.117:8001';

// Helper function to make API requests
function apiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '192.168.8.117',
      port: 8001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testPlaylistsAPI() {
  console.log('🧪 Testing Playlists API...\n');

  try {
    // Test 1: Get all playlists
    console.log('Test 1: GET /api/v1/playlists/');
    const res1 = await apiRequest('GET', '/api/v1/playlists/');
    console.log(`  Status: ${res1.status}`);
    console.log(`  Response: ${JSON.stringify(res1.data).substring(0, 100)}...`);
    console.log(res1.status === 200 ? '  ✅ PASS\n' : '  ❌ FAIL\n');

    // Test 2: Create draft
    console.log('Test 2: POST /api/v1/playlists/draft');
    const draftData = {
      name: 'Puppeteer Test Draft',
      description: 'Created via Puppeteer test',
      default_duration: 10,
      transition: 'fade',
      loop: true,
    };
    const res2 = await apiRequest('POST', '/api/v1/playlists/draft', draftData);
    console.log(`  Status: ${res2.status}`);
    if (res2.status === 201 && res2.data.id) {
      console.log(`  Created playlist ID: ${res2.data.id}`);
      console.log('  ✅ PASS\n');
      const playlistId = res2.data.id;

      // Test 3: Add item to playlist
      console.log('Test 3: POST /api/v1/playlists/{id}/items');
      const itemData = {
        media_id: 'test-media-123',
        duration: 15,
      };
      const res3 = await apiRequest('POST', `/api/v1/playlists/${playlistId}/items`, itemData);
      console.log(`  Status: ${res3.status}`);
      console.log(res3.status === 201 ? '  ✅ PASS\n' : '  ❌ FAIL (may fail if media_id not exists)\n');

      // Test 4: Get playlist with items
      console.log('Test 4: GET /api/v1/playlists/{id}');
      const res4 = await apiRequest('GET', `/api/v1/playlists/${playlistId}`);
      console.log(`  Status: ${res4.status}`);
      console.log(`  Items count: ${res4.data.items?.length || 0}`);
      console.log(res4.status === 200 ? '  ✅ PASS\n' : '  ❌ FAIL\n');

      // Test 5: Reorder items (even if empty)
      console.log('Test 5: POST /api/v1/playlists/{id}/items/reorder');
      const res5 = await apiRequest('POST', `/api/v1/playlists/${playlistId}/items/reorder`, {});
      console.log(`  Status: ${res5.status}`);
      console.log(res5.status === 200 ? '  ✅ PASS\n' : '  ❌ FAIL\n');

      // Test 6: Delete playlist
      console.log('Test 6: DELETE /api/v1/playlists/{id}');
      const res6 = await apiRequest('DELETE', `/api/v1/playlists/${playlistId}`);
      console.log(`  Status: ${res6.status}`);
      console.log(res6.status === 204 ? '  ✅ PASS\n' : '  ❌ FAIL\n');
    } else {
      console.log('  ❌ FAIL - Cannot continue tests\n');
    }

    console.log('✅ All API tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testFrontendIntegration() {
  console.log('\n🌐 Testing Frontend Integration...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Navigate to frontend
    console.log('Navigating to frontend...');
    await page.goto('http://192.168.8.117:3000/dashboard/content', {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    console.log('✅ Page loaded');

    // Check if Playlists tab exists
    console.log('\nChecking Playlists tab...');
    const playlistsTab = await page.$('text=Playlists');
    if (playlistsTab) {
      console.log('✅ Playlists tab found');

      // Click on Playlists tab
      console.log('Clicking Playlists tab...');
      await playlistsTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ Playlists tab clicked');

      // Check for Create Playlist button
      console.log('\nChecking Create Playlist button...');
      const createButton = await page.$('text=Create Playlist');
      if (createButton) {
        console.log('✅ Create Playlist button found');
      } else {
        console.log('⚠️ Create Playlist button not found (may need implementation)');
      }

      // Take screenshot
      await page.screenshot({
        path: '/home/sysop/.openclaw/workspace/playlists-tab-screenshot.png',
        fullPage: true,
      });
      console.log('\n📸 Screenshot saved: playlists-tab-screenshot.png');
    } else {
      console.log('❌ Playlists tab not found');
    }
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 Playlists API & Frontend Test\n');
  console.log('='.repeat(50) + '\n');

  await testPlaylistsAPI();
  await testFrontendIntegration();

  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!\n');
}

main().catch(console.error);
