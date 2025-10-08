const puppeteer = require('puppeteer');

async function testMouseDebug() {
  console.log('🖱️ Testing Mouse Event Debug...');
  
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
    
    // Navigate to the master image editor
    await page.goto('http://localhost:3000/master-image-editor', { waitUntil: 'networkidle0' });
    console.log('✅ Master Image Editor loaded');
    
    // Wait for the canvas to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log('✅ Canvas found');
    
    // Inject some debugging code to monitor mouse events
    await page.evaluate(() => {
      // Override the mouse event handlers to add logging
      const stage = document.querySelector('canvas').parentElement;
      if (stage) {
        console.log('Stage element found:', stage);
        
        // Add event listeners to see if events are being captured
        stage.addEventListener('mousedown', (e) => {
          console.log('🖱️ MOUSE DOWN detected on stage:', e.clientX, e.clientY);
        });
        
        stage.addEventListener('mousemove', (e) => {
          console.log('🖱️ MOUSE MOVE detected on stage:', e.clientX, e.clientY);
        });
        
        stage.addEventListener('mouseup', (e) => {
          console.log('🖱️ MOUSE UP detected on stage:', e.clientX, e.clientY);
        });
        
        stage.addEventListener('click', (e) => {
          console.log('🖱️ CLICK detected on stage:', e.clientX, e.clientY);
        });
        
        console.log('✅ Event listeners added to stage');
      } else {
        console.log('❌ Stage element not found');
      }
    });
    
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
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Drag to create a rectangle
    const dragX = centerX + 100;
    const dragY = centerY + 100;
    
    console.log(`🖱️ Dragging to (${dragX}, ${dragY})`);
    await page.mouse.move(dragX, dragY, { steps: 10 });
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 200));
    
    await page.mouse.up();
    
    console.log('✅ Mouse drag completed');
    
    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if any mouse events were captured
    const mouseEvents = consoleMessages.filter(msg => 
      msg.text.includes('MOUSE') || 
      msg.text.includes('mousedown') ||
      msg.text.includes('mousemove') ||
      msg.text.includes('mouseup') ||
      msg.text.includes('click')
    );
    
    if (mouseEvents.length > 0) {
      console.log('🖱️ Mouse events captured:');
      mouseEvents.forEach(event => console.log(`  - ${event.text}`));
    } else {
      console.log('❌ No mouse events were captured');
    }
    
    // Check for any other relevant messages
    const relevantMessages = consoleMessages.filter(msg => 
      msg.text.includes('shape') || 
      msg.text.includes('layer') || 
      msg.text.includes('artboard') ||
      msg.text.includes('Creating temp shape') ||
      msg.text.includes('Finalizing shape') ||
      msg.text.includes('Adding shape')
    );
    
    if (relevantMessages.length > 0) {
      console.log('📝 Relevant messages:');
      relevantMessages.forEach(msg => console.log(`  [${msg.type}] ${msg.text}`));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testMouseDebug();
