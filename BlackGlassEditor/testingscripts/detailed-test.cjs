const puppeteer = require('puppeteer');

async function detailedTest() {
  console.log('🔍 Detailed Image Editor Test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    page.on('console', msg => {
      console.log('Browser Console:', msg.text());
    });
    
    page.on('pageerror', error => {
      console.error('Page Error:', error.message);
    });
    
    console.log('📱 Loading editor...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    
    // Wait for editor to load
    await page.waitForSelector('canvas', { timeout: 10000 });
    console.log('✅ Canvas loaded');
    
    // Check what's actually rendered
    const pageContent = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const stage = document.querySelector('.konvajs-content');
      const buttons = document.querySelectorAll('button');
      const toolbars = document.querySelectorAll('[class*="toolbar"], [class*="Toolbar"]');
      
      return {
        hasCanvas: !!canvas,
        hasStage: !!stage,
        buttonCount: buttons.length,
        toolbarCount: toolbars.length,
        buttonTexts: Array.from(buttons).map(btn => btn.textContent?.trim()).filter(Boolean),
        canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null,
        stageInfo: stage ? {
          className: stage.className,
          children: stage.children.length
        } : null
      };
    });
    
    console.log('📊 Page Analysis:');
    console.log('- Canvas found:', pageContent.hasCanvas);
    console.log('- Stage found:', pageContent.hasStage);
    console.log('- Buttons found:', pageContent.buttonCount);
    console.log('- Toolbars found:', pageContent.toolbarCount);
    console.log('- Button texts:', pageContent.buttonTexts);
    console.log('- Canvas size:', pageContent.canvasSize);
    console.log('- Stage info:', pageContent.stageInfo);
    
    // Test tool selection
    console.log('\n🔧 Testing tool selection...');
    if (pageContent.buttonTexts.length > 0) {
      // Try clicking the first button
      const firstButton = await page.$('button');
      if (firstButton) {
        console.log('Clicking first button...');
        await firstButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ Button clicked');
      }
    } else {
      console.log('❌ No buttons found to test');
    }
    
    // Test canvas interaction with different tools
    console.log('\n🎯 Testing canvas interaction...');
    const canvas = await page.$('canvas');
    if (canvas) {
      const canvasInfo = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        return {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        };
      });
      
      // Test multiple clicks
      for (let i = 0; i < 3; i++) {
        const x = canvasInfo.x + 100 + (i * 50);
        const y = canvasInfo.y + 100 + (i * 50);
        
        console.log(`Click ${i + 1} at (${x}, ${y})`);
        await page.mouse.click(x, y);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if anything was created
        const objectsAfterClick = await page.evaluate(() => {
          const stage = document.querySelector('.konvajs-content');
          if (stage) {
            const canvases = stage.querySelectorAll('canvas');
            return canvases.length;
          }
          return 0;
        });
        
        console.log(`Objects after click ${i + 1}: ${objectsAfterClick}`);
      }
    }
    
    // Check for any React errors
    const reactErrors = await page.evaluate(() => {
      const errorBoundary = document.querySelector('[data-react-error-boundary]');
      return errorBoundary ? errorBoundary.textContent : null;
    });
    
    if (reactErrors) {
      console.log('❌ React Error Boundary triggered:', reactErrors);
    } else {
      console.log('✅ No React errors detected');
    }
    
    // Check console for any errors
    const consoleErrors = await page.evaluate(() => {
      return window.consoleErrors || [];
    });
    
    if (consoleErrors.length > 0) {
      console.log('❌ Console errors:', consoleErrors);
    } else {
      console.log('✅ No console errors');
    }
    
    console.log('\n🎉 Detailed test completed!');
    
    // Keep browser open to inspect
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

detailedTest().catch(console.error);
