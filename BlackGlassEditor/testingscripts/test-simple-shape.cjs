const puppeteer = require('puppeteer');

async function testSimpleShape() {
  console.log('🔧 Testing Simple Shape Creation...');
  
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
      console.log(`[${msg.type()}] ${msg.text}`);
    });
    
    // Navigate to the master image editor
    await page.goto('http://localhost:3000/master-image-editor', { waitUntil: 'networkidle0' });
    console.log('✅ Master Image Editor loaded');
    
    // Wait for the canvas to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log('✅ Canvas found');
    
    // Find and click the rectangle tool
    const buttons = await page.$$('button');
    let rectangleClicked = false;
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].evaluate(el => el.textContent || '');
      if (text.includes('Rectangle')) {
        console.log(`🎯 Found rectangle button: "${text}"`);
        await buttons[i].click();
        rectangleClicked = true;
        break;
      }
    }
    
    if (!rectangleClicked) {
      console.log('❌ Could not find rectangle button');
      return;
    }
    
    console.log('✅ Rectangle tool selected');
    
    // Wait for tool selection to register
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the canvas
    const canvas = await page.$('canvas');
    const canvasBox = await canvas.boundingBox();
    
    if (!canvasBox) {
      console.log('❌ Could not get canvas bounding box');
      return;
    }
    
    console.log('Canvas position:', canvasBox);
    
    // Click and drag on the canvas
    const centerX = canvasBox.x + canvasBox.width / 2;
    const centerY = canvasBox.y + canvasBox.height / 2;
    
    console.log(`🖱️ Clicking at (${centerX}, ${centerY})`);
    
    // Perform the click and drag
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    
    // Drag to create a rectangle
    const dragX = centerX + 100;
    const dragY = centerY + 100;
    
    console.log(`🖱️ Dragging to (${dragX}, ${dragY})`);
    await page.mouse.move(dragX, dragY, { steps: 10 });
    await page.mouse.up();
    
    console.log('✅ Mouse drag completed');
    
    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check the final state
    const finalState = await page.evaluate(() => {
      const stage = document.querySelector('.konvajs-content');
      const canvas = document.querySelector('canvas');
      
      return {
        stageChildren: stage ? stage.children.length : 0,
        canvasChildren: canvas ? canvas.children.length : 0,
        stageInfo: stage ? {
          className: stage.className,
          children: Array.from(stage.children).map(child => ({
            tagName: child.tagName,
            className: child.className,
            id: child.id
          }))
        } : null
      };
    });
    
    console.log('📊 Final State:', finalState);
    
    // Check for any mouse-related console messages
    const mouseLogs = consoleMessages.filter(msg => 
      msg.text.includes('Mouse') || 
      msg.text.includes('mouse') ||
      msg.text.includes('drag') ||
      msg.text.includes('tempObject') ||
      msg.text.includes('addShape') ||
      msg.text.includes('Creating temp shape') ||
      msg.text.includes('Finalizing shape')
    );
    
    if (mouseLogs.length > 0) {
      console.log('🖱️ Mouse-related console messages:');
      mouseLogs.forEach(log => console.log(`  [${log.type}] ${log.text}`));
    } else {
      console.log('⚠️ No mouse-related console messages found');
    }
    
    // Check for any errors
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    if (errors.length > 0) {
      console.log('❌ Console errors:');
      errors.forEach(error => console.log(`  - ${error.text}`));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSimpleShape();
