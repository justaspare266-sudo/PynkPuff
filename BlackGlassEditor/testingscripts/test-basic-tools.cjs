const puppeteer = require('puppeteer');

async function testBasicTools() {
  console.log('🔧 Testing Basic Tools...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'info') {
      console.log('📝 Browser:', msg.text());
    }
  });
  
  try {
    // Navigate to the editor
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle0' });
    
    // Wait for the editor to load
    await page.waitForSelector('.canvas-container', { timeout: 10000 });
    console.log('✅ Editor loaded successfully');
    
    // Test each tool
    const tools = [
      { name: 'Select', index: 0 },
      { name: 'Text', index: 1 },
      { name: 'Pen', index: 2 },
      { name: 'Paint Bucket', index: 3 },
      { name: 'Gradient', index: 4 },
      { name: 'Crop', index: 5 },
      { name: 'Rectangle', index: 6 }, // This should be in shapes popout
    ];
    
    for (const tool of tools) {
      console.log(`\n🎯 Testing ${tool.name} tool...`);
      
      // Find the left toolbar
      const leftToolbar = await page.$('.w-12.flex.flex-col.py-2');
      if (leftToolbar) {
        const buttons = await leftToolbar.$$('button');
        if (buttons.length > tool.index) {
          console.log(`🖱️ Clicking ${tool.name} tool (button ${tool.index})...`);
          await buttons[tool.index].click();
          
          // Wait a moment
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Click on canvas to test tool
          const canvas = await page.$('canvas');
          if (canvas) {
            const box = await canvas.boundingBox();
            if (box) {
              console.log(`🎯 Clicking on canvas with ${tool.name} tool...`);
              await page.mouse.click(box.x + 200, box.y + 200);
              
              // Wait for any shapes to be created
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Count shapes on canvas
              const shapes = await page.$$('rect, circle, text');
              console.log(`📊 Found ${shapes.length} shapes after ${tool.name} tool`);
            }
          }
        } else {
          console.log(`❌ Not enough buttons for ${tool.name} tool`);
        }
      }
    }
    
    // Take a final screenshot
    await page.screenshot({ path: 'basic-tools-test.png', fullPage: true });
    console.log('📸 Screenshot saved as basic-tools-test.png');
    
    console.log('\n🎉 Basic tools test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testBasicTools().catch(console.error);
