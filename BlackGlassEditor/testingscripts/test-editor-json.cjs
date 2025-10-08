const puppeteer = require('puppeteer');
const fs = require('fs');

async function testImageEditorJSON() {
  const results = {
    timestamp: new Date().toISOString(),
    testName: "Image Editor Functionality Test",
    status: "running",
    tests: {},
    errors: [],
    warnings: [],
    summary: {}
  };

  console.log('🚀 Starting Image Editor JSON Test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Collect errors
    page.on('pageerror', error => {
      results.errors.push({
        type: 'pageerror',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
    
    // Test 1: Page Load
    console.log('📱 Testing page load...');
    try {
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
      results.tests.pageLoad = {
        status: 'passed',
        message: 'Page loaded successfully',
        url: 'http://localhost:3001'
      };
    } catch (error) {
      results.tests.pageLoad = {
        status: 'failed',
        message: error.message,
        url: 'http://localhost:3001'
      };
    }
    
    // Test 2: Canvas Detection
    console.log('🎨 Testing canvas detection...');
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const stage = document.querySelector('.konvajs-content');
      
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        return {
          found: true,
          width: canvas.width,
          height: canvas.height,
          displayWidth: rect.width,
          displayHeight: rect.height,
          position: { x: rect.left, y: rect.top },
          stage: !!stage,
          stageChildren: stage ? stage.children.length : 0
        };
      }
      return { found: false };
    });
    
    results.tests.canvasDetection = {
      status: canvasInfo.found ? 'passed' : 'failed',
      message: canvasInfo.found ? 'Canvas found and accessible' : 'Canvas not found',
      details: canvasInfo
    };
    
    // Test 3: UI Components Detection
    console.log('🔧 Testing UI components...');
    const uiInfo = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const toolbars = document.querySelectorAll('[class*="toolbar"], [class*="Toolbar"]');
      const leftToolbar = document.querySelector('[class*="LeftToolbar"]');
      const topToolbar = document.querySelector('[class*="TopToolbar"]');
      const propertiesPanel = document.querySelector('[class*="PropertiesPanel"]');
      
      return {
        totalButtons: buttons.length,
        buttonTexts: Array.from(buttons).map(btn => btn.textContent?.trim()).filter(Boolean),
        toolbars: toolbars.length,
        leftToolbar: !!leftToolbar,
        topToolbar: !!topToolbar,
        propertiesPanel: !!propertiesPanel,
        allElements: Array.from(document.querySelectorAll('*')).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          textContent: el.textContent?.trim().substring(0, 50)
        })).filter(el => el.textContent && el.textContent.length > 0)
      };
    });
    
    results.tests.uiComponents = {
      status: uiInfo.totalButtons > 0 ? 'passed' : 'failed',
      message: `Found ${uiInfo.totalButtons} buttons, ${uiInfo.toolbars} toolbars`,
      details: uiInfo
    };
    
    // Test 4: Tool Selection
    console.log('🛠️ Testing tool selection...');
    const toolSelectionInfo = await page.evaluate(() => {
      const toolButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent && (
          btn.textContent.includes('Select') ||
          btn.textContent.includes('Text') ||
          btn.textContent.includes('Rect') ||
          btn.textContent.includes('Circle') ||
          btn.textContent.includes('Shape')
        )
      );
      
      return {
        toolButtonsFound: toolButtons.length,
        toolButtonTexts: toolButtons.map(btn => btn.textContent.trim()),
        canClickTools: toolButtons.length > 0
      };
    });
    
    results.tests.toolSelection = {
      status: toolSelectionInfo.canClickTools ? 'passed' : 'failed',
      message: `Found ${toolSelectionInfo.toolButtonsFound} tool buttons`,
      details: toolSelectionInfo
    };
    
    // Test 5: Canvas Interaction
    console.log('🎯 Testing canvas interaction...');
    if (canvasInfo.found) {
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
      
      // Test clicking on canvas
      const clickResults = [];
      for (let i = 0; i < 3; i++) {
        const x = canvasRect.x + 100 + (i * 50);
        const y = canvasRect.y + 100 + (i * 50);
        
        const objectsBefore = await page.evaluate(() => {
          const stage = document.querySelector('.konvajs-content');
          return stage ? stage.children.length : 0;
        });
        
        await page.mouse.click(x, y);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const objectsAfter = await page.evaluate(() => {
          const stage = document.querySelector('.konvajs-content');
          return stage ? stage.children.length : 0;
        });
        
        clickResults.push({
          click: i + 1,
          position: { x, y },
          objectsBefore,
          objectsAfter,
          objectsCreated: objectsAfter - objectsBefore
        });
      }
      
      results.tests.canvasInteraction = {
        status: clickResults.some(r => r.objectsCreated > 0) ? 'passed' : 'failed',
        message: `Canvas clicks: ${clickResults.filter(r => r.objectsCreated > 0).length}/3 created objects`,
        details: {
          canvasRect,
          clickResults,
          totalObjectsCreated: clickResults.reduce((sum, r) => sum + r.objectsCreated, 0)
        }
      };
    } else {
      results.tests.canvasInteraction = {
        status: 'skipped',
        message: 'Canvas not found, skipping interaction test'
      };
    }
    
    // Test 6: Drag and Drop
    console.log('🖱️ Testing drag and drop...');
    if (canvasInfo.found) {
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
      
      const startX = canvasRect.x + canvasRect.width / 2;
      const startY = canvasRect.y + canvasRect.height / 2;
      const endX = startX + 50;
      const endY = startY + 50;
      
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 10 });
      await page.mouse.up();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      results.tests.dragAndDrop = {
        status: 'completed',
        message: 'Drag operation completed',
        details: {
          startPosition: { x: startX, y: startY },
          endPosition: { x: endX, y: endY }
        }
      };
    } else {
      results.tests.dragAndDrop = {
        status: 'skipped',
        message: 'Canvas not found, skipping drag test'
      };
    }
    
    // Test 7: Error Detection
    console.log('🚨 Checking for errors...');
    const errorInfo = await page.evaluate(() => {
      const reactErrorBoundary = document.querySelector('[data-react-error-boundary]');
      const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
      
      return {
        reactErrorBoundary: !!reactErrorBoundary,
        errorElements: errorElements.length,
        consoleErrors: window.consoleErrors || []
      };
    });
    
    results.tests.errorDetection = {
      status: errorInfo.reactErrorBoundary || errorInfo.consoleErrors.length > 0 ? 'failed' : 'passed',
      message: `React errors: ${errorInfo.reactErrorBoundary}, Console errors: ${errorInfo.consoleErrors.length}`,
      details: errorInfo
    };
    
    // Collect all console messages
    results.consoleMessages = consoleMessages;
    
    // Generate summary
    const testResults = Object.values(results.tests);
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    const skipped = testResults.filter(t => t.status === 'skipped').length;
    
    results.summary = {
      totalTests: testResults.length,
      passed,
      failed,
      skipped,
      successRate: `${Math.round((passed / testResults.length) * 100)}%`,
      overallStatus: failed === 0 ? 'passed' : 'failed'
    };
    
    results.status = 'completed';
    
    // Save results to JSON file
    const jsonOutput = JSON.stringify(results, null, 2);
    fs.writeFileSync('test-results.json', jsonOutput);
    
    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`📈 Success Rate: ${results.summary.successRate}`);
    console.log(`📄 Results saved to: test-results.json`);
    
    // Keep browser open briefly to see results
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    results.status = 'failed';
    results.errors.push({
      type: 'test_error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
  
  return results;
}

// Run the test
testImageEditorJSON().then(results => {
  console.log('\n🎉 Test completed!');
  console.log('Overall Status:', results.summary?.overallStatus || 'unknown');
}).catch(console.error);
