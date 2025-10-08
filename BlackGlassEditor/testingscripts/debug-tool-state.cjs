const puppeteer = require('puppeteer');

async function debugToolState() {
  console.log('🔍 Debugging Tool State...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Enable console logging
    page.on('console', msg => {
      console.log('Browser Console:', msg.text());
    });
    
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Check initial tool state
    const initialState = await page.evaluate(() => {
      // Look for any React state or tool indicators
      const reactRoot = document.querySelector('#root');
      const stage = document.querySelector('.konvajs-content');
      
      return {
        hasReactRoot: !!reactRoot,
        hasStage: !!stage,
        stageChildren: stage ? stage.children.length : 0,
        allButtons: document.querySelectorAll('button').length,
        leftButtons: Array.from(document.querySelectorAll('button')).filter(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.left < 100;
        }).length
      };
    });
    
    console.log('📊 Initial State:', initialState);
    
    // Click a tool button and check state
    const leftButtons = await page.$$('button');
    const iconButtons = [];
    
    for (let i = 0; i < leftButtons.length; i++) {
      const button = leftButtons[i];
      const buttonInfo = await page.evaluate((btn) => {
        const rect = btn.getBoundingClientRect();
        return {
          isOnLeft: rect.left < 100,
          size: { width: rect.width, height: rect.height }
        };
      }, button);
      
      if (buttonInfo.isOnLeft && buttonInfo.size.width > 30) {
        iconButtons.push(button);
      }
    }
    
    console.log(`🎯 Found ${iconButtons.length} icon buttons`);
    
    // Test each button and check what happens
    for (let i = 0; i < Math.min(iconButtons.length, 5); i++) {
      console.log(`\n🔘 Testing button ${i + 1}:`);
      
      // Click the button
      await iconButtons[i].click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if anything changed
      const afterClick = await page.evaluate(() => {
        const stage = document.querySelector('.konvajs-content');
        return {
          stageChildren: stage ? stage.children.length : 0,
          // Look for any active/selected states
          activeButtons: Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.className.includes('active') || 
            btn.className.includes('selected') ||
            btn.getAttribute('data-selected') === 'true'
          ).length
        };
      });
      
      console.log(`   Stage children: ${afterClick.stageChildren}`);
      console.log(`   Active buttons: ${afterClick.activeButtons}`);
      
      // Try clicking on canvas
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
        
        console.log(`   🎯 Clicking canvas at (${clickX}, ${clickY})`);
        
        // Add console logging to see what happens
        await page.evaluate(() => {
          window.canvasClickLog = [];
          const canvas = document.querySelector('canvas');
          if (canvas) {
            canvas.addEventListener('click', (e) => {
              window.canvasClickLog.push({
                timestamp: Date.now(),
                x: e.clientX,
                y: e.clientY,
                target: e.target.tagName
              });
            });
          }
        });
        
        await page.mouse.click(clickX, clickY);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check what happened
        const clickLog = await page.evaluate(() => window.canvasClickLog || []);
        const finalState = await page.evaluate(() => {
          const stage = document.querySelector('.konvajs-content');
          return {
            stageChildren: stage ? stage.children.length : 0,
            objects: stage ? Array.from(stage.children).map(child => ({
              tagName: child.tagName,
              className: child.className
            })) : []
          };
        });
        
        console.log(`   Click log:`, clickLog);
        console.log(`   Final stage children: ${finalState.stageChildren}`);
        console.log(`   Objects:`, finalState.objects);
      }
    }
    
    // Check for any JavaScript errors
    const errors = await page.evaluate(() => {
      return window.errors || [];
    });
    
    if (errors.length > 0) {
      console.log('\n❌ JavaScript errors:', errors);
    }
    
    console.log('\n🎉 Tool state debugging completed!');
    
    // Keep browser open to inspect
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugToolState().catch(console.error);
