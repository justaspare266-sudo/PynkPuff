const puppeteer = require('puppeteer');

async function testConsoleErrors() {
  console.log('🔍 Testing Console Errors...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Capture all console messages
  page.on('console', msg => {
    console.log(`📝 Console [${msg.type()}]:`, msg.text());
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });
  
  // Capture network errors
  page.on('requestfailed', request => {
    console.error('❌ Request Failed:', request.url(), request.failure().errorText);
  });
  
  try {
    // Navigate to the editor
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    console.log('✅ Page loaded');
    
    // Wait a bit for any errors to appear
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if the page has any content
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('📄 Body content length:', bodyText.length);
    
    // Check for React root
    const reactRoot = await page.$('#root');
    if (reactRoot) {
      console.log('✅ React root found');
      const rootContent = await reactRoot.evaluate(el => el.innerHTML);
      console.log('📄 Root content length:', rootContent.length);
    } else {
      console.log('❌ React root not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testConsoleErrors().catch(console.error);
