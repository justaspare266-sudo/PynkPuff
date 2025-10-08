const puppeteer = require('puppeteer');

async function testShapeFixes() {
  console.log('🔧 Testing Shape Creation Fixes...');
  
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
    
    // Navigate to the master image editor through Next.js
    await page.goto('http://localhost:3000/master-image-editor', { waitUntil: 'networkidle0' });
    console.log('✅ Master Image Editor loaded');
    
    // Wait for the canvas to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log('✅ Canvas found');
    
    // Check initial state
    const initialState = await page.evaluate(() => {
      const stage = document.querySelector('.konvajs-content');
      const canvas = document.querySelector('canvas');
      
      return {
        stageChildren: stage ? stage.children.length : 0,
        canvasChildren: canvas ? canvas.children.length : 0,
        hasStage: !!stage,
        hasCanvas: !!canvas
      };
    });
    
    console.log('📊 Initial State:', initialState);
    
    // Look for shape tools - try to find rectangle tool
    console.log('🔍 Looking for shape tools...');
    
    // Try to find and click a rectangle tool
    const allButtons = await page.$$('button');
    console.log(`Found ${allButtons.length} buttons on page`);
    
    // Look for buttons that might be shape tools
    let shapeToolClicked = false;
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await button.evaluate(el => el.textContent || '');
      const title = await button.evaluate(el => el.title || '');
      
      console.log(`Button ${i}: "${text}" (title: "${title}")`);
      
      // Look for rectangle or shape-related buttons
      if (text.toLowerCase().includes('rect') || 
          text.toLowerCase().includes('shape') ||
          title.toLowerCase().includes('rect') ||
          title.toLowerCase().includes('shape')) {
        console.log(`🎯 Found potential shape tool: "${text}"`);
        await button.click();
        shapeToolClicked = true;
        break;
      }
    }
    
    if (!shapeToolClicked) {
      console.log('⚠️ No shape tool found, trying to click any button that might be a tool');
      // Try clicking the first few buttons to see if any are tools
      for (let i = 0; i < Math.min(5, allButtons.length); i++) {
        try {
          await allButtons[i].click();
          console.log(`Clicked button ${i}`);
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
          console.log(`Could not click button ${i}: ${e.message}`);
        }
      }
    }
    
    // Now try to create a shape by clicking and dragging on the canvas
    console.log('🎨 Attempting to create a shape...');
    
    const canvas = await page.$('canvas');
    if (canvas) {
      const canvasBox = await canvas.boundingBox();
      console.log('Canvas bounding box:', canvasBox);
      
      if (canvasBox) {
        // Click and drag to create a shape
        const startX = canvasBox.x + canvasBox.width / 2 - 50;
        const startY = canvasBox.y + canvasBox.height / 2 - 50;
        const endX = canvasBox.x + canvasBox.width / 2 + 50;
        const endY = canvasBox.y + canvasBox.height / 2 + 50;
        
        console.log(`Drawing from (${startX}, ${startY}) to (${endX}, ${endY})`);
        
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 10 });
        await page.mouse.up();
        
        console.log('✅ Mouse drag completed');
        
        // Wait a moment for the shape to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if any shapes were created
        const finalState = await page.evaluate(() => {
          const stage = document.querySelector('.konvajs-content');
          const canvas = document.querySelector('canvas');
          
          return {
            stageChildren: stage ? stage.children.length : 0,
            canvasChildren: canvas ? canvas.children.length : 0,
            hasStage: !!stage,
            hasCanvas: !!canvas
          };
        });
        
        console.log('📊 Final State:', finalState);
        
        const shapesCreated = finalState.stageChildren - initialState.stageChildren;
        console.log(`🎯 Shapes created: ${shapesCreated}`);
        
        if (shapesCreated > 0) {
          console.log('✅ SUCCESS: Shape creation is working!');
        } else {
          console.log('❌ FAILED: No shapes were created');
        }
      }
    }
    
    // Check console for any relevant messages
    console.log('\n📝 Console Messages:');
    consoleMessages.forEach(msg => {
      if (msg.text.includes('shape') || msg.text.includes('layer') || msg.text.includes('artboard')) {
        console.log(`[${msg.type}] ${msg.text}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testShapeFixes();
