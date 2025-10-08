const puppeteer = require('puppeteer');

async function testCropTool() {
  console.log('🚀 Testing Crop Tool...');
  
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
    console.log('📍 Navigating to editor...');
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    
    // Wait for the editor to load
    await page.waitForSelector('.canvas-container', { timeout: 10000 });
    console.log('✅ Editor loaded successfully');
    
    // Find all buttons and look for crop tool
    console.log('🔍 Looking for crop tool...');
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons total`);
    
    let cropButton = null;
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.evaluate(el => el.textContent || el.title || '');
      const ariaLabel = await button.evaluate(el => el.getAttribute('aria-label') || '');
      
      console.log(`Button ${i}: text="${text}", aria-label="${ariaLabel}"`);
      
      if (text.toLowerCase().includes('crop') || ariaLabel.toLowerCase().includes('crop')) {
        cropButton = button;
        console.log(`✅ Found crop tool at button ${i}`);
        break;
      }
    }
    
    if (cropButton) {
      await cropButton.click();
      console.log('✅ Crop tool clicked');
      
      // Wait for crop controls to appear
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check for aspect ratio controls
      const allButtonsAfter = await page.$$('button');
      let foundAspectControls = false;
      
      for (let button of allButtonsAfter) {
        const text = await button.evaluate(el => el.textContent);
        if (text && (text.includes('Free') || text.includes('1:1') || text.includes('4:3') || text.includes('16:9'))) {
          foundAspectControls = true;
          console.log(`Found aspect control: ${text}`);
        }
      }
      
      if (foundAspectControls) {
        console.log('✅ Aspect ratio controls found after selecting crop tool');
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
      console.log('❌ Crop tool not found');
    }
    
    console.log('🎉 Crop tool test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCropTool().catch(console.error);
