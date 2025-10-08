const puppeteer = require('puppeteer');

async function testCropButton4() {
  console.log('🎯 Testing Crop Button (Index 4)...');
  
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
      console.log('✅ Left toolbar found');
      
      // Get all buttons in the left toolbar
      const buttons = await leftToolbar.$$('button');
      console.log(`Found ${buttons.length} buttons in left toolbar`);
      
      // Click button 4 (crop tool)
      if (buttons.length > 4) {
        console.log('🖱️ Clicking button 4 (crop tool)...');
        await buttons[4].click();
        console.log('✅ Button 4 clicked');
        
        // Wait for crop controls to appear
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for aspect ratio controls
        const allButtons = await page.$$('button');
        let foundAspectControls = false;
        
        for (let btn of allButtons) {
          const btnText = await btn.evaluate(el => el.textContent);
          if (btnText && (btnText.includes('Free') || btnText.includes('1:1') || btnText.includes('4:3') || btnText.includes('16:9'))) {
            foundAspectControls = true;
            console.log(`✅ Found aspect control: ${btnText}`);
          }
        }
        
        if (foundAspectControls) {
          console.log('🎉 SUCCESS: Aspect ratio controls found after clicking crop tool!');
        } else {
          console.log('❌ Aspect ratio controls not found');
        }
        
        // Try to create a crop area
        console.log('🎯 Creating crop area...');
        const canvas = await page.$('.canvas-container');
        if (canvas) {
          const box = await canvas.boundingBox();
          if (box) {
            // Click and drag to create crop area
            await page.mouse.move(box.x + 100, box.y + 100);
            await page.mouse.down();
            await page.mouse.move(box.x + 200, box.y + 150);
            await page.mouse.up();
            console.log('✅ Crop area created');
            
            // Wait for crop handles to appear
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if crop handles are visible
            const cropHandles = await page.$$('rect[name*="crop-handle"]');
            console.log(`✅ Found ${cropHandles.length} crop handles`);
          }
        }
        
      } else {
        console.log('❌ Not enough buttons in left toolbar');
      }
    }
    
    console.log('🎉 Crop button 4 test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCropButton4().catch(console.error);
