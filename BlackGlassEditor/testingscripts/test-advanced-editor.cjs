const puppeteer = require('puppeteer');

async function testAdvancedEditor() {
  console.log('🎉 Testing Advanced Editor with Black Glass UI...');
  
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
    
    page.on('pageerror', error => {
      console.error('❌ Page Error:', error.message);
    });
    
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    
    // Wait a bit for the editor to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if the editor loaded
    const editorInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const stage = document.querySelector('.konvajs-content');
      const topToolbar = document.querySelector('[class*="TopToolbar"]');
      const leftToolbar = document.querySelector('[class*="LeftToolbar"]');
      const propertiesPanel = document.querySelector('[class*="PropertiesPanel"]');
      
      return {
        canvasFound: !!canvas,
        stageFound: !!stage,
        topToolbarFound: !!topToolbar,
        leftToolbarFound: !!leftToolbar,
        propertiesPanelFound: !!propertiesPanel,
        canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null,
        stageChildren: stage ? stage.children.length : 0
      };
    });
    
    console.log('📊 Editor Info:', editorInfo);
    
    if (editorInfo.canvasFound) {
      console.log('✅ Canvas found!');
      
      // Test clicking on canvas
      const canvas = await page.$('canvas');
      if (canvas) {
        const canvasRect = await page.evaluate(() => {
          const canvas = document.querySelector('canvas');
          const rect = canvas.getBoundingClientRect();
          return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          };
        });
        
        const clickX = canvasRect.x + canvasRect.width / 2;
        const clickY = canvasRect.y + canvasRect.height / 2;
        
        console.log(`🎯 Clicking canvas at (${clickX}, ${clickY})`);
        await page.mouse.click(clickX, clickY);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if anything happened
        const afterClick = await page.evaluate(() => {
          const stage = document.querySelector('.konvajs-content');
          return {
            stageChildren: stage ? stage.children.length : 0,
            objects: stage ? Array.from(stage.children).map(child => ({
              tagName: child.tagName,
              className: child.className
            })) : []
          };
        });
        
        console.log('📊 After Click:', afterClick);
      }
    } else {
      console.log('❌ Canvas not found');
    }
    
    console.log('\n📊 Console Messages:');
    consoleMessages.forEach(msg => {
      console.log(`[${msg.type}] ${msg.text}`);
    });
    
    console.log('\n🎉 Advanced editor test completed!');
    
    // Keep browser open to see the results
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAdvancedEditor().catch(console.error);
