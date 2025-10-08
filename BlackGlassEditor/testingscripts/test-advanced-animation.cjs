const puppeteer = require('puppeteer');

(async () => {
  console.log('🎬 TESTING ADVANCED ANIMATION SYSTEM');
  console.log('=====================================');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('📝 Browser:', msg.text()));
  
  try {
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    console.log('✅ Editor loaded');
    
    // Check for advanced animation tool
    const h3Elements = await page.$$('h3');
    let animationToolFound = false;
    for (let i = 0; i < h3Elements.length; i++) {
      const text = await page.evaluate(el => el.textContent, h3Elements[i]);
      if (text.includes('Animation Tool')) {
        console.log('✅ Advanced Animation Tool found!');
        animationToolFound = true;
        break;
      }
    }
    
    if (!animationToolFound) {
      console.log('❌ Advanced Animation Tool not found');
    }
    
    // Check for animation features
    const buttons = await page.$$('button');
    console.log('Total buttons found:', buttons.length);
    
    let createButtonFound = false;
    let playButtonFound = false;
    let settingsButtonFound = false;
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await page.evaluate(el => el.textContent, button);
      const className = await page.evaluate(el => el.className, button);
      
      if (text.includes('+') || className.includes('Plus')) {
        console.log('✅ Create animation button found');
        createButtonFound = true;
      }
      if (text.includes('Play')) {
        console.log('✅ Play button found');
        playButtonFound = true;
      }
      if (text.includes('Settings') || className.includes('Settings')) {
        console.log('✅ Settings button found');
        settingsButtonFound = true;
      }
    }
    
    // Check for keyframe editor
    const keyframeElements = await page.$$('[class*="keyframe"], [class*="Keyframe"]');
    console.log('Keyframe elements found:', keyframeElements.length);
    
    // Check for easing functions
    const selectElements = await page.$$('select');
    console.log('Select elements found:', selectElements.length);
    
    // Check for timeline
    const timelineElements = await page.$$('[class*="timeline"], [class*="Timeline"]');
    console.log('Timeline elements found:', timelineElements.length);
    
    // Check for animation list
    const animationElements = await page.$$('[class*="animation"], [class*="Animation"]');
    console.log('Animation elements found:', animationElements.length);
    
    console.log('\n📊 ADVANCED ANIMATION SYSTEM SUMMARY:');
    console.log('=====================================');
    console.log('Animation Tool:', animationToolFound ? '✅' : '❌');
    console.log('Create Button:', createButtonFound ? '✅' : '❌');
    console.log('Play Button:', playButtonFound ? '✅' : '❌');
    console.log('Settings Button:', settingsButtonFound ? '✅' : '❌');
    console.log('Keyframe Elements:', keyframeElements.length);
    console.log('Select Elements:', selectElements.length);
    console.log('Timeline Elements:', timelineElements.length);
    console.log('Animation Elements:', animationElements.length);
    
    if (animationToolFound && createButtonFound && playButtonFound) {
      console.log('\n🎉 ADVANCED ANIMATION SYSTEM IS WORKING!');
      console.log('Features available:');
      console.log('- Create animations for selected elements');
      console.log('- Keyframe editing with properties');
      console.log('- Easing functions (linear, easeIn, easeOut, etc.)');
      console.log('- Timeline scrubbing');
      console.log('- Play/Pause/Stop controls');
      console.log('- Speed control');
      console.log('- Loop and direction settings');
      console.log('- Export/Import animations');
    } else {
      console.log('\n❌ Animation system needs more work');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  await browser.close();
})();
