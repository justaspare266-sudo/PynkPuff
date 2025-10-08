const puppeteer = require('puppeteer');

async function testEventBinding() {
  console.log('🔧 Testing Event Binding...');
  
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
    
    // Check if the mouse event handlers are properly bound
    const eventHandlers = await page.evaluate(() => {
      const stage = document.querySelector('canvas').parentElement;
      if (stage) {
        console.log('Stage element found:', stage);
        
        // Check if the stage has event listeners
        const hasListeners = stage.onmousedown || stage.onmousemove || stage.onmouseup;
        console.log('Stage has event listeners:', hasListeners);
        
        // Check the stage properties
        console.log('Stage properties:', {
          className: stage.className,
          id: stage.id,
          tagName: stage.tagName,
          style: stage.style.cssText
        });
        
        // Check if there are any React event handlers
        const reactProps = stage._reactInternalFiber || stage._reactInternalInstance;
        console.log('React props found:', !!reactProps);
        
        return {
          hasListeners: !!hasListeners,
          className: stage.className,
          id: stage.id,
          tagName: stage.tagName,
          reactProps: !!reactProps
        };
      }
      return null;
    });
    
    console.log('Event handlers info:', eventHandlers);
    
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
    
    // Try to trigger mouse events directly on the stage
    const stage = await page.$('.konvajs-content');
    if (stage) {
      console.log('✅ Konva stage found');
      
      const stageBox = await stage.boundingBox();
      if (stageBox) {
        console.log('Stage bounding box:', stageBox);
        
        // Click directly on the stage
        const centerX = stageBox.x + stageBox.width / 2;
        const centerY = stageBox.y + stageBox.height / 2;
        
        console.log(`🖱️ Clicking directly on stage at (${centerX}, ${centerY})`);
        
        // Perform the click
        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        await new Promise(resolve => setTimeout(resolve, 200));
        await page.mouse.up();
        
        console.log('✅ Direct stage click completed');
      }
    } else {
      console.log('❌ Konva stage not found');
    }
    
    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if any mouse events were captured
    const mouseEvents = consoleMessages.filter(msg => 
      msg.text.includes('Mouse down') || 
      msg.text.includes('Creating temp shape') ||
      msg.text.includes('Finalizing shape') ||
      msg.text.includes('Adding shape')
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
      msg.text.includes('tool=') ||
      msg.text.includes('pos=(')
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

testEventBinding();
