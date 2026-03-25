const puppeteer = require('puppeteer-core');
(async () => {
    const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('https://www.linkedin.com/in/vineet0713', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test_profile.png' });
    
    // Check if we are logged in
    const title = await page.title();
    console.log("Page Title:", title);
    
    // Dump outer HTML to see what's there
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    const fs = require('fs');
    fs.writeFileSync('test_profile.html', html);
    
    await browser.disconnect();
})();
