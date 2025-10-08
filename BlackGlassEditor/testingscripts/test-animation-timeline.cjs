const puppeteer = require('puppeteer');

(async () => {
  console.log('🎬 TESTING ANIMATION TIMELINE');
  console.log('==============================');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('📝 Browser:', msg.text()));
  
  try {
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle0' });
    console.log('✅ Editor loaded');
    
    // Check for animation timeline
    const timelineTitle = await page.$('h3');
    if (timelineTitle) {
      const titleText = await page.evaluate(el => el.textContent, timelineTitle);
      console.log('Timeline title:', titleText);
      if (titleText.includes('Animation Timeline')) {
        console.log('✅ Animation timeline title found!');
      }
    }
    
    // Check for play/stop buttons
    const buttons = await page.$$('button');
    console.log('Total buttons found:', buttons.length);
    
    let playFound = false;
    let stopFound = false;
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await page.evaluate(el => el.textContent, button);
      if (text.includes('Play')) {
        console.log('✅ Play button found');
        playFound = true;
      }
      if (text.includes('Stop')) {
        console.log('✅ Stop button found');
        stopFound = true;
      }
    }
    
    // Check for timeline track
    const timelineTrack = await page.$('[class*="bg-gray-700"]');
    console.log('Timeline track:', timelineTrack ? '✅ Found' : '❌ Missing');
    
    // Check for playhead
    const playhead = await page.$('[class*="bg-blue-500"]');
    console.log('Playhead:', playhead ? '✅ Found' : '❌ Missing');
    
    // Check for animation tracks
    const animationTracks = await page.$$('[class*="bg-green-600"], [class*="bg-purple-600"]');
    console.log('Animation tracks:', animationTracks.length);
    
    console.log('\n📊 ANIMATION TIMELINE SUMMARY:');
    console.log('===============================');
    console.log('Timeline title:', timelineTitle ? '✅' : '❌');
    console.log('Play button:', playFound ? '✅' : '❌');
    console.log('Stop button:', stopFound ? '✅' : '❌');
    console.log('Timeline track:', timelineTrack ? '✅' : '❌');
    console.log('Playhead:', playhead ? '✅' : '❌');
    console.log('Animation tracks:', animationTracks.length);
    
    if (timelineTitle && playFound && stopFound && timelineTrack) {
      console.log('\n🎉 ANIMATION TIMELINE IS WORKING!');
    } else {
      console.log('\n❌ Animation timeline needs more work');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  await browser.close();
})();
