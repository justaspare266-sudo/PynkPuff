const puppeteer = require('puppeteer');

async function testDirectKonva() {
  console.log('🔧 Testing Direct Konva...');
  
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
    
    // Inject Konva directly and test
    await page.evaluate(() => {
      // Load Konva if not already loaded
      if (typeof Konva === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/konva@9.2.0/konva.min.js';
        script.onload = () => {
          console.log('Konva loaded directly');
          testKonvaDirectly();
        };
        document.head.appendChild(script);
      } else {
        testKonvaDirectly();
      }
      
      function testKonvaDirectly() {
        console.log('Testing Konva directly...');
        
        // Create a simple stage
        const stage = new Konva.Stage({
          container: document.body,
          width: 300,
          height: 200
        });
        
        const layer = new Konva.Layer();
        stage.add(layer);
        
        const rect = new Konva.Rect({
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          fill: 'red',
          stroke: 'black',
          strokeWidth: 2
        });
        
        rect.on('mousedown', () => {
          console.log('🖱️ Direct Konva Mouse Down!');
        });
        
        rect.on('click', () => {
          console.log('🖱️ Direct Konva Click!');
        });
        
        layer.add(rect);
        layer.draw();
        
        console.log('Direct Konva stage created');
      }
    });
    
    // Wait for Konva to load and create the stage
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find the direct Konva stage
    const directStage = await page.$('canvas[width="300"]');
    if (directStage) {
      console.log('✅ Direct Konva stage found');
      
      const stageBox = await directStage.boundingBox();
      if (stageBox) {
        console.log('Direct stage position:', stageBox);
        
        // Click on the direct stage
        const centerX = stageBox.x + stageBox.width / 2;
        const centerY = stageBox.y + stageBox.height / 2;
        
        console.log(`🖱️ Clicking direct stage at (${centerX}, ${centerY})`);
        
        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        await new Promise(resolve => setTimeout(resolve, 200));
        await page.mouse.up();
        
        console.log('✅ Direct stage click completed');
      }
    } else {
      console.log('❌ Direct Konva stage not found');
    }
    
    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if any mouse events were captured
    const mouseEvents = consoleMessages.filter(msg => 
      msg.text.includes('Direct Konva Mouse') || 
      msg.text.includes('Direct Konva Click') ||
      msg.text.includes('🖱️')
    );
    
    if (mouseEvents.length > 0) {
      console.log('🖱️ Direct Konva mouse events captured:');
      mouseEvents.forEach(event => console.log(`  - ${event.text}`));
    } else {
      console.log('❌ No direct Konva mouse events were captured');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testDirectKonva();
