const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
    console.log("Connecting to browser...");
    const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
    const page = await browser.newPage();
    
    console.log("Searching Google for Google SDEs...");
    const searchUrls = [
        'https://www.google.com/search?q=site:linkedin.com/in+intitle:"Software+Engineer+at+Google"&num=50',
        'https://www.google.com/search?q=site:linkedin.com/in+intitle:"Software+Engineer+at+Google"&num=50&start=50',
        'https://www.google.com/search?q=site:linkedin.com/in+intitle:"Software+Engineer+at+Google"&num=50&start=100'
    ];
    
    let allUrls = [];
    for (let sUrl of searchUrls) {
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
        allUrls = allUrls.concat(urls);
    }

    const uniqueUrls = [...new Set(allUrls)].slice(0, 30);
    console.log(`Found ${uniqueUrls.length} profile URLs:`, uniqueUrls);

    // Step 2: Scrape each profile
    for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        console.log(`\nCrawling [${i+1}/${uniqueUrls.length}]: ${url}`);
        
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
            await new Promise(r => setTimeout(r, 2000));
            
            // Fast scroll to load lazy sections
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    let distance = 400;
                    let timer = setInterval(() => {
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight > 10000) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 150);
                });
            });

            // Expand inline descriptions
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const matches = buttons.filter(b => b.innerText && b.innerText.toLowerCase().trim() === 'see more');
                matches.forEach(btn => { try { btn.click(); } catch(e) {} });
            });
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.log("Main navigation error:", e.message);
        }

        // 1. Extract Main Page Data
        const profileData = await page.evaluate(() => {
            const name = document.title.split(' | ')[0] || 'Unknown';

            const extractSectionTexts = (sectionName) => {
                // Find headers (h2)
                const h2s = Array.from(document.querySelectorAll('h2, h3'));
                const header = h2s.find(h => h.innerText.trim().toLowerCase() === sectionName.toLowerCase());
                if (!header) return "Not listed.";
                
                // Go up to the closest section or container wrapper
                const section = header.closest('section') || header.closest('div.pvs-list__container');
                if (!section) return "Not listed.";
                
                const ignoreWords = ['show all', 'see more', sectionName.toLowerCase(), 'skills'];
                const lines = section.innerText.split('\\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .filter(line => !ignoreWords.some(w => line.toLowerCase() === w || line.toLowerCase().includes('show all')))
                    .filter(line => line !== 'Experience' && line !== 'Education' && line !== 'Projects');
                
                return lines.length ? lines.join('\\n') : "Not listed.";
            };

            return {
                name,
                about: extractSectionTexts('about'),
                experience: extractSectionTexts('experience'),
                education: extractSectionTexts('education'),
                skills: extractSectionTexts('skills'),
                projects: extractSectionTexts('projects')
            };
        });

        console.log(`Extracted name: ${profileData.name}`);

        // Format to Markdown
        const md = `# ${profileData.name}

## Profile
- **LinkedIn:** ${url}

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
`;
        
        // Save file
        const safeName = profileData.name === 'Unknown' ? 'unknown_' + Date.now() : profileData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        // Resume numbering from 021 onwards
        const filename = `./resumes/${String(i + 21).padStart(3, '0')}_${safeName}.md`;
        
        fs.writeFileSync(filename, md);
        console.log(`Saved to ${filename}`);
        
        await new Promise(r => setTimeout(r, 2000)); // anti-rate-limit pause
    }

    console.log("Done extracting 30 profiles.");
    await page.close();
    browser.disconnect();
})();
