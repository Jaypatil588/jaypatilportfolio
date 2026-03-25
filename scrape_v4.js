const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const fs = require('fs');
require('dotenv').config();

// Use Stealth and Recaptcha plugins
puppeteer.use(StealthPlugin());
puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: process.env.CAPTCHA_SOLVER_KEY || ''
        },
        visualFeedback: true
    })
);

(async () => {
    console.log("Connecting to browser...");
    const baseBrowser = await require('puppeteer-core').connect({ browserURL: 'http://localhost:9222' });
    
    // Pick a completely fresh device profile
    const deviceProfiles = [
        {
            ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            viewport: { width: 1920, height: 1080 },
            platform: "Win32",
            lang: "en-US"
        },
        {
            ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
            viewport: { width: 1512, height: 982 },
            platform: "MacIntel",
            lang: "en-US"
        },
        {
            ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
            viewport: { width: 1366, height: 768 },
            platform: "Win32",
            lang: "en-US"
        }
    ];
    const device = deviceProfiles[Math.floor(Math.random() * deviceProfiles.length)];
    console.log(`Using device profile: ${device.ua.substring(0, 60)}...`);

    const page = await baseBrowser.newPage();
    await page.setUserAgent(device.ua);
    await page.setViewport({ ...device.viewport, deviceScaleFactor: 2 });

    // Deep stealth overrides
    await page.evaluateOnNewDocument((dev) => {
        // Remove webdriver flag
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        // Spoof platform
        Object.defineProperty(navigator, 'platform', { get: () => dev.platform });
        // Spoof languages
        Object.defineProperty(navigator, 'languages', { get: () => [dev.lang, 'en'] });
        Object.defineProperty(navigator, 'language', { get: () => dev.lang });
        // Chrome runtime
        window.chrome = { runtime: {}, loadTimes: () => {}, csi: () => {} };
        // Spoof plugins (non-empty)
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        // Spoof hardware concurrency
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
        // Spoof device memory
        Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
        // Override permissions query
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) =>
            parameters.name === 'notifications' ? Promise.resolve({ state: Notification.permission }) : originalQuery(parameters);
        // Spoof WebGL renderer
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(param) {
            if (param === 37445) return 'Intel Inc.';
            if (param === 37446) return 'Intel Iris OpenGL Engine';
            return getParameter.call(this, param);
        };
    }, device);

    const jitterWait = (min, max) => new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1) + min)));

    // Simulate a human reading pause (occasional long pauses)
    async function humanPause() {
        const roll = Math.random();
        if (roll < 0.3) {
            // 30% chance of a long "distracted" pause (30-90s)
            const pause = Math.floor(Math.random() * 60000) + 30000;
            console.log(`  (Taking a ${Math.round(pause/1000)}s break...)`);
            await new Promise(r => setTimeout(r, pause));
        } else {
            // Normal short pause (5-15s)
            await jitterWait(5000, 15000);
        }
    }

    async function humanScroll(targetPage) {
        await targetPage.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                let distance = 0;
                const timer = setInterval(() => {
                    // Small, variable scroll distances like a real person
                    distance = Math.floor(Math.random() * 150) + 30;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= document.body.scrollHeight || totalHeight > 15000) {
                        clearInterval(timer);
                        resolve();
                    }
                }, Math.floor(Math.random() * 800) + 500); // Slow scroll: 500-1300ms between scrolls
            });
        });
    }

    async function handleCaptcha(targetPage) {
        const isCaptcha = await targetPage.evaluate(() => {
            const text = document.body.innerText.toLowerCase();
            const title = document.title.toLowerCase();
            return title.includes('robot') || title.includes('captcha') || text.includes('unusual traffic');
        });

        if (isCaptcha) {
            console.log("⚠️ CAPTCHA detected!");
            if (process.env.CAPTCHA_SOLVER_KEY) {
                console.log("Attempting automatic solving...");
                try {
                    await targetPage.solveRecaptchas();
                    console.log("Solved!");
                } catch (err) {
                    console.log("Automatic solving failed:", err.message);
                }
            } else {
                console.log("No CAPTCHA_SOLVER_KEY found in .env. Please solve it manually in the browser window.");
            }

            let captchaStillThere = true;
            while (captchaStillThere) {
                captchaStillThere = await targetPage.evaluate(() => {
                    const text = document.body.innerText.toLowerCase();
                    const title = document.title.toLowerCase();
                    return title.includes('robot') || title.includes('captcha') || text.includes('unusual traffic');
                });
                if (captchaStillThere) {
                    await new Promise(r => setTimeout(r, 5000));
                }
            }
            console.log("✅ CAPTCHA cleared.");
        }
    }

    // --- LOGIN FLOW ---
    async function loginToLinkedIn(targetPage) {
        console.log("Checking LinkedIn login status...");
        try {
            await targetPage.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 45000 });
        } catch (e) {
            console.log("Feed page load issue (may be redirect):", e.message);
        }
        await jitterWait(3000, 5000);

        const currentUrl = targetPage.url();
        if (currentUrl.includes('/feed')) {
            console.log("✅ Already logged in to LinkedIn.");
            return;
        }

        console.log("Not logged in. Navigating to login page...");
        try {
            await targetPage.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 45000 });
        } catch (e) {
            console.log("Login page load issue:", e.message);
        }
        await jitterWait(3000, 5000);
        try { await handleCaptcha(targetPage); } catch(e) { /* page may have redirected */ }

        const email = process.env.LINKEDIN_EMAIL;
        const password = process.env.LINKEDIN_PASSWORD;

        if (!email || !password) {
            console.log("No LinkedIn credentials found in .env. Proceeding anonymously...");
            return;
        }

        try {
            // Wait for the login form to appear, try multiple selectors
            const emailSelector = await targetPage.evaluate(() => {
                if (document.querySelector('#username')) return '#username';
                if (document.querySelector('#session_key')) return '#session_key';
                if (document.querySelector('input[name="session_key"]')) return 'input[name="session_key"]';
                if (document.querySelector('input[type="email"]')) return 'input[type="email"]';
                return null;
            });

            const passSelector = await targetPage.evaluate(() => {
                if (document.querySelector('#password')) return '#password';
                if (document.querySelector('#session_password')) return '#session_password';
                if (document.querySelector('input[name="session_password"]')) return 'input[name="session_password"]';
                if (document.querySelector('input[type="password"]')) return 'input[type="password"]';
                return null;
            });

            if (!emailSelector || !passSelector) {
                console.log("Could not find login form fields. Please log in manually in the browser.");
                console.log("Waiting for manual login (checking every 5s)...");
                let loggedIn = false;
                while (!loggedIn) {
                    await new Promise(r => setTimeout(r, 5000));
                    const url = targetPage.url();
                    loggedIn = url.includes('/feed');
                }
                console.log("✅ Manual login detected.");
                return;
            }

            console.log(`Found login fields: ${emailSelector}, ${passSelector}`);
            await targetPage.click(emailSelector);
            await targetPage.type(emailSelector, email, { delay: Math.floor(Math.random() * 80) + 30 });
            await jitterWait(500, 1500);
            await targetPage.click(passSelector);
            await targetPage.type(passSelector, password, { delay: Math.floor(Math.random() * 80) + 30 });
            await jitterWait(500, 1500);

            // Find and click submit
            const submitSelector = await targetPage.evaluate(() => {
                if (document.querySelector('button[type="submit"]')) return 'button[type="submit"]';
                if (document.querySelector('button[data-litms-control-urn="login-submit"]')) return 'button[data-litms-control-urn="login-submit"]';
                return 'button[type="submit"]';
            });

            await Promise.all([
                targetPage.click(submitSelector),
                targetPage.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 })
            ]);

            console.log("Login submitted. Verifying...");
            await handleCaptcha(targetPage);
            await jitterWait(2000, 4000);

            const checkUrl = targetPage.url();
            if (checkUrl.includes('/feed') || checkUrl.includes('/checkpoint/')) {
                console.log("✅ Successfully logged in to LinkedIn.");
            } else {
                console.log("⚠️ Login may need verification. Current URL:", checkUrl);
                console.log("Please complete any verification in the browser. Waiting...");
                let loggedIn = false;
                while (!loggedIn) {
                    await new Promise(r => setTimeout(r, 5000));
                    const url = targetPage.url();
                    loggedIn = url.includes('/feed');
                }
                console.log("✅ Login verified.");
            }
        } catch (err) {
            console.log("Login error:", err.message);
            console.log("Please log in manually. Waiting...");
            let loggedIn = false;
            while (!loggedIn) {
                await new Promise(r => setTimeout(r, 5000));
                try {
                    const url = targetPage.url();
                    loggedIn = url.includes('/feed');
                } catch (e) { /* ignore */ }
            }
            console.log("✅ Manual login detected.");
        }
    }

    await loginToLinkedIn(page);

    // --- DATA LOADING ---
    let existingUrls = new Set();
    let existingNames = new Set();
    
    if (fs.existsSync('./blacklist.json')) {
        const blacklist = JSON.parse(fs.readFileSync('./blacklist.json'));
        blacklist.forEach(item => existingNames.add(item.name.toLowerCase().trim()));
    }

    if (fs.existsSync('./index.json')) {
        const indexData = JSON.parse(fs.readFileSync('./index.json'));
        indexData.forEach(item => { 
            if (item.url) existingUrls.add(item.url.toLowerCase().split('?')[0].split('#')[0].replace(/\/$/, ''));
            if (item.name) existingNames.add(item.name.toLowerCase().trim());
        });
    }

    const searchQueries = [
        'site:linkedin.com/in "Software Engineer" google "SDE I" -senior -staff',
        'site:linkedin.com/in "Software Engineer" google "SDE II" -senior -staff',
        'site:linkedin.com/in "Software Engineer" google "SCU" -senior -staff'
    ];

    console.log("Starting Crawl...");

    for (const query of searchQueries) {
        const sUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=30`;
        console.log(`\nSearching Google: ${query}`);
        
        try {
            await page.goto(sUrl, { waitUntil: 'networkidle2' });
            await handleCaptcha(page);
            await jitterWait(3000, 7000);

            const profileUrls = await page.evaluate(() => {
                const links = [];
                document.querySelectorAll('a').forEach(a => {
                    if (a.href.includes('linkedin.com/in/') && !a.href.includes('/pub/dir')) {
                        let u = a.href.split('?')[0];
                        if (u.endsWith('/')) u = u.slice(0, -1);
                        links.push(u);
                    }
                });
                return links;
            });

            console.log(`Found ${profileUrls.length} links.`);

            for (const url of profileUrls) {
                const norm = url.toLowerCase().split('?')[0].split('#')[0].replace(/\/$/, '');
                if (existingUrls.has(norm)) {
                    console.log(`  Skipping (duplicate URL): ${url}`);
                    continue;
                }
                
                // Add immediately so if it fails, subsequent fragments are skipped
                existingUrls.add(norm);

                console.log(`Processing: ${url}`);
                await jitterWait(30000, 60000); // 30-60 seconds between profiles, like a real person browsing
                
                try {
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
                    try { await handleCaptcha(page); } catch(e) {}
                    await jitterWait(8000, 15000); // Dwell on the page like reading it

                    const data = await page.evaluate(() => {
                        const nameRaw = document.title.split(' | ')[0] || "Unknown";
                        
                        // Wait for full load, sometimes sections take a bit
                        const extractSection = (sectionName) => {
                            const h2s = Array.from(document.querySelectorAll('h2, h3'));
                            const header = h2s.find(h => h && h.innerText && (h.innerText.trim().toLowerCase() === sectionName.toLowerCase() || h.innerText.trim().toLowerCase().includes(sectionName.toLowerCase())));
                            if (!header) return "Not listed";
                            
                            const section = header.closest('section') || header.closest('div.pvs-list__container');
                            if (!section || !section.innerText) return "Not listed";
                            
                            const ignoreWords = ['show all', 'see more', sectionName.toLowerCase(), 'skills'];
                            const lines = section.innerText.split('\n')
                                .map(line => line.trim())
                                .filter(line => line.length > 0)
                                .filter(line => !ignoreWords.some(w => line.toLowerCase() === w || line.toLowerCase().includes('show all')))
                                .filter(line => line !== 'Experience' && line !== 'Education' && line !== 'Projects');
                            
                            return lines.length ? lines.join('\n') : "Not listed";
                        };

                        return {
                            name: nameRaw.trim(),
                            about: extractSection('about'),
                            experience: extractSection('experience'),
                            education: extractSection('education'),
                            skills: extractSection('skills')
                        };
                    });

                    // Check for duplicate name
                    if (existingNames.has(data.name.toLowerCase())) {
                        console.log(`  Skipping (duplicate Name): ${data.name}`);
                        existingUrls.add(norm); // add to urls so we don't try again
                        continue;
                    }

                    // Check for empty profile
                    if (data.about === 'Not listed' && data.experience === 'Not listed' && data.education === 'Not listed') {
                        console.log(`  Discarding (empty profile, likely ineffective scrape): ${data.name}`);
                        continue; // Do not save or add to index/existingUrls to allow retry later
                    }

                    // Relevancy check (if role matches)
                    const isRelevant = await page.evaluate(() => {
                        const t = (document.querySelector('.text-body-medium.break-words')?.innerText || "").toLowerCase();
                        if (['senior', 'staff', 'lead', 'manager', 'principal'].some(w => t.includes(w))) return false;
                        return true;
                    });

                    if (!isRelevant) {
                        console.log("  Skipping (level too high)");
                        existingUrls.add(norm);
                        continue;
                    }

                    await humanScroll(page);
                    await humanPause(); // Random human-like pause
                    await page.evaluate(() => {
                        document.querySelectorAll('button, .inline-show-more-text__button')
                            .forEach(b => { if (b.innerText && b.innerText.toLowerCase().includes('see more')) b.click(); });
                    });
                    await jitterWait(1000, 2000);

                    // Re-extract in case expanding or scrolling loaded more data
                    const finalData = await page.evaluate(() => {
                        const nameRaw = document.title.split(' | ')[0] || "Unknown";
                        
                        const extractSection = (sectionName) => {
                            const h2s = Array.from(document.querySelectorAll('h2, h3'));
                            const header = h2s.find(h => h && h.innerText && (h.innerText.trim().toLowerCase() === sectionName.toLowerCase() || h.innerText.trim().toLowerCase().includes(sectionName.toLowerCase())));
                            if (!header) return "Not listed";
                            
                            const section = header.closest('section') || header.closest('div.pvs-list__container');
                            if (!section || !section.innerText) return "Not listed";
                            
                            const lines = section.innerText.split('\n')
                                .map(line => line.trim())
                                .filter(line => line.length > 0)
                                .filter(line => !['show all', 'see more'].some(w => line.toLowerCase().includes(w)));
                            
                            return lines.length ? lines.join('\n') : "Not listed";
                        };

                        return {
                            name: nameRaw.trim(),
                            about: extractSection('about'),
                            experience: extractSection('experience'),
                            education: extractSection('education'),
                            skills: extractSection('skills')
                        };
                    });
                    
                    // Final empty check
                     if (finalData.about === 'Not listed' && finalData.experience === 'Not listed' && finalData.education === 'Not listed') {
                        console.log(`  Discarding (empty profile after expansion): ${finalData.name}`);
                        continue; 
                    }

                    const filename = `./resumes/final_${finalData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.md`;
                    const md = `# ${finalData.name}\n\n- LinkedIn: ${url}\n\n## About\n${finalData.about}\n\n## Experience\n${finalData.experience}\n\n## Education\n${finalData.education}\n\n## Skills\n${finalData.skills}`;
                    
                    if (!fs.existsSync('./resumes')) fs.mkdirSync('./resumes');
                    fs.writeFileSync(filename, md);
                    console.log(`  Saved: ${filename}`);

                    existingNames.add(finalData.name.toLowerCase());
                    let idx = fs.existsSync('./index.json') ? JSON.parse(fs.readFileSync('./index.json')) : [];
                    idx.push({ name: finalData.name, url, file: filename, timestamp: new Date().toISOString() });
                    fs.writeFileSync('./index.json', JSON.stringify(idx, null, 2));

                } catch (e) {
                    console.log(`  Error on profile: ${e.message}`);
                }
            }
        } catch (e) {
            console.log(`Search error: ${e.message}`);
        }
    }

    console.log("Crawl complete.");
    await page.close();
    baseBrowser.disconnect();
})();
