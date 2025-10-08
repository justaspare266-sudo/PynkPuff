const puppeteer = require('puppeteer');

async function testImageEditor() {
  console.log('🚀 Starting Image Editor Test...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true to run headless
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    // Enable console logging
    page.on('console', msg => {
      console.log('Browser Console:', msg.text());
    });
    
    // Listen for errors
    page.on('pageerror', error => {
      console.error('Page Error:', error.message);
    });
    
    console.log('📱 Navigating to editor...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    
    // Wait for the editor to load
    console.log('⏳ Waiting for editor to load...');
    await page.waitForSelector('[data-testid="canvas-stage"], canvas, .konvajs-content', { timeout: 10000 });
    
    // Check if the editor loaded
    const editorLoaded = await page.evaluate(() => {
      // Look for Konva stage or canvas elements
      const stage = document.querySelector('.konvajs-content');
      const canvas = document.querySelector('canvas');
      return !!(stage || canvas);
    });
    
    if (editorLoaded) {
      console.log('✅ Editor loaded successfully!');
    } else {
      console.log('❌ Editor failed to load - no canvas found');
    }
    
    // Test tool selection
    console.log('🔧 Testing tool selection...');
    const toolButtons = await page.$$('[data-testid="tool-button"], button[role="button"]');
    console.log(`Found ${toolButtons.length} potential tool buttons`);
    
    // Test clicking on canvas
    console.log('🎯 Testing canvas interaction...');
    const canvas = await page.$('canvas');
    if (canvas) {
      console.log('✅ Canvas found');
      
      // Get canvas position and size
      const canvasInfo = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          };
        }
        return null;
      });
      
      if (canvasInfo) {
        console.log('Canvas info:', canvasInfo);
        
        // Click in the center of the canvas
        const centerX = canvasInfo.x + canvasInfo.width / 2;
        const centerY = canvasInfo.y + canvasInfo.height / 2;
        
        console.log(`Clicking at (${centerX}, ${centerY})`);
        await page.mouse.click(centerX, centerY);
        
        // Wait a bit to see if anything happens
        await page.waitForTimeout(1000);
        
        // Check if any objects were created
        const objectsCreated = await page.evaluate(() => {
          // Look for Konva objects in the DOM
          const konvaContainer = document.querySelector('.konvajs-content');
          if (konvaContainer) {
            const objects = konvaContainer.querySelectorAll('canvas');
            return objects.length > 1; // Should have at least 2 canvases (stage + objects)
          }
          return false;
        });
        
        if (objectsCreated) {
          console.log('✅ Objects appear to be created on canvas click');
        } else {
          console.log('❌ No objects created on canvas click');
        }
      }
    } else {
      console.log('❌ No canvas found');
    }
    
    // Test drag functionality
    console.log('🖱️ Testing drag functionality...');
    if (canvas) {
      const canvasInfo = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          };
        }
        return null;
      });
      
      if (canvasInfo) {
        // Try to drag from one point to another
        const startX = canvasInfo.x + canvasInfo.width / 2;
        const startY = canvasInfo.y + canvasInfo.height / 2;
        const endX = startX + 50;
        const endY = startY + 50;
        
        console.log(`Dragging from (${startX}, ${startY}) to (${endX}, ${endY})`);
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 10 });
        await page.mouse.up();
        
        await page.waitForTimeout(500);
        console.log('✅ Drag test completed');
      }
    }
    
    // Check for any JavaScript errors
    const errors = await page.evaluate(() => {
      return window.errors || [];
    });
    
    if (errors.length > 0) {
      console.log('❌ JavaScript errors found:', errors);
    } else {
      console.log('✅ No JavaScript errors detected');
    }
    
    console.log('🎉 Test completed!');
    
    // Keep browser open for a few seconds to see the result
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testImageEditor().catch(console.error);
