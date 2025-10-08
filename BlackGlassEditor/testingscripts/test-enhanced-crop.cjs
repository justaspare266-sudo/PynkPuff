const puppeteer = require('puppeteer');

async function testEnhancedCropTool() {
  console.log('🚀 Testing Enhanced Crop Tool...');
  
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
    
    // Click on crop tool
    console.log('🔧 Selecting crop tool...');
    const cropButton = await page.$('button[title*="crop"], button[title*="Crop"]');
    if (cropButton) {
      await cropButton.click();
      console.log('✅ Crop tool selected');
    } else {
      // Try to find crop tool in left toolbar
      const leftToolbar = await page.$('.left-toolbar, [class*="toolbar"]');
      if (leftToolbar) {
        const buttons = await leftToolbar.$$('button');
        console.log(`Found ${buttons.length} buttons in left toolbar`);
        
        // Look for crop icon or text
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          const text = await button.evaluate(el => el.textContent || el.title);
          if (text && text.toLowerCase().includes('crop')) {
            await button.click();
            console.log('✅ Crop tool selected from left toolbar');
            break;
          }
        }
      } else {
        console.log('❌ Crop tool button not found');
      }
    }
    
    // Wait a moment for tool selection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if crop controls are visible
    console.log('🔍 Checking for crop controls...');
    const buttons = await page.$$('button');
    let foundAspectControls = false;
    
    for (let button of buttons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && (text.includes('Free') || text.includes('1:1') || text.includes('4:3') || text.includes('16:9'))) {
        foundAspectControls = true;
        break;
      }
    }
    
    if (foundAspectControls) {
      console.log('✅ Aspect ratio controls found');
    } else {
      console.log('❌ Aspect ratio controls not found');
    }
    
    // Try to create a crop area by clicking and dragging on canvas
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
        
        // Test aspect ratio buttons
        console.log('🔄 Testing aspect ratio buttons...');
        const allButtons = await page.$$('button');
        let squareButton = null;
        
        for (let button of allButtons) {
          const text = await button.evaluate(el => el.textContent);
          if (text && text.includes('1:1')) {
            squareButton = button;
            break;
          }
        }
        
        if (squareButton) {
          console.log('✅ Aspect ratio buttons found');
          await squareButton.click();
          console.log('✅ 1:1 aspect ratio selected');
        }
        
        // Test apply crop button
        let applyButton = null;
        let cancelButton = null;
        
        for (let button of allButtons) {
          const text = await button.evaluate(el => el.textContent);
          if (text && text.includes('Apply')) {
            applyButton = button;
          } else if (text && text.includes('Cancel')) {
            cancelButton = button;
          }
        }
        
        if (applyButton) {
          console.log('✅ Apply crop button found');
        }
        
        if (cancelButton) {
          console.log('✅ Cancel crop button found');
        }
        
      } else {
        console.log('❌ Canvas bounding box not found');
      }
    } else {
      console.log('❌ Canvas container not found');
    }
    
    console.log('🎉 Enhanced crop tool test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testEnhancedCropTool().catch(console.error);
