const puppeteer = require('puppeteer');

async function debugPageStructure() {
  console.log('🔍 Debugging Page Structure...');
  
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
    
    // Get the main content area
    const mainContent = await page.$('.flex-1.flex.overflow-hidden, [class*="flex-1"], [class*="flex"]');
    if (mainContent) {
      const html = await mainContent.evaluate(el => el.outerHTML);
      console.log('📋 Main Content HTML:');
      console.log(html.substring(0, 2000) + '...');
      
      // Look for any divs that might be the left toolbar
      const divs = await mainContent.$$('div');
      console.log(`\n🔢 Found ${divs.length} divs in main content`);
      
      for (let i = 0; i < Math.min(divs.length, 10); i++) {
        const div = divs[i];
        const className = await div.evaluate(el => el.className || '');
        const text = await div.evaluate(el => el.textContent?.substring(0, 50) || '');
        
        if (className.includes('w-12') || className.includes('toolbar') || className.includes('flex-col')) {
          console.log(`Div ${i}: class="${className}", text="${text}"`);
        }
      }
    } else {
      console.log('❌ Main content not found');
    }
    
    // Get the full page HTML to see the structure
    const body = await page.$('body');
    if (body) {
      const html = await body.evaluate(el => el.innerHTML);
      console.log('\n📋 Full Page HTML (first 3000 chars):');
      console.log(html.substring(0, 3000) + '...');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugPageStructure().catch(console.error);
