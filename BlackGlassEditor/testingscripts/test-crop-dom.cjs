const puppeteer = require('puppeteer');

async function testCropDOM() {
  console.log('🔍 Testing Crop DOM Elements...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log('📝 Browser:', msg.text());
    }
  });
  
  try {
    // Navigate to the editor
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    
    // Wait for the editor to load
    await page.waitForSelector('.canvas-container', { timeout: 10000 });
    console.log('✅ Editor loaded successfully');
    
    // Find the left toolbar
    const leftToolbar = await page.$('.w-12.flex.flex-col.py-2.bg-black\\/80.backdrop-blur-md.border-r.border-white\\/10');
    if (leftToolbar) {
      // Click button 4 (crop tool)
      const buttons = await leftToolbar.$$('button');
      if (buttons.length > 4) {
        console.log('🖱️ Clicking button 4 (crop tool)...');
        await buttons[4].click();
        console.log('✅ Button 4 clicked');
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try dragging on the canvas
        const canvas = await page.$('canvas');
        if (canvas) {
          const box = await canvas.boundingBox();
          if (box) {
            console.log('🎯 Creating crop area...');
            await page.mouse.move(box.x + 100, box.y + 100);
            await page.mouse.down();
            await new Promise(resolve => setTimeout(resolve, 100));
            await page.mouse.move(box.x + 200, box.y + 150);
            await new Promise(resolve => setTimeout(resolve, 100));
            await page.mouse.up();
            console.log('✅ Crop area created');
            
            // Wait for crop area to be finalized
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check for all rectangles and their attributes
            const allElements = await page.$$('*');
            let rectCount = 0;
            let cropRectCount = 0;
            
            for (let el of allElements) {
              const tagName = await el.evaluate(e => e.tagName);
              if (tagName === 'rect') {
                rectCount++;
                const attributes = await el.evaluate(e => {
                  const attrs = {};
                  for (let attr of e.attributes) {
                    attrs[attr.name] = attr.value;
                  }
                  return attrs;
                });
                
                // Check if this looks like a crop rectangle
                if (attributes.stroke === '#4a90e2' || attributes.fill === 'rgba(0, 0, 0, 0.5)') {
                  cropRectCount++;
                  console.log(`Crop rect ${cropRectCount}:`, attributes);
                } else {
                  console.log(`Rect ${rectCount}:`, attributes);
                }
              }
            }
            
            console.log(`Total rectangles found: ${rectCount}`);
            console.log(`Crop rectangles found: ${cropRectCount}`);
            
            // Take a screenshot to see what's actually rendered
            await page.screenshot({ path: 'crop-dom-test.png', fullPage: true });
            console.log('📸 Screenshot saved as crop-dom-test.png');
          }
        }
      }
    }
    
    console.log('🎉 Crop DOM test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCropDOM().catch(console.error);
