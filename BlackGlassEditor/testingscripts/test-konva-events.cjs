const puppeteer = require('puppeteer');

async function testKonvaEvents() {
  console.log('🔍 Testing Konva Events...');
  
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
        
        // Wait for crop controls to appear
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try to click directly on the Konva stage
        console.log('🎯 Clicking on Konva stage...');
        const canvas = await page.$('canvas');
        if (canvas) {
          const box = await canvas.boundingBox();
          if (box) {
            console.log(`Canvas position: x=${box.x}, y=${box.y}, width=${box.width}, height=${box.height}`);
            
            // Click directly on the canvas
            await page.mouse.click(box.x + 100, box.y + 100);
            console.log('✅ Clicked on canvas');
            
            // Wait for any console logs
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try dragging on the canvas
            console.log('🎯 Dragging on canvas...');
            await page.mouse.move(box.x + 100, box.y + 100);
            await page.mouse.down();
            await new Promise(resolve => setTimeout(resolve, 100));
            await page.mouse.move(box.x + 200, box.y + 150);
            await new Promise(resolve => setTimeout(resolve, 100));
            await page.mouse.up();
            console.log('✅ Dragged on canvas');
            
            // Wait for any console logs
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          console.log('❌ Canvas not found');
        }
      }
    }
    
    console.log('🎉 Konva events test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testKonvaEvents().catch(console.error);
