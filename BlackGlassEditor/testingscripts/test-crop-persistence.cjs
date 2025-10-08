const puppeteer = require('puppeteer');

async function testCropPersistence() {
  console.log('🔍 Testing Crop Area Persistence...');
  
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
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if crop handles are visible
            const cropHandles = await page.$$('rect[name*="crop-handle"]');
            console.log(`✅ Found ${cropHandles.length} crop handles`);
            
            // Check if crop rectangles are visible
            const cropRects = await page.$$('rect[stroke="#4a90e2"]');
            console.log(`✅ Found ${cropRects.length} crop rectangles`);
            
            // Check for any elements with crop-related names
            const allElements = await page.$$('*');
            let cropElements = 0;
            for (let el of allElements) {
              const name = await el.evaluate(e => e.getAttribute('name') || '');
              if (name.includes('crop')) {
                cropElements++;
                console.log(`Found crop element: ${name}`);
              }
            }
            console.log(`Total crop elements: ${cropElements}`);
            
            // Wait a bit more to see if anything appears
            console.log('⏳ Waiting 3 seconds for crop area to appear...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check again
            const cropHandles2 = await page.$$('rect[name*="crop-handle"]');
            console.log(`✅ Found ${cropHandles2.length} crop handles after wait`);
            
            const cropRects2 = await page.$$('rect[stroke="#4a90e2"]');
            console.log(`✅ Found ${cropRects2.length} crop rectangles after wait`);
          }
        }
      }
    }
    
    console.log('🎉 Crop persistence test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCropPersistence().catch(console.error);
