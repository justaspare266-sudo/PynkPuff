const puppeteer = require('puppeteer');

async function testCropManually() {
  console.log('🎯 Manual Crop Tool Test...');
  
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
    
    // Take a screenshot to see what's actually rendered
    await page.screenshot({ path: 'editor-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as editor-screenshot.png');
    
    // Look for any elements that might contain the crop tool
    const allElements = await page.$$('*');
    console.log(`Found ${allElements.length} total elements`);
    
    // Look for elements with "crop" in their text or attributes
    let foundCropElements = 0;
    for (let element of allElements) {
      const text = await element.evaluate(el => el.textContent || '');
      const title = await element.evaluate(el => el.title || '');
      const className = await element.evaluate(el => el.className || '');
      
      if (text.toLowerCase().includes('crop') || 
          title.toLowerCase().includes('crop') || 
          (typeof className === 'string' && className.toLowerCase().includes('crop'))) {
        foundCropElements++;
        console.log(`Found crop element: text="${text}", title="${title}", class="${className}"`);
      }
    }
    
    console.log(`Found ${foundCropElements} elements containing "crop"`);
    
    // Check if the main content area has the expected structure
    const mainContent = await page.$('.flex-1.flex.overflow-hidden');
    if (mainContent) {
      const children = await mainContent.$$('*');
      console.log(`Main content has ${children.length} child elements`);
      
      for (let i = 0; i < Math.min(children.length, 5); i++) {
        const child = children[i];
        const tagName = await child.evaluate(el => el.tagName);
        const className = await child.evaluate(el => el.className);
        console.log(`Child ${i}: ${tagName} with class "${className}"`);
      }
    }
    
    console.log('🎉 Manual test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCropManually().catch(console.error);
