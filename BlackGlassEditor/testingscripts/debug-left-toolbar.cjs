const puppeteer = require('puppeteer');

async function debugLeftToolbar() {
  console.log('🔍 Debugging Left Toolbar...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the editor
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    
    // Wait for the editor to load
    await page.waitForSelector('.canvas-container', { timeout: 10000 });
    console.log('✅ Editor loaded successfully');
    
    // Get the left toolbar HTML
    const leftToolbar = await page.$('[class*="toolbar"]');
    if (leftToolbar) {
      const html = await leftToolbar.evaluate(el => el.outerHTML);
      console.log('📋 Left Toolbar HTML:');
      console.log(html);
      
      // Count buttons in left toolbar
      const buttons = await leftToolbar.$$('button');
      console.log(`\n🔢 Found ${buttons.length} buttons in left toolbar`);
      
      // List all buttons with their details
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const text = await button.evaluate(el => el.textContent || '');
        const title = await button.evaluate(el => el.title || '');
        const ariaLabel = await button.evaluate(el => el.getAttribute('aria-label') || '');
        const className = await button.evaluate(el => el.className || '');
        
        console.log(`Button ${i}:`);
        console.log(`  Text: "${text}"`);
        console.log(`  Title: "${title}"`);
        console.log(`  Aria-label: "${ariaLabel}"`);
        console.log(`  Class: "${className}"`);
        console.log('---');
      }
    } else {
      console.log('❌ Left toolbar not found');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugLeftToolbar().catch(console.error);