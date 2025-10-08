const puppeteer = require('puppeteer');

async function testCropState() {
  console.log('🔍 Testing Crop State...');
  
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
            
            // Check if the crop area is still there by looking for the debug logs
            console.log('🔍 Checking for crop overlay logs...');
            
            // Wait a bit more to see if any logs appear
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    }
    
    console.log('🎉 Crop state test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCropState().catch(console.error);
