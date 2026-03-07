# PHASE 4 QA Test Failed

Error: Protocol error (Page.captureScreenshot): Not attached to an active page

Stack: ProtocolError: Protocol error (Page.captureScreenshot): Not attached to an active page
    at <instance_members_initializer> (/home/sysop/.openclaw/workspace/node_modules/puppeteer-core/lib/cjs/puppeteer/common/CallbackRegistry.js:103:14)
    at new Callback (/home/sysop/.openclaw/workspace/node_modules/puppeteer-core/lib/cjs/puppeteer/common/CallbackRegistry.js:107:16)
    at CallbackRegistry.create (/home/sysop/.openclaw/workspace/node_modules/puppeteer-core/lib/cjs/puppeteer/common/CallbackRegistry.js:25:26)
    at Connection._rawSend (/home/sysop/.openclaw/workspace/node_modules/puppeteer-core/lib/cjs/puppeteer/cdp/Connection.js:108:26)
    at CdpCDPSession.send (/home/sysop/.openclaw/workspace/node_modules/puppeteer-core/lib/cjs/puppeteer/cdp/CdpSession.js:74:33)
    at CdpPage._screenshot (/home/sysop/.openclaw/workspace/node_modules/puppeteer-core/lib/cjs/puppeteer/cdp/Page.js:839:62)
    at CdpPage.screenshot (/home/sysop/.openclaw/workspace/node_modules/puppeteer-core/lib/cjs/puppeteer/api/Page.js:1083:41)
    at async CdpPage.<anonymous> (/home/sysop/.openclaw/workspace/node_modules/puppeteer-core/lib/cjs/puppeteer/util/decorators.js:172:24)
    at async takeScreenshot (/home/sysop/.openclaw/workspace/qa-phase4-comprehensive-test.js:33:3)
    at async testLogin (/home/sysop/.openclaw/workspace/qa-phase4-comprehensive-test.js:119:5)