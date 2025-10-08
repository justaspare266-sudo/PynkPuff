const puppeteer = require('puppeteer');

async function testFinalIntegration() {
  console.log('🎉 Testing Final Integrated Advanced Editor...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });
    
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
      console.log(`[${msg.type()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      console.error('❌ Page Error:', error.message);
    });
    
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    
    // Wait for the editor to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 1: Check if all UI components are present
    const uiComponents = await page.evaluate(() => {
      const topToolbar = document.querySelector('[class*="TopToolbar"]') || document.querySelector('[data-testid="top-toolbar"]');
      const leftToolbar = document.querySelector('[class*="LeftToolbar"]') || document.querySelector('[data-testid="left-toolbar"]');
      const propertiesPanel = document.querySelector('[class*="PropertiesPanel"]') || document.querySelector('[data-testid="properties-panel"]');
      const canvas = document.querySelector('canvas');
      const stage = document.querySelector('.konvajs-content');
      
      return {
        topToolbar: !!topToolbar,
        leftToolbar: !!leftToolbar,
        propertiesPanel: !!propertiesPanel,
        canvas: !!canvas,
        stage: !!stage,
        canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null
      };
    });
    
    console.log('📊 UI Components:', uiComponents);
    
    // Test 2: Check if shapes are rendered
    const shapesInfo = await page.evaluate(() => {
      const stage = document.querySelector('.konvajs-content');
      if (!stage) return { shapesFound: 0, shapes: [] };
      
      const shapes = Array.from(stage.children).map(child => ({
        tagName: child.tagName,
        className: child.className,
        id: child.id
      }));
      
      return {
        shapesFound: shapes.length,
        shapes: shapes
      };
    });
    
    console.log('📊 Shapes Info:', shapesInfo);
    
    // Test 3: Test tool selection and object creation
    if (uiComponents.leftToolbar) {
      console.log('🔧 Testing tool selection...');
      
      // Try to find and click tool buttons
      const toolButtons = await page.$$('button[class*="tool"]');
      console.log(`Found ${toolButtons.length} potential tool buttons`);
      
      if (toolButtons.length > 0) {
        // Click the first tool button (usually text tool)
        await toolButtons[0].click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Click on canvas to create object
        const canvas = await page.$('canvas');
        if (canvas) {
          const canvasRect = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            const rect = canvas.getBoundingClientRect();
            return {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            };
          });
          
          await page.mouse.click(canvasRect.x, canvasRect.y);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if object was created
          const afterClick = await page.evaluate(() => {
            const stage = document.querySelector('.konvajs-content');
            return {
              stageChildren: stage ? stage.children.length : 0,
              objects: stage ? Array.from(stage.children).map(child => ({
                tagName: child.tagName,
                className: child.className,
                id: child.id
              })) : []
            };
          });
          
          console.log('📊 After Tool Click:', afterClick);
        }
      }
    }
    
    // Test 4: Test theme switching
    console.log('🎨 Testing theme switching...');
    const themeButtons = await page.$$('button[class*="theme"]');
    if (themeButtons.length > 0) {
      await themeButtons[0].click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Theme switch attempted');
    }
    
    // Test 5: Test properties panel
    if (uiComponents.propertiesPanel) {
      console.log('⚙️ Testing properties panel...');
      
      // Try to find input fields in properties panel
      const inputs = await page.$$('input, select, textarea');
      console.log(`Found ${inputs.length} input elements`);
      
      if (inputs.length > 0) {
        // Try to interact with first input
        await inputs[0].focus();
        await inputs[0].type('Test Value');
        console.log('✅ Properties panel interaction attempted');
      }
    }
    
    // Test 6: Test advanced features
    console.log('🚀 Testing advanced features...');
    
    // Check for gradient controls
    const gradientControls = await page.$$('[class*="gradient"]');
    console.log(`Found ${gradientControls.length} gradient controls`);
    
    // Check for font controls
    const fontControls = await page.$$('[class*="font"]');
    console.log(`Found ${fontControls.length} font controls`);
    
    // Check for alignment controls
    const alignControls = await page.$$('[class*="align"]');
    console.log(`Found ${alignControls.length} alignment controls`);
    
    console.log('\n📊 Final Results:');
    console.log('✅ Canvas:', uiComponents.canvas ? 'Working' : 'Missing');
    console.log('✅ Stage:', uiComponents.stage ? 'Working' : 'Missing');
    console.log('✅ Shapes:', shapesInfo.shapesFound > 0 ? `${shapesInfo.shapesFound} found` : 'None');
    console.log('✅ UI Components:', Object.values(uiComponents).filter(Boolean).length + '/5 working');
    console.log('✅ Advanced Features:', gradientControls.length + fontControls.length + alignControls.length + ' controls found');
    
    console.log('\n🎉 Final integration test completed!');
    
    // Keep browser open to see the results
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testFinalIntegration().catch(console.error);
