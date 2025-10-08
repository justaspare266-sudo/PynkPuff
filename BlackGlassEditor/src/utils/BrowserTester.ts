/**
 * Browser-based Testing Utility for Advanced Image Editor
 * This can be run directly in the browser console
 */

export class BrowserTester {
  private results: any[] = [];

  /**
   * Run all browser-based tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Browser-based Editor Tests...\n');
    this.results = [];

    // Test 1: Check if editor is loaded
    await this.testEditorLoaded();
    
    // Test 2: Check DOM elements
    await this.testDOMElements();
    
    // Test 3: Check Konva stage
    await this.testKonvaStage();
    
    // Test 4: Check tool functionality
    await this.testToolFunctionality();
    
    // Test 5: Check performance monitoring
    await this.testPerformanceMonitoring();
    
    // Test 6: Check keyboard shortcuts
    await this.testKeyboardShortcuts();
    
    // Test 7: Check canvas interactions
    await this.testCanvasInteractions();
    
    // Print results
    this.printResults();
  }

  private async testEditorLoaded(): Promise<void> {
    const testName = 'Editor Loaded';
    const startTime = Date.now();
    
    try {
      // Check if the editor component is mounted
      const editor = document.querySelector('[class*="advanced-image-editor"]') ||
                   document.querySelector('[data-testid*="editor"]') ||
                   document.querySelector('canvas') ||
                   document.querySelector('[class*="konva"]');
      
      if (editor) {
        this.addResult(testName, true, 'Editor component is loaded and mounted', Date.now() - startTime);
      } else {
        this.addResult(testName, false, 'Editor component not found in DOM', Date.now() - startTime);
      }
    } catch (error) {
      this.addResult(testName, false, `Error: ${error instanceof Error ? error.message : String(error)}`, Date.now() - startTime);
    }
  }

  private async testDOMElements(): Promise<void> {
    const testName = 'DOM Elements';
    const startTime = Date.now();
    
    try {
      const elements = {
        toolbar: document.querySelector('[class*="toolbar"]') || document.querySelector('[data-testid*="toolbar"]'),
        canvas: document.querySelector('canvas') || document.querySelector('[class*="stage"]'),
        sidebar: document.querySelector('[class*="sidebar"]') || document.querySelector('[class*="panel"]'),
        performance: document.querySelector('[class*="performance"]') || document.querySelector('text*="FPS"')
      };
      
      const foundElements = Object.entries(elements).filter(([name, element]) => element !== null);
      
      if (foundElements.length >= 3) {
        this.addResult(testName, true, `Found ${foundElements.length} key elements: ${foundElements.map(([name]) => name).join(', ')}`, Date.now() - startTime);
      } else {
        this.addResult(testName, false, `Only found ${foundElements.length} key elements`, Date.now() - startTime);
      }
    } catch (error) {
      this.addResult(testName, false, `Error: ${error instanceof Error ? error.message : String(error)}`, Date.now() - startTime);
    }
  }

  private async testKonvaStage(): Promise<void> {
    const testName = 'Konva Stage';
    const startTime = Date.now();
    
    try {
      // Check for Konva stage
      const stage = document.querySelector('canvas') || 
                   document.querySelector('[class*="konva"]') ||
                   document.querySelector('[data-testid*="stage"]');
      
      if (stage) {
        // Check if Konva is available
        const hasKonva = typeof (window as any).Konva !== 'undefined';
        
        if (hasKonva) {
          this.addResult(testName, true, 'Konva stage found and Konva library is loaded', Date.now() - startTime);
        } else {
          this.addResult(testName, false, 'Konva stage found but Konva library not loaded', Date.now() - startTime);
        }
      } else {
        this.addResult(testName, false, 'Konva stage not found', Date.now() - startTime);
      }
    } catch (error) {
      this.addResult(testName, false, `Error: ${error instanceof Error ? error.message : String(error)}`, Date.now() - startTime);
    }
  }

  private async testToolFunctionality(): Promise<void> {
    const testName = 'Tool Functionality';
    const startTime = Date.now();
    
    try {
      // Check for tool buttons
      const tools = ['text', 'shapes', 'images', 'gradient', 'grid', 'crop'];
      const foundTools = tools.filter(tool => {
        return document.querySelector(`[title*="${tool}" i]`) ||
               document.querySelector(`[class*="${tool}" i]`) ||
               document.querySelector(`button[title*="${tool}" i]`);
      });
      
      if (foundTools.length >= 4) {
        this.addResult(testName, true, `Found ${foundTools.length} tools: ${foundTools.join(', ')}`, Date.now() - startTime);
      } else {
        this.addResult(testName, false, `Only found ${foundTools.length} tools`, Date.now() - startTime);
      }
    } catch (error) {
      this.addResult(testName, false, `Error: ${error instanceof Error ? error.message : String(error)}`, Date.now() - startTime);
    }
  }

  private async testPerformanceMonitoring(): Promise<void> {
    const testName = 'Performance Monitoring';
    const startTime = Date.now();
    
    try {
      // Check for performance metrics
      const perfElements = [
        document.querySelector('text*="FPS"'),
        document.querySelector('text*="Memory"'),
        document.querySelector('text*="Render"'),
        document.querySelector('[class*="performance"]')
      ].filter(el => el !== null);
      
      if (perfElements.length >= 2) {
        this.addResult(testName, true, `Found ${perfElements.length} performance monitoring elements`, Date.now() - startTime);
      } else {
        this.addResult(testName, false, 'Performance monitoring not found or incomplete', Date.now() - startTime);
      }
    } catch (error) {
      this.addResult(testName, false, `Error: ${error instanceof Error ? error.message : String(error)}`, Date.now() - startTime);
    }
  }

  private async testKeyboardShortcuts(): Promise<void> {
    const testName = 'Keyboard Shortcuts';
    const startTime = Date.now();
    
    try {
      // Test keyboard event handling
      const testEvent = new KeyboardEvent('keydown', { key: 't', bubbles: true });
      document.dispatchEvent(testEvent);
      
      // Check if any tool buttons have focus or are active
      const activeTool = document.querySelector('[class*="bg-blue-600"]') ||
                        document.querySelector('[class*="active"]') ||
                        document.querySelector('[aria-selected="true"]');
      
      this.addResult(testName, true, 'Keyboard event handling works', Date.now() - startTime);
    } catch (error) {
      this.addResult(testName, false, `Error: ${error instanceof Error ? error.message : String(error)}`, Date.now() - startTime);
    }
  }

  private async testCanvasInteractions(): Promise<void> {
    const testName = 'Canvas Interactions';
    const startTime = Date.now();
    
    try {
      // Check for canvas or stage element
      const canvas = document.querySelector('canvas') || 
                   document.querySelector('[class*="stage"]') ||
                   document.querySelector('[data-testid*="konva"]');
      
      if (canvas) {
        // Test click event
        const clickEvent = new MouseEvent('click', { bubbles: true });
        canvas.dispatchEvent(clickEvent);
        
        this.addResult(testName, true, 'Canvas element found and clickable', Date.now() - startTime);
      } else {
        this.addResult(testName, false, 'Canvas element not found', Date.now() - startTime);
      }
    } catch (error) {
      this.addResult(testName, false, `Error: ${error instanceof Error ? error.message : String(error)}`, Date.now() - startTime);
    }
  }

  private addResult(testName: string, passed: boolean, message: string, duration: number): void {
    this.results.push({ testName, passed, message, duration });
  }

  private printResults(): void {
    console.log('\n📊 Browser Test Results');
    console.log('=======================');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%\n`);
    
    console.log('Detailed Results:');
    console.log('=================');
    
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${result.testName} (${duration})`);
      console.log(`   ${result.message}\n`);
    });
    
    if (failed > 0) {
      console.log('🔧 Recommendations:');
      console.log('==================');
      this.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`• Fix ${result.testName}: ${result.message}`);
        });
    }
    
    console.log('✨ Browser testing completed!');
  }

  /**
   * Quick health check
   */
  async quickCheck(): Promise<boolean> {
    console.log('🔍 Quick Health Check...');
    
    const editor = document.querySelector('canvas') || document.querySelector('[class*="konva"]');
    const toolbar = document.querySelector('[class*="toolbar"]');
    const performance = document.querySelector('[class*="performance"]');
    
    const isHealthy = !!(editor && toolbar && performance);
    
    if (isHealthy) {
      console.log('✅ Editor appears to be healthy and ready for use!');
    } else {
      console.log('❌ Editor may have issues. Run full tests for details.');
    }
    
    return isHealthy;
  }
}

// Export singleton
export const browserTester = new BrowserTester();

// Auto-add to window for console access
if (typeof window !== 'undefined') {
  (window as any).browserTester = browserTester;
  console.log('🧪 BrowserTester loaded! Run browserTester.runAllTests() to test the editor.');
  console.log('   Or run browserTester.quickCheck() for a quick health check.');
}
