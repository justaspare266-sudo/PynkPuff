const puppeteer = require('puppeteer');

async function testIconButtons() {
  console.log('🎯 Testing Icon Buttons...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    await page.waitForSelector('canvas', { timeout: 10000 });
    
    // Find the left toolbar buttons (icon buttons)
    const leftToolbarButtons = await page.$$('button');
    const iconButtons = [];
    
    for (let i = 0; i < leftToolbarButtons.length; i++) {
      const button = leftToolbarButtons[i];
      const buttonInfo = await page.evaluate((btn) => {
        const rect = btn.getBoundingClientRect();
        return {
          text: btn.textContent?.trim(),
          isOnLeft: rect.left < 100, // Left toolbar area
          position: { x: rect.left, y: rect.top },
          size: { width: rect.width, height: rect.height },
          hasIcon: btn.querySelector('svg') !== null,
          className: btn.className
        };
      }, button);
      
      if (buttonInfo.isOnLeft && buttonInfo.size.width > 30) { // Icon buttons are typically 40x40
        iconButtons.push({
          index: i,
          ...buttonInfo
        });
      }
    }
    
    console.log(`🎯 Found ${iconButtons.length} icon buttons on the left`);
    
    // Test each icon button
    for (let i = 0; i < iconButtons.length; i++) {
      const buttonInfo = iconButtons[i];
      console.log(`\n🔘 Testing button ${i + 1}:`);
      console.log(`   Position: (${buttonInfo.position.x}, ${buttonInfo.position.y})`);
      console.log(`   Size: ${buttonInfo.size.width}x${buttonInfo.size.height}`);
      console.log(`   Has icon: ${buttonInfo.hasIcon}`);
      console.log(`   Class: ${buttonInfo.className.substring(0, 50)}...`);
      
      // Count objects before clicking
      const objectsBefore = await page.evaluate(() => {
        const stage = document.querySelector('.konvajs-content');
        return stage ? stage.children.length : 0;
      });
      
      // Click the button
      const button = leftToolbarButtons[buttonInfo.index];
      await button.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Count objects after clicking
      const objectsAfter = await page.evaluate(() => {
        const stage = document.querySelector('.konvajs-content');
        return stage ? stage.children.length : 0;
      });
      
      console.log(`   Objects before: ${objectsBefore}, after: ${objectsAfter}`);
      
      if (objectsAfter > objectsBefore) {
        console.log(`   ✅ SUCCESS! Created ${objectsAfter - objectsBefore} objects`);
      } else {
        console.log(`   ⚠️ No objects created (might be select tool)`);
      }
      
      // Now try clicking on canvas to see if tool is active
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
        
        console.log(`   🎯 Testing canvas click at (${clickX}, ${clickY})`);
        await page.mouse.click(clickX, clickY);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const objectsAfterCanvasClick = await page.evaluate(() => {
          const stage = document.querySelector('.konvajs-content');
          return stage ? stage.children.length : 0;
        });
        
        console.log(`   Objects after canvas click: ${objectsAfterCanvasClick}`);
        
        if (objectsAfterCanvasClick > objectsAfter) {
          console.log(`   🎉 TOOL WORKS! Created ${objectsAfterCanvasClick - objectsAfter} objects on canvas`);
        } else {
          console.log(`   ❌ Tool doesn't create objects on canvas click`);
        }
      }
    }
    
    console.log('\n🎉 Icon button testing completed!');
    
    // Keep browser open to see results
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testIconButtons().catch(console.error);
