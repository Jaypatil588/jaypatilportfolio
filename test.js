const TECH_KEYWORDS = ['java', 'python', 'javascript', 'docker'];
const fullText = "I have successfully used Java, JavaScript and Docker in production.";

const keywordCounts = {};
TECH_KEYWORDS.forEach(kw => {
    let regex;
    if (kw === 'c++') regex = /c\+\+/g;
    else if (kw === 'c#') regex = /c\#/g;
    else regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g');
    
    const count = (fullText.toLowerCase().match(regex) || []).length;
    if (count > 0) {
        keywordCounts[kw] = count;
    }
});
console.log(keywordCounts);
