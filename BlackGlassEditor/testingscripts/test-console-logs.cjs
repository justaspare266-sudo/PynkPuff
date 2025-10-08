const puppeteer = require('puppeteer');

async function testConsoleLogs() {
  console.log('🔍 Testing Console Logs...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: false,
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
    
    console.log('\n🎯 Clicking a tool button...');
    
    // Find and click the first icon button
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
    
    if (iconButtons.length > 0) {
      console.log(`Found ${iconButtons.length} icon buttons, clicking the first one...`);
      await iconButtons[0].click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('\n🎯 Clicking on canvas...');
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
        
        await page.mouse.click(clickX, clickY);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n📊 Console Messages:');
    consoleMessages.forEach(msg => {
      console.log(`[${msg.type}] ${msg.text}`);
    });
    
    console.log('\n🎉 Console log test completed!');
    
    // Keep browser open briefly
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testConsoleLogs().catch(console.error);
