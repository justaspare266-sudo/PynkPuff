const puppeteer = require('puppeteer');

async function debugButtonClicks() {
  console.log('🔍 Debugging Button Clicks...');
  
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
    
    // Add click event listeners to all buttons
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
          console.log(`Button ${index} clicked:`, btn.textContent?.trim() || 'no text');
          console.log('Button classes:', btn.className);
          console.log('Button position:', btn.getBoundingClientRect());
        });
      });
    });
    
    // Find left toolbar buttons
    const leftButtons = await page.$$('button');
    const iconButtons = [];
    
    for (let i = 0; i < leftButtons.length; i++) {
      const button = leftButtons[i];
      const buttonInfo = await page.evaluate((btn) => {
        const rect = btn.getBoundingClientRect();
        return {
          isOnLeft: rect.left < 100,
          size: { width: rect.width, height: rect.height },
          text: btn.textContent?.trim(),
          className: btn.className,
          disabled: btn.disabled,
          pointerEvents: getComputedStyle(btn).pointerEvents
        };
      }, button);
      
      if (buttonInfo.isOnLeft && buttonInfo.size.width > 30) {
        iconButtons.push({
          index: i,
          button,
          info: buttonInfo
        });
      }
    }
    
    console.log(`\n🎯 Found ${iconButtons.length} icon buttons on the left`);
    
    // Test each button
    for (let i = 0; i < Math.min(iconButtons.length, 3); i++) {
      const { index, button, info } = iconButtons[i];
      console.log(`\n🔘 Testing button ${i + 1} (index ${index}):`);
      console.log(`   Text: "${info.text}"`);
      console.log(`   Size: ${info.size.width}x${info.size.height}`);
      console.log(`   Disabled: ${info.disabled}`);
      console.log(`   Pointer events: ${info.pointerEvents}`);
      console.log(`   Classes: ${info.className.substring(0, 100)}...`);
      
      // Try different click methods
      console.log('   Method 1: Direct click');
      try {
        await button.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log('   Method 1 failed:', error.message);
      }
      
      console.log('   Method 2: Mouse click');
      try {
        await page.mouse.click(info.size.width / 2, info.size.height / 2);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log('   Method 2 failed:', error.message);
      }
      
      console.log('   Method 3: Evaluate click');
      try {
        await page.evaluate((btn) => btn.click(), button);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log('   Method 3 failed:', error.message);
      }
    }
    
    console.log('\n📊 Console Messages:');
    consoleMessages.forEach(msg => {
      console.log(`[${msg.type}] ${msg.text}`);
    });
    
    console.log('\n🎉 Button click debugging completed!');
    
    // Keep browser open to inspect
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugButtonClicks().catch(console.error);
