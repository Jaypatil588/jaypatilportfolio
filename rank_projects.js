const fs = require('fs');
const path = require('path');

// --- Google ATS Keywords (what Google looks for) ---
const GOOGLE_ATS_KEYWORDS = {
    // Core languages Google uses
    'python': 5, 'java': 5, 'c++': 5, 'golang': 4, 'javascript': 3, 'typescript': 3,
    'rust': 3, 'scala': 2, 'kotlin': 2, 'swift': 2,
    // Systems & infra (very Google)
    'distributed systems': 8, 'microservices': 5, 'kubernetes': 5, 'docker': 4,
    'grpc': 6, 'protocol buffers': 6, 'protobuf': 6,
    'google cloud': 5, 'gcp': 5, 'bigquery': 4, 'big query': 4,
    // ML/AI (huge at Google)
    'machine learning': 7, 'deep learning': 6, 'tensorflow': 7, 'pytorch': 5,
    'transformers': 6, 'bert': 6, 'nlp': 5, 'natural language processing': 5,
    'computer vision': 5, 'neural network': 5,
    // Data & backend
    'sql': 3, 'nosql': 3, 'api': 2, 'rest api': 3, 'rest apis': 3, 'graphql': 3,
    'redis': 3, 'mongodb': 2, 'postgresql': 3, 'firebase': 3, 'spark': 4, 'kafka': 4,
    // Algorithms & CS fundamentals
    'algorithms': 6, 'data structures': 6, 'operating systems': 4,
    'compilers': 5, 'networking': 3, 'encryption': 3,
    // Frontend (less weighted for SDE)
    'react': 2, 'angular': 2, 'vue': 2, 'html': 1, 'css': 1,
    'node.js': 2, 'express': 2, 'flask': 2, 'django': 2, 'spring': 3,
    // Cloud & DevOps
    'aws': 3, 'azure': 2, 'ci/cd': 3, 'terraform': 3, 'linux': 3,
    // Mobile
    'android': 3, 'ios': 2, 'react native': 2, 'flutter': 2,
};

// --- Concept detection ---
const CONCEPT_PATTERNS = [
    { pattern: /distribut|replicate|shard|partition|consensus|raft|paxos/i, concept: 'Distributed Systems' },
    { pattern: /machine learn|deep learn|neural|train.*model|classif|predict|regress/i, concept: 'Machine Learning' },
    { pattern: /nlp|natural language|sentiment|text.*classif|named entity|language model/i, concept: 'NLP' },
    { pattern: /computer vision|image.*recogni|object detect|face.*detect|opencv|cnn|convolution/i, concept: 'Computer Vision' },
    { pattern: /web.*app|full.*stack|frontend|backend|dashboard|website|portal/i, concept: 'Full-Stack Development' },
    { pattern: /api|rest|endpoint|microservice|service.*arch/i, concept: 'API / Microservices' },
    { pattern: /mobile.*app|android.*app|ios.*app|react.*native|flutter/i, concept: 'Mobile Development' },
    { pattern: /data.*pipeline|etl|data.*process|batch.*process|stream.*process/i, concept: 'Data Engineering' },
    { pattern: /security|encrypt|auth|oauth|vulnerab|penetra|cyber/i, concept: 'Security / Cryptography' },
    { pattern: /cloud|aws|gcp|azure|deploy|infra|devops|ci\/cd|container|docker|kubernet/i, concept: 'Cloud / DevOps' },
    { pattern: /database|sql|nosql|mongo|redis|storage|query|index/i, concept: 'Database Systems' },
    { pattern: /game|play|player|agent|minimax|chess|board/i, concept: 'Game AI / Algorithms' },
    { pattern: /compiler|parser|lexer|syntax|ast|interpreter|bytecode/i, concept: 'Compilers / Language Design' },
    { pattern: /network|socket|tcp|udp|packet|routing|protocol/i, concept: 'Networking' },
    { pattern: /os|kernel|thread|process|memory|scheduler|syscall/i, concept: 'Operating Systems' },
    { pattern: /search|rank|recommend|retriev|information.*retriev/i, concept: 'Search / Recommendation' },
    { pattern: /scrape|crawl|extract|automat/i, concept: 'Automation / Scraping' },
    { pattern: /test|ci|cd|pipeline|deploy|quality/i, concept: 'Testing / CI-CD' },
    { pattern: /blockchain|web3|smart.*contract|decentral/i, concept: 'Blockchain' },
    { pattern: /realtime|real-time|live|stream|websocket/i, concept: 'Real-time Systems' },
    { pattern: /optimi|performance|latency|throughput|scale|efficien/i, concept: 'Performance Optimization' },
];

function detectConcepts(text) {
    if (!text) return [];
    const found = new Set();
    for (const { pattern, concept } of CONCEPT_PATTERNS) {
        if (pattern.test(text)) found.add(concept);
    }
    return [...found];
}

function generateWhatItSolves(name, description, techStack, concepts) {
    const combined = `${name} ${description}`.toLowerCase();
    const parts = [];
    
    if (concepts.includes('Distributed Systems')) parts.push('Tackles distributed computing challenges like consistency, fault tolerance, and scalability');
    if (concepts.includes('Machine Learning')) parts.push('Applies ML models to solve prediction/classification problems');
    if (concepts.includes('NLP')) parts.push('Processes and understands human language data');
    if (concepts.includes('Computer Vision')) parts.push('Analyzes and interprets visual data');
    if (concepts.includes('Full-Stack Development')) parts.push('End-to-end application from UI to server');
    if (concepts.includes('API / Microservices')) parts.push('Builds service-oriented architecture with clean API boundaries');
    if (concepts.includes('Mobile Development')) parts.push('Native or cross-platform mobile application');
    if (concepts.includes('Data Engineering')) parts.push('Pipelines for processing and transforming large datasets');
    if (concepts.includes('Security / Cryptography')) parts.push('Addresses security, encryption, or authentication concerns');
    if (concepts.includes('Cloud / DevOps')) parts.push('Cloud infrastructure and deployment automation');
    if (concepts.includes('Database Systems')) parts.push('Data storage, querying, and optimization');
    if (concepts.includes('Game AI / Algorithms')) parts.push('Algorithmic problem-solving and game theory');
    if (concepts.includes('Performance Optimization')) parts.push('Focuses on speed, efficiency, and scalability');
    
    if (parts.length === 0) parts.push('General software engineering project');
    return parts.join('. ') + '.';
}

function computeGoogleATSScore(techStack, concepts, description) {
    let score = 0;
    // Tech stack scoring
    for (const tech of techStack) {
        score += GOOGLE_ATS_KEYWORDS[tech] || 0;
    }
    // Concept bonus
    const highValueConcepts = ['Distributed Systems', 'Machine Learning', 'NLP', 'Performance Optimization', 'Cloud / DevOps', 'Database Systems'];
    for (const c of concepts) {
        if (highValueConcepts.includes(c)) score += 3;
    }
    // Description richness bonus
    if (description && description.length > 100) score += 2;
    if (description && description.length > 300) score += 2;
    // Quantified results bonus
    if (/\d+%|\d+x|\d+ms|\d+s\b|\d+\s*(users|requests|records|items|million|billion)/i.test(description)) score += 3;

    return score;
}

// --- Load the existing extracted data ---
const rawData = JSON.parse(fs.readFileSync('./projects_techstack.json', 'utf-8'));

const allProjects = [];
let rank = 0;

for (const person of rawData) {
    // Process experience entries as "projects" too (pre-Google only)
    for (const exp of person.experience) {
        const co = (exp.company || '').toLowerCase();
        if (['google', '', 'full-time', 'part-time'].includes(co)) continue;
        if (exp.techStack.length === 0 && (!exp.description || exp.description.length < 30)) continue;
        
        const combined = `${exp.role} ${exp.description}`;
        const concepts = detectConcepts(combined);
        const atsScore = computeGoogleATSScore(exp.techStack, concepts, exp.description);
        
        allProjects.push({
            name: `${exp.role || 'Role'} @ ${exp.company}`,
            person: person.person,
            type: 'Experience',
            description: exp.description || '',
            techStack: exp.techStack,
            techCount: exp.techStack.length,
            concepts,
            whatItSolves: generateWhatItSolves(exp.role, exp.description, exp.techStack, concepts),
            atsScore,
        });
    }

    // Process actual projects
    for (const proj of person.projects) {
        if (proj.name === 'Not listed.' || proj.name === 'Not listed') continue;
        if (proj.techStack.length === 0 && (!proj.description || proj.description.length < 20)) continue;
        
        const combined = `${proj.name} ${proj.description}`;
        const concepts = detectConcepts(combined);
        const atsScore = computeGoogleATSScore(proj.techStack, concepts, proj.description);
        
        allProjects.push({
            name: proj.name,
            person: person.person,
            type: 'Project',
            description: proj.description || '',
            techStack: proj.techStack,
            techCount: proj.techStack.length,
            concepts,
            whatItSolves: generateWhatItSolves(proj.name, proj.description, proj.techStack, concepts),
            atsScore,
        });
    }
}

// Sort by ATS score descending
allProjects.sort((a, b) => b.atsScore - a.atsScore);
allProjects.forEach((p, i) => p.rank = i + 1);

// Save
fs.writeFileSync('./projects_ranked.json', JSON.stringify(allProjects, null, 2));
console.log(`Total projects/experience entries: ${allProjects.length}`);
console.log(`Top 10 by Google ATS score:`);
allProjects.slice(0, 10).forEach(p => {
    console.log(`  #${p.rank} [${p.atsScore}pts] ${p.name} (${p.person}) — ${p.concepts.join(', ')}`);
});

// Global stats
const techFreq = {};
allProjects.forEach(p => p.techStack.forEach(t => { techFreq[t] = (techFreq[t] || 0) + 1; }));
const techRanked = Object.entries(techFreq).sort((a, b) => b[1] - a[1]);

// Concept frequency
const conceptFreq = {};
allProjects.forEach(p => p.concepts.forEach(c => { conceptFreq[c] = (conceptFreq[c] || 0) + 1; }));
const conceptRanked = Object.entries(conceptFreq).sort((a, b) => b[1] - a[1]);

// Company frequency (pre-Google)
const companyFreq = {};
const googleAliases = ['google', 'google inc', 'google llc', 'alphabet', '', 'full-time', 'part-time'];
for (const person of rawData) {
    const seen = new Set();
    for (const exp of person.experience) {
        const co = (exp.company || '').trim();
        if (!co || googleAliases.includes(co.toLowerCase())) continue;
        if (seen.has(co.toLowerCase())) continue;
        seen.add(co.toLowerCase());
        companyFreq[co] = (companyFreq[co] || 0) + 1;
    }
}
const companyRanked = Object.entries(companyFreq).sort((a, b) => b[1] - a[1]);

// Save all distributions
const distributions = {
    techKeywords: techRanked.map(([k, v], i) => ({ rank: i+1, keyword: k, count: v, atsWeight: GOOGLE_ATS_KEYWORDS[k] || 0 })),
    concepts: conceptRanked.map(([k, v], i) => ({ rank: i+1, concept: k, count: v })),
    companies: companyRanked.map(([k, v], i) => ({ rank: i+1, company: k, count: v })),
};
fs.writeFileSync('./distributions.json', JSON.stringify(distributions, null, 2));

console.log(`\nTech keywords: ${techRanked.length}`);
techRanked.slice(0, 10).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log(`\nConcepts: ${conceptRanked.length}`);
conceptRanked.slice(0, 10).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log(`\nCompanies: ${companyRanked.length}`);
companyRanked.slice(0, 10).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
