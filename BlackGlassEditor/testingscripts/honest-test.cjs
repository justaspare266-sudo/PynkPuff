const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 HONEST FUNCTIONALITY TEST');
  console.log('=============================');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('📝 Browser:', msg.text()));
  
  try {
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    console.log('✅ Editor loaded on port 3002');
    
    // Test 1: Basic UI Elements
    console.log('\n🎯 TEST 1: Basic UI Elements');
    const canvas = await page.$('.canvas-container');
    console.log('Canvas container:', canvas ? '✅ Found' : '❌ Missing');
    
    const toolbar = await page.$('[class*="toolbar"]');
    console.log('Toolbar:', toolbar ? '✅ Found' : '❌ Missing');
    
    // Test 2: Tool Buttons
    console.log('\n🎯 TEST 2: Tool Buttons');
    const buttons = await page.$$('button');
    console.log('Total buttons found:', buttons.length);
    
    const textButton = await page.$('button[class*="tool-text"]');
    console.log('Text tool button:', textButton ? '✅ Found' : '❌ Missing');
    
    const selectButton = await page.$('button[class*="tool-select"]');
    console.log('Select tool button:', selectButton ? '✅ Found' : '❌ Missing');
    
    // Test 3: Shape Creation
    console.log('\n🎯 TEST 3: Shape Creation');
    if (textButton) {
      await textButton.click();
      console.log('✅ Clicked text tool');
      
      await page.click('.canvas-container', { position: { x: 200, y: 200 } });
      console.log('✅ Clicked canvas');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const konvaElements = await page.$$('[class*="konva"]');
      console.log('Konva elements after click:', konvaElements.length);
    }
    
    // Test 4: Animation Timeline
    console.log('\n🎯 TEST 4: Animation Timeline');
    const timeline = await page.$('[class*="timeline"]');
    console.log('Animation timeline:', timeline ? '✅ Found' : '❌ Missing');
    
    const animationTool = await page.$('[class*="animation"]');
    console.log('Animation tool:', animationTool ? '✅ Found' : '❌ Missing');
    
    // Test 5: Panels
    console.log('\n🎯 TEST 5: Panels');
    const propertiesPanel = await page.$('[class*="properties"]');
    console.log('Properties panel:', propertiesPanel ? '✅ Found' : '❌ Missing');
    
    const layersPanel = await page.$('[class*="layers"]');
    console.log('Layers panel:', layersPanel ? '✅ Found' : '❌ Missing');
    
    // Test 6: Save/Load
    console.log('\n🎯 TEST 6: Save/Load');
    const saveButton = await page.$('button:has-text("Save")');
    console.log('Save button:', saveButton ? '✅ Found' : '❌ Missing');
    
    const exportButton = await page.$('button:has-text("Export")');
    console.log('Export button:', exportButton ? '✅ Found' : '❌ Missing');
    
    console.log('\n📊 HONEST SUMMARY:');
    console.log('==================');
    console.log('✅ What works: Basic UI, some tool buttons');
    console.log('❌ What\'s missing: Animation timeline, working panels, save/load');
    console.log('🎨 Visual polish: High');
    console.log('⚙️ Functionality: Low');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  await browser.close();
})();
