const puppeteer = require('puppeteer');

async function debugConsoleErrors() {
  console.log('🔍 Debugging Console Errors...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Capture all console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      console.log('❌ ERROR:', text);
    } else if (type === 'warn') {
      console.log('⚠️ WARN:', text);
    } else if (type === 'log') {
      console.log('📝 LOG:', text);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log('💥 PAGE ERROR:', error.message);
  });
  
  try {
    // Navigate to the editor
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    
    // Wait for the editor to load
    await page.waitForSelector('.canvas-container', { timeout: 10000 });
    console.log('✅ Editor loaded successfully');
    
    // Wait a bit more to see if any errors appear
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🎉 Console debugging completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugConsoleErrors().catch(console.error);
