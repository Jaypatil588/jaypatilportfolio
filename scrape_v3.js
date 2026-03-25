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
    
    console.log("Searching Google for Google SDEs...");
    await page.goto('https://www.google.com/search?q=site:linkedin.com/in+intitle:"Software+Engineer+at+Google"&num=10', { waitUntil: 'domcontentloaded' });
    
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

    if (urls.length === 0) {
        console.log("No URLs found.");
        process.exit(1);
    }

    const targetUrl = [...new Set(urls)][0];
    console.log(`Crawling 1 profile to test: ${targetUrl}`);
    
    try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
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
        console.log("Navigation error:", e.message);
    }

    // Extract Data
    const profileData = await page.evaluate(() => {
        const name = document.title.split(' | ')[0] || 'Unknown';

        const extractSectionTexts = (sectionName) => {
            const h2s = Array.from(document.querySelectorAll('h2, h3'));
            const header = h2s.find(h => h.innerText.trim().toLowerCase() === sectionName.toLowerCase());
            if (!header) return "Not listed.";
            
            const section = header.closest('section') || header.closest('div.pvs-list__container');
            if (!section) return "Not listed.";
            
            const ignoreWords = ['show all', 'see more', sectionName.toLowerCase(), 'skills', 'experience', 'education', 'projects'];
            const lines = section.innerText.split('\\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .filter(line => !ignoreWords.some(w => line.toLowerCase() === w || line.toLowerCase().includes('show all')))
                .filter(line => line !== 'Experience' && line !== 'Education' && line !== 'Projects');
            
            return lines.length ? lines.join('\\n') : "Not listed.";
        };

        const extractFeaturedResume = () => {
            const h2s = Array.from(document.querySelectorAll('h2, h3'));
            const header = h2s.find(h => h.innerText.trim().toLowerCase() === 'featured');
            if (!header) return "No featured section.";
            
            const section = header.closest('section');
            if (!section) return "Featured section container missing.";

            // Look for links that might be a resume
            const anchors = Array.from(section.querySelectorAll('a'));
            const resumeLink = anchors.find(a => a.innerText.toLowerCase().includes('resume') || (a.href && a.href.toLowerCase().includes('resume')));
            
            if (resumeLink) {
                return `Found potential resume link in Featured: ${resumeLink.href} (Text: ${resumeLink.innerText.trim()})`;
            }
            return "Featured section found, but no obvious 'resume' link detected.";
        };

        return {
            name,
            featured: extractFeaturedResume(),
            about: extractSectionTexts('about'),
            experience: extractSectionTexts('experience'),
            education: extractSectionTexts('education'),
            skills: extractSectionTexts('skills'),
            projects: extractSectionTexts('projects')
        };
    });

    console.log(`Extracted name: ${profileData.name}`);
    console.log(`Featured status: ${profileData.featured}`);

    // Frequency counting
    const fullText = (profileData.about + " " + profileData.experience + " " + profileData.education + " " + profileData.projects + " " + profileData.skills).toLowerCase();
    
    // Simple word boundary regex matcher for keywords
    const keywordCounts = {};
    TECH_KEYWORDS.forEach(kw => {
        let regex;
        if (kw === 'c++') regex = /c\+\+/g;
        else if (kw === 'c#') regex = /c\#/g;
        else regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g');
        
        const count = (fullText.match(regex) || []).length;
        if (count > 0) {
            keywordCounts[kw] = count;
        }
    });

    const sortedKeywords = Object.entries(keywordCounts).sort((a,b) => b[1] - a[1]);
    const keywordStr = sortedKeywords.map(k => `${k[0]}: ${k[1]}`).join(', ');

    // Format to Markdown
    const md = `# ${profileData.name}

## Profile
- **LinkedIn:** ${targetUrl}
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
    
    // Save file
    const safeName = profileData.name === 'Unknown' ? 'unknown_' + Date.now() : profileData.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (!fs.existsSync('./resumes')) fs.mkdirSync('./resumes');
    const filename = `./resumes/test_001_${safeName}.md`;
    
    fs.writeFileSync(filename, md);
    console.log(`Saved to ${filename}`);

    // Update index.json
    let indexData = [];
    if (fs.existsSync('./index.json')) {
        indexData = JSON.parse(fs.readFileSync('./index.json'));
    }
    indexData.push({
        name: profileData.name,
        url: targetUrl,
        keywords: sortedKeywords.slice(0, 5).map(k => k[0]),
        file: filename,
        featuredResume: profileData.featured !== "No featured section." && !profileData.featured.includes('missing') && !profileData.featured.includes('no obvious')
    });
    fs.writeFileSync('./index.json', JSON.stringify(indexData, null, 2));
    
    console.log("Done checking 1 profile for validation.");
    await page.close();
    browser.disconnect();
})();
