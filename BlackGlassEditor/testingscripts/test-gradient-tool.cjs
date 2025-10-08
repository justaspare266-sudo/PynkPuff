const puppeteer = require('puppeteer');

async function testGradientTool() {
  console.log('🎨 Testing Gradient Tool...');
  
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
      // Click button 4 (gradient tool)
      const buttons = await leftToolbar.$$('button');
      if (buttons.length > 4) {
        console.log('🎨 Clicking button 4 (gradient tool)...');
        await buttons[4].click();
        console.log('✅ Gradient tool clicked');
        
        // Wait a moment for the gradient tool panel to appear
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if gradient tool panel is visible
        const gradientPanel = await page.$('[class*="Gradient Tool"]');
        if (gradientPanel) {
          console.log('✅ Gradient tool panel found');
        } else {
          console.log('❌ Gradient tool panel not found');
        }
        
        // Look for gradient-related elements
        const gradientElements = await page.$$('[class*="gradient"], [class*="Gradient"]');
        console.log(`Found ${gradientElements.length} gradient-related elements`);
        
        // Check for color stop inputs
        const colorInputs = await page.$$('input[type="color"]');
        console.log(`Found ${colorInputs.length} color inputs`);
        
        // Check for gradient type buttons
        const allButtons = await page.$$('button');
        let linearButton = null;
        let radialButton = null;
        
        for (let button of allButtons) {
          const text = await button.evaluate(el => el.textContent);
          if (text === 'Linear') linearButton = button;
          if (text === 'Radial') radialButton = button;
        }
        
        if (linearButton) {
          console.log('✅ Linear gradient button found');
        }
        if (radialButton) {
          console.log('✅ Radial gradient button found');
        }
        
        // Try to create a shape first
        const canvas = await page.$('canvas');
        if (canvas) {
          const box = await canvas.boundingBox();
          if (box) {
            console.log('🎯 Creating a rectangle to test gradient on...');
            // Click on canvas to create a rectangle
            await page.mouse.click(box.x + 200, box.y + 200);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check if rectangle was created
            const shapes = await page.$$('rect');
            console.log(`Found ${shapes.length} rectangles on canvas`);
            
            if (shapes.length > 0) {
              console.log('✅ Rectangle created for gradient testing');
            }
          }
        }
        
        // Take a screenshot
        await page.screenshot({ path: 'gradient-tool-test.png', fullPage: true });
        console.log('📸 Screenshot saved as gradient-tool-test.png');
      }
    }
    
    console.log('🎉 Gradient tool test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testGradientTool().catch(console.error);
