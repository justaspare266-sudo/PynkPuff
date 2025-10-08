const puppeteer = require('puppeteer');

async function testMouseEvents() {
  console.log('🖱️ Testing Mouse Event Handling...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Navigate to the master image editor
    await page.goto('http://localhost:3000/master-image-editor', { waitUntil: 'networkidle0' });
    console.log('✅ Master Image Editor loaded');
    
    // Wait for the canvas to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log('✅ Canvas found');
    
    // Click the rectangle tool
    const rectangleButton = await page.$('button[title=""]:has-text("+ Rectangle")');
    if (rectangleButton) {
      await rectangleButton.click();
      console.log('✅ Rectangle tool clicked');
    } else {
      // Try to find it by text content
      const buttons = await page.$$('button');
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].evaluate(el => el.textContent || '');
        if (text.includes('Rectangle')) {
          await buttons[i].click();
          console.log('✅ Rectangle tool clicked (found by text)');
          break;
        }
      }
    }
    
    // Wait a moment for the tool to be selected
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the canvas element
    const canvas = await page.$('canvas');
    if (!canvas) {
      console.log('❌ Canvas not found');
      return;
    }
    
    const canvasBox = await canvas.boundingBox();
    console.log('Canvas bounding box:', canvasBox);
    
    if (!canvasBox) {
      console.log('❌ Could not get canvas bounding box');
      return;
    }
    
    // Try clicking on the canvas to see if mouse events are captured
    console.log('🖱️ Testing mouse down event...');
    
    const startX = canvasBox.x + canvasBox.width / 2;
    const startY = canvasBox.y + canvasBox.height / 2;
    
    console.log(`Clicking at (${startX}, ${startY})`);
    
    // Move to the position first
    await page.mouse.move(startX, startY);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mouse down
    await page.mouse.down();
    console.log('✅ Mouse down');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Drag to create a rectangle
    const endX = startX + 100;
    const endY = startY + 100;
    
    console.log(`Dragging to (${endX}, ${endY})`);
    await page.mouse.move(endX, endY, { steps: 5 });
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mouse up
    await page.mouse.up();
    console.log('✅ Mouse up');
    
    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if any shapes were created
    const shapesCount = await page.evaluate(() => {
      const stage = document.querySelector('.konvajs-content');
      if (stage) {
        return stage.children.length;
      }
      return 0;
    });
    
    console.log(`📊 Total shapes on stage: ${shapesCount}`);
    
    // Check the current layer for shapes
    const layerInfo = await page.evaluate(() => {
      // Try to access the React component state
      const reactRoot = document.querySelector('#__next');
      if (reactRoot && reactRoot._reactInternalFiber) {
        // This is a simplified check - in reality we'd need to traverse the React tree
        return 'React root found but state access is complex';
      }
      return 'Could not access React state directly';
    });
    
    console.log('React state access:', layerInfo);
    
    // Check for any error messages in console
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    if (errors.length > 0) {
      console.log('❌ Console errors found:');
      errors.forEach(error => console.log(`  - ${error.text}`));
    }
    
    // Check for any relevant log messages
    const relevantLogs = consoleMessages.filter(msg => 
      msg.text.includes('shape') || 
      msg.text.includes('mouse') || 
      msg.text.includes('drag') ||
      msg.text.includes('tempObject') ||
      msg.text.includes('addShape')
    );
    
    if (relevantLogs.length > 0) {
      console.log('📝 Relevant console messages:');
      relevantLogs.forEach(log => console.log(`  [${log.type}] ${log.text}`));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testMouseEvents();
