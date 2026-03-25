const puppeteer = require('puppeteer-core');
const fs = require('fs');

const TECH_KEYWORDS = [
    'java', 'python', 'c++', 'c#', 'javascript', 'typescript', 'go', 'golang', 'rust', 'ruby', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'spring boot', 'aws', 'gcp', 'azure',
    'docker', 'kubernetes', 'jenkins', 'ci/cd', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra',
    'kafka', 'rabbitmq', 'elasticsearch', 'graphql', 'rest api', 'machine learning', 'tensorflow', 'pytorch',
    'data structures', 'algorithms', 'distributed systems', 'microservices', 'git', 'linux', 'unix', 'bash'
];

(async () => {
    console.log("Connecting to browser...");
    const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
    const page = await browser.newPage();
    
    // Load blacklist
    let blacklist = [];
    if (fs.existsSync('./blacklist.json')) {
        blacklist = JSON.parse(fs.readFileSync('./blacklist.json')).map(item => item.name.toLowerCase());
    }

    console.log("Searching Google for Google SDEs...");
    const searchUrls = [
        'https://www.google.com/search?q=site:linkedin.com/in+intitle:"Software+Engineer+at+Google"&num=50',
        'https://www.google.com/search?q=site:linkedin.com/in+intitle:"Software+Engineer+at+Google"&num=50&start=50'
    ];
    
    let allProfileUrls = [];
    for (const sUrl of searchUrls) {
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
    }

    const uniqueUrls = [...new Set(allProfileUrls)];
    console.log(`Found ${uniqueUrls.length} potential profiles.`);

    const globalKeywordCounts = {};
    let processedCount = 0;
    const limit = 20; // Process up to 20 per run

    for (const url of uniqueUrls) {
        if (processedCount >= limit) break;

        console.log(`\n--- [${processedCount + 1}/${limit}] crawling: ${url} ---`);
        
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
            await new Promise(r => setTimeout(r, 2000));
            
            const name = await page.evaluate(() => document.title.split(' | ')[0] || 'Unknown');
            if (blacklist.includes(name.toLowerCase())) {
                console.log(`Skipping blacklisted profile: ${name}`);
                continue;
            }

            // Fast scroll to load lazy sections
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    let distance = 500;
                    let timer = setInterval(() => {
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight > 10000) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            });

            // Expand inline descriptions
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const matches = buttons.filter(b => b.innerText && b.innerText.toLowerCase().trim() === 'see more');
                matches.forEach(btn => { try { btn.click(); } catch(e) {} });
            });
            await new Promise(r => setTimeout(r, 1000));

            // Extract Data
            const profileData = await page.evaluate(() => {
                const nameText = document.title.split(' | ')[0] || 'Unknown';

                const extractSectionTexts = (sectionName) => {
                    const h2s = Array.from(document.querySelectorAll('h2, h3'));
                    const header = h2s.find(h => h.innerText.trim().toLowerCase() === sectionName.toLowerCase());
                    if (!header) return "Not listed.";
                    
                    const section = header.closest('section') || header.closest('div.pvs-list__container');
                    if (!section) return "Not listed.";
                    
                    const ignoreWords = ['show all', 'see more', sectionName.toLowerCase(), 'skills', 'experience', 'education', 'projects'];
                    const lines = section.innerText.split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .filter(line => !ignoreWords.some(w => line.toLowerCase() === w || line.toLowerCase().includes('show all')))
                        .filter(line => line !== 'Experience' && line !== 'Education' && line !== 'Projects');
                    
                    return lines.length ? lines.join('\n') : "Not listed.";
                };

                const extractFeaturedResume = () => {
                    const h2s = Array.from(document.querySelectorAll('h2, h3'));
                    const header = h2s.find(h => h.innerText.trim().toLowerCase() === 'featured');
                    if (!header) return "No featured section.";
                    const section = header.closest('section');
                    if (!section) return "Featured section container missing.";
                    const anchors = Array.from(section.querySelectorAll('a'));
                    const resumeLink = anchors.find(a => a.innerText.toLowerCase().includes('resume') || (a.href && a.href.toLowerCase().includes('resume')));
                    return resumeLink ? `Found potential resume link in Featured: ${resumeLink.href} (Text: ${resumeLink.innerText.trim()})` : "No resume link in featured.";
                };

                return {
                    name: nameText,
                    featured: extractFeaturedResume(),
                    about: extractSectionTexts('about'),
                    experience: extractSectionTexts('experience'),
                    education: extractSectionTexts('education'),
                    skills: extractSectionTexts('skills'),
                    projects: extractSectionTexts('projects')
                };
            });

            // Keyword analysis
            const fullText = (profileData.about + " " + profileData.experience + " " + profileData.education + " " + profileData.projects + " " + profileData.skills).toLowerCase();
            const localKeywordCounts = {};
            TECH_KEYWORDS.forEach(kw => {
                let regex;
                if (kw === 'c++') regex = /c\+\+/g;
                else if (kw === 'c#') regex = /c\#/g;
                else regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g');
                
                const count = (fullText.match(regex) || []).length;
                if (count > 0) {
                    localKeywordCounts[kw] = count;
                    globalKeywordCounts[kw] = (globalKeywordCounts[kw] || 0) + count;
                }
            });

            const sortedKeywords = Object.entries(localKeywordCounts).sort((a,b) => b[1] - a[1]);
            const keywordStr = sortedKeywords.map(k => `${k[0]}: ${k[1]}`).join(', ');

            // Markdown creation
            const md = `# ${profileData.name}

## Profile
- **LinkedIn:** ${url}
- **Featured Resume Info:** ${profileData.featured}

---

## Top Keywords
${keywordStr || "None detected."}

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
            
            if (!fs.existsSync('./resumes')) fs.mkdirSync('./resumes');
            const safeName = profileData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const filename = `./resumes/batch_${safeName}.md`;
            fs.writeFileSync(filename, md);
            console.log(`Saved: ${filename}`);

            // Update index.json
            let indexData = [];
            if (fs.existsSync('./index.json')) indexData = JSON.parse(fs.readFileSync('./index.json'));
            indexData.push({
                name: profileData.name,
                url: url,
                keywords: sortedKeywords.slice(0, 5).map(k => k[0]),
                file: filename,
                timestamp: new Date().toISOString()
            });
            fs.writeFileSync('./index.json', JSON.stringify(indexData, null, 2));

            processedCount++;
            await new Promise(r => setTimeout(r, 3000)); // Politeness delay

        } catch (e) {
            console.log(`Error crawling ${url}: ${e.message}`);
        }
    }

    console.log("\n--- BATCH COMPLETE ---");
    console.log("Global Tech Stats:", Object.entries(globalKeywordCounts).sort((a,b) => b[1] - a[1]).slice(0, 10));
    
    await page.close();
    browser.disconnect();
})();
