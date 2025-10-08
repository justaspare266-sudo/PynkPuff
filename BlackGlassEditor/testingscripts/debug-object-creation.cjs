const puppeteer = require('puppeteer');

async function debugObjectCreation() {
  console.log('🔍 Debugging Object Creation...');
  
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
    
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Check initial state
    const initialState = await page.evaluate(() => {
      const stage = document.querySelector('.konvajs-content');
      const canvas = document.querySelector('canvas');
      
      return {
        stageChildren: stage ? stage.children.length : 0,
        canvasChildren: canvas ? canvas.children.length : 0,
        stageInfo: stage ? {
          className: stage.className,
          children: Array.from(stage.children).map(child => ({
            tagName: child.tagName,
            className: child.className
          }))
        } : null
      };
    });
    
    console.log('📊 Initial State:', initialState);
    
    // Find and click the text tool (button 19)
    const allButtons = await page.$$('button');
    const textToolButton = allButtons[19]; // Text tool button
    
    if (textToolButton) {
      console.log('\n🔧 Clicking text tool...');
      await textToolButton.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Click on canvas
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
        
        // Check state after click
        const afterClickState = await page.evaluate(() => {
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
                children: child.children ? Array.from(child.children).map(grandChild => ({
                  tagName: grandChild.tagName,
                  className: grandChild.className
                })) : []
              }))
            } : null,
            // Check for Konva objects
            konvaObjects: window.Konva ? window.Konva.stages.length : 0
          };
        });
        
        console.log('📊 After Click State:', afterClickState);
        
        // Try to find Konva objects
        const konvaInfo = await page.evaluate(() => {
          if (window.Konva && window.Konva.stages.length > 0) {
            const stage = window.Konva.stages[0];
            return {
              stageFound: true,
              children: stage.children.length,
              layers: stage.children.map(layer => ({
                className: layer.className,
                children: layer.children.length,
                childrenTypes: layer.children.map(child => child.className)
              }))
            };
          }
          return { stageFound: false };
        });
        
        console.log('🎨 Konva Info:', konvaInfo);
      }
    }
    
    console.log('\n📊 Console Messages:');
    consoleMessages.forEach(msg => {
      console.log(`[${msg.type}] ${msg.text}`);
    });
    
    console.log('\n🎉 Object creation debugging completed!');
    
    // Keep browser open to inspect
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugObjectCreation().catch(console.error);
