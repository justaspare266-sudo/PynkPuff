const puppeteer = require('puppeteer');

async function testAllTools() {
  console.log('🔍 Testing All Tools...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to the editor
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    
    // Wait for the editor to load
    await page.waitForSelector('.canvas-container', { timeout: 10000 });
    console.log('✅ Editor loaded successfully');
    
    // Find the left toolbar
    const leftToolbar = await page.$('.w-12.flex.flex-col.py-2.bg-black\\/80.backdrop-blur-md.border-r.border-white\\/10');
    if (leftToolbar) {
      console.log('✅ Left toolbar found');
      
      // Get all buttons in the left toolbar
      const buttons = await leftToolbar.$$('button');
      console.log(`Found ${buttons.length} buttons in left toolbar`);
      
      // Click each button and log the tool ID
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        
        // Click the button
        await button.click();
        console.log(`✅ Clicked button ${i}`);
        
        // Wait a moment for the click to register
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Now check if there are more buttons (like in the shapes popout)
      const allButtons = await page.$$('button');
      console.log(`\nTotal buttons on page: ${allButtons.length}`);
      
      // Look for any buttons that might be in a popout or dropdown
      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        const text = await button.evaluate(el => el.textContent || '');
        const title = await button.evaluate(el => el.title || '');
        const className = await button.evaluate(el => el.className || '');
        
        if (text.toLowerCase().includes('crop') || 
            title.toLowerCase().includes('crop') || 
            (typeof className === 'string' && className.toLowerCase().includes('crop'))) {
          console.log(`🎯 FOUND CROP BUTTON at index ${i}!`);
          console.log(`  Text: "${text}"`);
          console.log(`  Title: "${title}"`);
          console.log(`  Class: "${className.substring(0, 100)}..."`);
          
          // Try to click it
          await button.click();
          console.log('✅ Crop button clicked');
          
          // Wait for crop controls to appear
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check for aspect ratio controls
          const allButtonsAfter = await page.$$('button');
          let foundAspectControls = false;
          
          for (let btn of allButtonsAfter) {
            const btnText = await btn.evaluate(el => el.textContent);
            if (btnText && (btnText.includes('Free') || btnText.includes('1:1') || btnText.includes('4:3') || btnText.includes('16:9'))) {
              foundAspectControls = true;
              console.log(`Found aspect control: ${btnText}`);
            }
          }
          
          if (foundAspectControls) {
            console.log('✅ Aspect ratio controls found after clicking crop tool');
          } else {
            console.log('❌ Aspect ratio controls not found');
          }
        }
      }
    }
    
    console.log('🎉 All tools test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAllTools().catch(console.error);
