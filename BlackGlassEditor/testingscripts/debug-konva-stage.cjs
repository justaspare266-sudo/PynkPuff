const puppeteer = require('puppeteer');

async function debugKonvaStage() {
  console.log('🔍 Debugging Konva Stage...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log('📝 Browser:', msg.text());
    }
  });
  
  try {
    // Navigate to the editor
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    
    // Wait for the editor to load
    await page.waitForSelector('.canvas-container', { timeout: 10000 });
    console.log('✅ Editor loaded successfully');
    
    // Find the left toolbar
    const leftToolbar = await page.$('.w-12.flex.flex-col.py-2.bg-black\\/80.backdrop-blur-md.border-r.border-white\\/10');
    if (leftToolbar) {
      // Click button 4 (crop tool)
      const buttons = await leftToolbar.$$('button');
      if (buttons.length > 4) {
        console.log('🖱️ Clicking button 4 (crop tool)...');
        await buttons[4].click();
        console.log('✅ Button 4 clicked');
        
        // Wait for crop controls to appear
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find the Konva stage
        const stage = await page.$('canvas');
        if (stage) {
          console.log('✅ Konva stage (canvas) found');
          
          // Check the stage's computed styles
          const styles = await stage.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              pointerEvents: computed.pointerEvents,
              position: computed.position,
              zIndex: computed.zIndex,
              display: computed.display,
              visibility: computed.visibility,
              opacity: computed.opacity
            };
          });
          console.log('Stage styles:', styles);
          
          // Check if the stage is clickable
          const isClickable = await stage.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return {
              width: rect.width,
              height: rect.height,
              visible: rect.width > 0 && rect.height > 0,
              top: rect.top,
              left: rect.left
            };
          });
          console.log('Stage clickability:', isClickable);
          
          // Check parent elements
          const parent = await stage.evaluateHandle(el => el.parentElement);
          const parentStyles = await parent.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              pointerEvents: computed.pointerEvents,
              position: computed.position,
              zIndex: computed.zIndex,
              display: computed.display,
              visibility: computed.visibility,
              opacity: computed.opacity
            };
          });
          console.log('Parent styles:', parentStyles);
          
          // Try to add a simple click listener to test
          await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
              canvas.addEventListener('click', (e) => {
                console.log('Direct canvas click event:', e.clientX, e.clientY);
              });
              canvas.addEventListener('mousedown', (e) => {
                console.log('Direct canvas mousedown event:', e.clientX, e.clientY);
              });
            }
          });
          
          // Now try clicking
          const box = await stage.boundingBox();
          if (box) {
            console.log(`Clicking at (${box.x + 100}, ${box.y + 100})`);
            await page.mouse.click(box.x + 100, box.y + 100);
            console.log('✅ Clicked on stage');
            
            // Wait for any console logs
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          console.log('❌ Konva stage not found');
        }
      }
    }
    
    console.log('🎉 Konva stage debugging completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugKonvaStage().catch(console.error);
