const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/in/chensarahsong', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 4000));
    
    // Scroll down slowly
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 200;
            let timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight > 8000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });

    const html = await page.evaluate(() => document.documentElement.outerHTML);
    fs.writeFileSync('./debug_linkedin.html', html);
    console.log("Dumped HTML to debug_linkedin.html");
    
    await page.close();
    browser.disconnect();
})();
