const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
    console.log("Connecting to browser...");
    const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
    const page = await browser.newPage();
    
    // Randomized delay helper
    const jitterWait = (min, max) => new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1) + min)));
    
    // Load blacklist + existing index to avoid duplicates
    let skipNames = new Set();
    if (fs.existsSync('./blacklist.json')) {
        const blacklist = JSON.parse(fs.readFileSync('./blacklist.json'));
        blacklist.forEach(item => skipNames.add(item.name.toLowerCase()));
    }
    
    let existingUrls = new Set();
    if (fs.existsSync('./index.json')) {
        const indexData = JSON.parse(fs.readFileSync('./index.json'));
        indexData.forEach(item => {
            if (item.url) existingUrls.add(item.url.toLowerCase().split('?')[0].replace(/\/$/, ''));
            if (item.name) skipNames.add(item.name.toLowerCase());
        });
    }

    console.log("Searching Google for Google SDEs (I, II, III)...");
    const searchUrls = [
        'https://www.google.com/search?q=site:linkedin.com/in+"Software+Engineer"+google+"Mountain+View"+-senior+-staff+-principal&num=100',
        'https://www.google.com/search?q=site:linkedin.com/in+"Software+Engineer"+google+"New+York"+-senior+-staff+-principal&num=100',
        'https://www.google.com/search?q=site:linkedin.com/in+"Software+Engineer"+google+"Seattle"+-senior+-staff+-principal&num=100',
        'https://www.google.com/search?q=site:linkedin.com/in+"Software+Engineer"+google+"London"+-senior+-staff+-principal&num=100',
        'https://www.google.com/search?q=site:linkedin.com/in+"Software+Engineer"+google+"University"+-senior+-staff+-principal&num=100',
        'https://www.google.com/search?q=site:linkedin.com/in+"Software+Engineer"+google+"Internship"+-senior+-staff+-principal&num=100',
        'https://www.google.com/search?q=site:linkedin.com/in+"SDE"+google+"L3"+-senior+-staff+-principal&num=100',
        'https://www.google.com/search?q=site:linkedin.com/in+"SDE"+google+"L4"+-senior+-staff+-principal&num=100'
    ];
    
    let allProfileUrls = [];
    for (const sUrl of searchUrls) {
        try {
            await page.goto(sUrl, { waitUntil: 'domcontentloaded' });
            await new Promise(r => setTimeout(r, 2000));
            const urls = await page.evaluate(() => {
                const links = [];
                document.querySelectorAll('a[jsname="UWckNb"]').forEach(a => {
                    if (a.href.includes('linkedin.com/in/') && !a.href.includes('/pub/dir')) {
                        let u = a.href.split('?')[0];
                        if (u.endsWith('/')) u = u.slice(0, -1);
                        links.push(u);
                    }
                });
                return links;
            });
            allProfileUrls = allProfileUrls.concat(urls);
        } catch (e) {
            console.log(`Search error for ${sUrl}: ${e.message}`);
        }
    }

    const uniqueUrls = [...new Set(allProfileUrls)];
    console.log(`Found ${uniqueUrls.length} potential profiles.`);

    let processedCount = 0;
    const limit = 100; // New target batch size

    for (const url of uniqueUrls) {
        if (processedCount >= limit) break;
        
        const normalizedUrl = url.toLowerCase().split('?')[0].replace(/\/$/, '');
        if (existingUrls.has(normalizedUrl)) {
            console.log(`Skipping already scraped URL: ${url}`);
            continue;
        }

        console.log(`\n--- [${processedCount + 1}] crawling: ${url} ---`);
        
        try {
            await jitterWait(5000, 15000); // 5-15s delay between profiles
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await jitterWait(4000, 8000); // wait for initial render
            
            const rawName = await page.evaluate(() => document.title.split(' | ')[0] || 'Unknown');
            if (skipNames.has(rawName.toLowerCase()) && rawName !== 'Unknown') {
                console.log(`Skipping blacklisted/existing name: ${rawName}`);
                continue;
            }

            const titleStr = await page.evaluate(() => {
                const titleElement = document.querySelector('.text-body-medium.break-words') || document.querySelector('h1 + div');
                return titleElement ? titleElement.innerText.toLowerCase() : "";
            });

            const forbidden = ['senior', 'staff', 'principal', 'lead', 'manager', 'director', 'vp', 'head'];
            if (forbidden.some(word => titleStr.includes(word))) {
                console.log(`Skipping profile due to role title: "${titleStr}"`);
                continue;
            }

            // Scroll to load all sections
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    let distance = 300; // Slower scroll
                    let timer = setInterval(() => {
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight > 12000) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 400); // Slower interval (400ms)
                });
            });

            // Expand all descriptions
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const matches = buttons.filter(b => b.innerText && b.innerText.toLowerCase().trim().includes('see more'));
                matches.forEach(btn => { try { btn.click(); } catch(e) {} });
            });
            await new Promise(r => setTimeout(r, 1500));

            // Extract detailed structure
            const profileData = await page.evaluate(() => {
                const nameText = document.title.split(' | ')[0] || 'Unknown';
                const fullText = document.body.innerText;

                const extractSectionTexts = (sectionName) => {
                    const h2s = Array.from(document.querySelectorAll('h2, h3'));
                    const header = h2s.find(h => h.innerText.trim().toLowerCase().includes(sectionName.toLowerCase()));
                    if (!header) return "Not listed.";
                    
                    const section = header.closest('section') || header.closest('div.pvs-list__container');
                    if (!section) return "Not listed.";
                    
                    const ignoreWords = ['show all', 'see more'];
                    const lines = section.innerText.split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .filter(line => !ignoreWords.some(w => line.toLowerCase().includes(w)));
                    
                    return lines.length ? lines.join('\n') : "Not listed.";
                };

                const extractFeaturedResume = () => {
                    const h2s = Array.from(document.querySelectorAll('h2, h3'));
                    const header = h2s.find(h => h.innerText.trim().toLowerCase() === 'featured');
                    if (!header) return "No featured section.";
                    const section = header.closest('section');
                    if (!section) return "Featured section missing.";
                    const anchors = Array.from(section.querySelectorAll('a'));
                    const resumeLink = anchors.find(a => a.innerText.toLowerCase().includes('resume') || (a.href && a.href.toLowerCase().includes('resume')));
                    return resumeLink ? `Potential resume found: ${resumeLink.href}` : "No obvious resume link.";
                };

                return {
                    name: nameText,
                    featured: extractFeaturedResume(),
                    about: extractSectionTexts('about'),
                    experience: extractSectionTexts('experience'),
                    education: extractSectionTexts('education'),
                    projects: extractSectionTexts('projects'),
                    skills: extractSectionTexts('skills'),
                    fullPageDump: fullText
                };
            });

            // Save Markdown
            const safeName = profileData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const filename = `./resumes/final_${safeName}_${Date.now()}.md`;
            
            const md = `# ${profileData.name}

## Profile
- **LinkedIn:** ${url}
- **Featured Info:** ${profileData.featured}

---

## About
${profileData.about}

---

## Experience
${profileData.experience}

---

## Education
${profileData.education}

---

## Projects
${profileData.projects}

---

## Skills
${profileData.skills}

---

## Additional Info (Full Page Extraction)
${profileData.fullPageDump}
`;

            if (!fs.existsSync('./resumes')) fs.mkdirSync('./resumes');
            fs.writeFileSync(filename, md);
            console.log(`Saved: ${filename}`);

            // Update index
            let indexData = [];
            if (fs.existsSync('./index.json')) indexData = JSON.parse(fs.readFileSync('./index.json'));
            indexData.push({
                name: profileData.name,
                url: url,
                file: filename,
                level: titleStr,
                timestamp: new Date().toISOString()
            });
            fs.writeFileSync('./index.json', JSON.stringify(indexData, null, 2));

            processedCount++;
            await new Promise(r => setTimeout(r, 4000)); // Politeness

        } catch (e) {
            console.log(`Failed for ${url}: ${e.message}`);
        }
    }

    console.log(`\n--- Batch Complete: Processed ${processedCount} new profiles ---`);
    await page.close();
    browser.disconnect();
})();
