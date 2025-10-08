const puppeteer = require('puppeteer');

async function debugIcons() {
  console.log('🔍 Debugging Icons...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Capture all console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      console.log('❌ ERROR:', text);
    } else if (type === 'warn') {
      console.log('⚠️ WARN:', text);
    } else if (type === 'log') {
      console.log('📝 LOG:', text);
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
      console.log('✅ Left toolbar found');
      
      // Get the first button and check its content
      const firstButton = await leftToolbar.$('button');
      if (firstButton) {
        console.log('✅ First button found');
        
        // Check if there are any SVG elements inside
        const svgElements = await firstButton.$$('svg');
        console.log(`Found ${svgElements.length} SVG elements in first button`);
        
        if (svgElements.length > 0) {
          const svg = svgElements[0];
          const svgHTML = await svg.evaluate(el => el.outerHTML);
          console.log('SVG HTML:', svgHTML);
        }
        
        // Check the button's computed styles
        const styles = await firstButton.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            color: computed.color,
            fontSize: computed.fontSize,
            width: computed.width,
            height: computed.height
          };
        });
        console.log('Button styles:', styles);
        
        // Check if the button is clickable
        const isClickable = await firstButton.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return {
            width: rect.width,
            height: rect.height,
            visible: rect.width > 0 && rect.height > 0
          };
        });
        console.log('Button clickability:', isClickable);
        
        // Try to click the first button
        console.log('🖱️ Clicking first button...');
        await firstButton.click();
        console.log('✅ First button clicked');
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if any tool selection happened
        const allButtons = await page.$$('button');
        let selectedButton = null;
        for (let btn of allButtons) {
          const className = await btn.evaluate(el => el.className);
          if (className.includes('bg-white/20')) {
            selectedButton = btn;
            break;
          }
        }
        
        if (selectedButton) {
          console.log('✅ Found selected button');
        } else {
          console.log('❌ No selected button found');
        }
      }
    }
    
    console.log('🎉 Icon debugging completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugIcons().catch(console.error);
