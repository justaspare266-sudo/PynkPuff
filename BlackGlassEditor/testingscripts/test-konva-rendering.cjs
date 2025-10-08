const puppeteer = require('puppeteer');

async function testKonvaRendering() {
  console.log('🔍 Testing Konva Rendering...');
  
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
    
    // Take a screenshot to see what's actually rendered
    await page.screenshot({ path: 'konva-rendering-test.png', fullPage: true });
    console.log('📸 Screenshot saved as konva-rendering-test.png');
    
    // Check for any rectangles in the canvas
    const canvas = await page.$('canvas');
    if (canvas) {
      const box = await canvas.boundingBox();
      if (box) {
        console.log(`Canvas position: x=${box.x}, y=${box.y}, width=${box.width}, height=${box.height}`);
        
        // Check if there are any rectangles by looking at the canvas content
        const canvasData = await canvas.evaluate(el => {
          const ctx = el.getContext('2d');
          const imageData = ctx.getImageData(0, 0, el.width, el.height);
          return imageData.data.length;
        });
        console.log(`Canvas data length: ${canvasData}`);
        
        // Look for any elements with specific attributes
        const allElements = await page.$$('*');
        let rectElements = 0;
        let konvaElements = 0;
        
        for (let el of allElements) {
          const tagName = await el.evaluate(e => e.tagName);
          const className = await el.evaluate(e => e.className);
          const name = await el.evaluate(e => e.getAttribute('name') || '');
          
          if (tagName === 'rect') {
            rectElements++;
            console.log(`Found rect element: class="${className}", name="${name}"`);
          }
          
          if ((typeof className === 'string' && className.includes('konva')) || (typeof name === 'string' && name.includes('konva'))) {
            konvaElements++;
            console.log(`Found Konva element: class="${className}", name="${name}"`);
          }
        }
        
        console.log(`Total rect elements: ${rectElements}`);
        console.log(`Total Konva elements: ${konvaElements}`);
      }
    }
    
    console.log('🎉 Konva rendering test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testKonvaRendering().catch(console.error);
