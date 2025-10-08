const puppeteer = require('puppeteer');

async function testSimpleStage() {
  console.log('🔧 Testing Simple Stage...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Add a console listener to capture all messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
      console.log(`[${msg.type()}] ${msg.text}`);
    });
    
    // Navigate to the simple stage test
    await page.goto('http://localhost:3000/simple-stage-test', { waitUntil: 'networkidle0' });
    console.log('✅ Simple Stage Test loaded');
    
    // Wait for the canvas to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log('✅ Canvas found');
    
    // Check if the stage has event listeners
    const eventHandlers = await page.evaluate(() => {
      const stage = document.querySelector('canvas').parentElement;
      if (stage) {
        console.log('Stage element found:', stage);
        
        // Check if the stage has event listeners
        const hasListeners = stage.onmousedown || stage.onmousemove || stage.onmouseup;
        console.log('Stage has event listeners:', hasListeners);
        
        return {
          hasListeners: !!hasListeners,
          className: stage.className,
          id: stage.id,
          tagName: stage.tagName
        };
      }
      return null;
    });
    
    console.log('Event handlers info:', eventHandlers);
    
    // Get the canvas
    const canvas = await page.$('canvas');
    const canvasBox = await canvas.boundingBox();
    
    if (!canvasBox) {
      console.log('❌ Could not get canvas bounding box');
      return;
    }
    
    console.log('Canvas position:', canvasBox);
    
    // Click on the canvas
    const centerX = canvasBox.x + canvasBox.width / 2;
    const centerY = canvasBox.y + canvasBox.height / 2;
    
    console.log(`🖱️ Clicking at (${centerX}, ${centerY})`);
    
    // Perform the click
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await new Promise(resolve => setTimeout(resolve, 200));
    await page.mouse.up();
    
    console.log('✅ Mouse click completed');
    
    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if any mouse events were captured
    const mouseEvents = consoleMessages.filter(msg => 
      msg.text.includes('Simple Stage Mouse') || 
      msg.text.includes('Position:') ||
      msg.text.includes('🖱️')
    );
    
    if (mouseEvents.length > 0) {
      console.log('🖱️ Mouse events captured:');
      mouseEvents.forEach(event => console.log(`  - ${event.text}`));
    } else {
      console.log('❌ No mouse events were captured');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSimpleStage();
