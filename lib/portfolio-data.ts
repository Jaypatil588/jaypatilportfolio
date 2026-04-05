export const portfolioData = {
  name: "Jay Patil",
  title: "Software Engineer",
  tagline: "I build scalable cloud-native applications",
  location: "Santa Clara, CA",
  email: "jaypatilsde@gmail.com",
  phone: "+1-669-367-0026",
  linkedin: "https://linkedin.com/in/jaypatil588",
  github: "https://github.com/Jaypatil588",
  leetcodeUsername: "jaypatil588",
  
  summary: `Software Engineer with 4 years of experience building scalable cloud-native applications, specializing in robust backend infrastructure, full-stack development, and integrating applied AI/ML workflows.`,

  skills: {
    languages: ["Python", "Java", "C", "C++", "C#", "JavaScript", "TypeScript", "SQL", "NoSQL"],
    frameworks: ["LangChain", "TensorFlow", "React.js", ".NET", "Spring Boot", "Spring Batch", "ASP.NET Core"],
    tools: ["Ansible", "Docker", "Kubernetes", "Terraform", "Jenkins", "Kafka"],
    cloud: ["AWS", "Google Cloud Platform (GCP)", "Azure", "Firebase", "CI/CD"],
  },

  experience: [
    {
      title: "Software Developer: Full Stack and UI",
      company: "Santa Clara University",
      location: "Santa Clara, CA",
      period: "Jun 2025 – Sep 2025",
      highlights: [
        "Engineered a finetuned OpenAI RAG chatbot for the Provost's office, improving context accuracy by 15% and search time by 50%.",
        "Built an interactive fellowships portal using Firebase and Azure SQL DB, improving data accessibility and search performance by 30%.",
        "Enhanced the Off-Campus Living website's searchability and WCAG accessibility using TerminalFour, ReactJS, and HTML."
      ]
    },
    {
      title: "ECC Lab Research Assistant",
      company: "Santa Clara University",
      location: "Santa Clara, CA",
      period: "Jan 2025 – Sep 2025",
      highlights: [
        "Analyzed 300+ student feedback entries, surfacing grading fairness concerns and influencing curriculum changes.",
        "Built an Ansible tool to automate Linux/MariaDB user provisioning, enabling 1-click bulk creation and cutting onboarding to minutes."
      ]
    },
    {
      title: "Software Engineer – EV and Full Stack",
      company: "Ador Powertron",
      location: "",
      period: "Mar 2022 – Aug 2024",
      highlights: [
        "Led development of intelligent EV charging systems for CCS chargers, building React.js frontends and OCPP 1.6/OpenAPI backends.",
        "Implemented a C# EV emulator and architected dynamic load balancing, reducing testing cycles by 25% and optimizing average charge time by 60%.",
        "Constructed REST APIs and integrated OCPP with a React/TypeScript frontend for HMI screens.",
        "Created SMTP-NTCIP full-stack IoT software for remote highway signage (VMS) control, reducing traffic incidents by 90%."
      ]
    }
  ],

  projects: [
    {
      title: "Distributed Telemetry Engine",
      description: "Architected a scalable microservices engine, integrating Kafka and Redis to reduce data retrieval latency by 60%. Automated CI/CD pipelines via Jenkins and provisioned GCP infrastructure using Kubernetes and Terraform.",
      tech: ["Java", "Spring Boot", "Kafka", "Redis", "GCP", "Kubernetes"],
      live: true
    },
    {
      title: "Pulse-Fi",
      description: "Developed a dual-ESP32 contactless heartbeat detection system using real-time FFT algorithms and telemetry streaming.",
      tech: ["C++", "Python", "Azure IoT Hub"],
      live: true
    },
    {
      title: "PRManager",
      description: "Built a RAG-powered PR reviewer delivering AI-based vulnerability summaries, accelerating review cycles via GitHub/Slack APIs.",
      tech: ["LangChain", "FAISS", "AWS Lambda", "Gemini API"],
      live: true
    }
  ],

  education: [
    {
      degree: "Master of Science - Computer Science and Engineering",
      school: "Santa Clara University",
      location: "Santa Clara, CA",
      period: "Sep 2024 – Jun 2026"
    },
    {
      degree: "Bachelor of Technology - Computer Science and Engineering",
      school: "MIT Art Design & Technology",
      location: "",
      period: "May 2018 – Aug 2022"
    }
  ],

  publications: [
    {
      title: "Framework for Cloud-Based Messaging System Using MQTT",
      description: "Designed scalable AWS IoT solution for two-way device connections using MQTT, published in ACTHPA'22 (IEEE, 2020)."
    },
    {
      title: "Development of a Comparison Based Medicine Purchasing System",
      description: "Developed a system to compare medicine prices across platforms, optimizing affordability."
    }
  ],

  achievements: [
    {
      title: "Best Junior Developer Recognition",
      description: "Awarded at Ador Powertron on March 22, 2023 for strong EV product execution and impact."
    },
    {
      title: "Adobe Hackathon - Best Feedback",
      description: "Won Best Feedback recognition in January 2025."
    },
    {
      title: "Community Lead - ACM-G",
      description: "Served as Community Lead in November 2025."
    }
  ]
}

// RAG context for the chatbot - comprehensive text representation
export const ragContext = `
JAY PATIL - SOFTWARE ENGINEER PORTFOLIO

CONTACT INFORMATION:
- Name: Jay Patil
- Email: jaypatilsde@gmail.com
- Phone: +1-669-367-0026
- Location: Santa Clara, CA
- LinkedIn: linkedin.com/in/jaypatil588
- GitHub: github.com/Jaypatil588

PROFESSIONAL SUMMARY:
Jay Patil is a Software Engineer with 4 years of experience building scalable cloud-native applications. He specializes in robust backend infrastructure, full-stack development, and integrating applied AI/ML workflows.

TECHNICAL SKILLS:
- Languages: Python, Java, C, C++, C#, JavaScript, TypeScript, SQL, NoSQL
- Frameworks & Libraries: LangChain, TensorFlow, React.js, .NET, Spring Boot, Spring Batch, ASP.NET Core
- Tools & DevOps: Ansible, Docker, Kubernetes, Terraform, Jenkins, Kafka
- Cloud & Databases: AWS, Google Cloud Platform (GCP), Azure, Firebase, CI/CD

WORK EXPERIENCE:

1. Software Developer: Full Stack and UI at Santa Clara University (Jun 2025 – Sep 2025, Santa Clara, CA)
   - Engineered a finetuned OpenAI RAG chatbot for the Provost's office, improving context accuracy by 15% and search time by 50%.
   - Built an interactive fellowships portal using Firebase and Azure SQL DB, improving data accessibility and search performance by 30%.
   - Enhanced the Off-Campus Living website's searchability and WCAG accessibility using TerminalFour, ReactJS, and HTML.

2. ECC Lab Research Assistant at Santa Clara University (Jan 2025 – Sep 2025, Santa Clara, CA)
   - Analyzed 300+ student feedback entries, surfacing grading fairness concerns and influencing curriculum changes.
   - Built an Ansible tool to automate Linux/MariaDB user provisioning, enabling 1-click bulk creation and cutting onboarding to minutes.

3. Software Engineer – EV and Full Stack at Ador Powertron (Mar 2022 – Aug 2024)
   - Led development of intelligent EV charging systems for CCS chargers, building React.js frontends and OCPP 1.6/OpenAPI backends.
   - Implemented a C# EV emulator and architected dynamic load balancing, reducing testing cycles by 25% and optimizing average charge time by 60%.
   - Constructed REST APIs and integrated OCPP with a React/TypeScript frontend for HMI screens.
   - Created SMTP-NTCIP full-stack IoT software for remote highway signage (VMS) control, reducing traffic incidents by 90%.

KEY PROJECTS:

1. Distributed Telemetry Engine (Java, Spring Boot, Kafka, Redis, GCP, Kubernetes)
   - Architected a scalable microservices engine, integrating Kafka and Redis to reduce data retrieval latency by 60%.
   - Automated CI/CD pipelines via Jenkins and provisioned GCP infrastructure using Kubernetes and Terraform.

2. Pulse-Fi (C++, Python, Azure IoT Hub)
   - Developed a dual-ESP32 contactless heartbeat detection system using real-time FFT algorithms and telemetry streaming.

3. PRManager (LangChain, FAISS, AWS Lambda, Gemini API)
   - Built a RAG-powered PR reviewer delivering AI-based vulnerability summaries, accelerating review cycles via GitHub/Slack APIs.

EDUCATION:
- Master of Science - Computer Science and Engineering, Santa Clara University, Santa Clara, CA (Sep 2024 – Jun 2026)
- Bachelor of Technology - Computer Science and Engineering, MIT Art Design & Technology (May 2018 – Aug 2022)

PUBLICATIONS:
1. "Framework for Cloud-Based Messaging System Using MQTT" (IEEE, 2020): Designed scalable AWS IoT solution for two-way device connections using MQTT, published in ACTHPA'22.
2. "Development of a Comparison Based Medicine Purchasing System": Developed a system to compare medicine prices across platforms, optimizing affordability.

ACHIEVEMENTS:
- Ador Powertron: Best Junior Developer Recognition (March 22, 2023)
- Adobe Hackathon: Best Feedback recognition (January 2025)
- ACM-G: Community Lead (November 2025)

AREAS OF EXPERTISE:
- Full-Stack Development (React, TypeScript, Node.js, .NET)
- Cloud Infrastructure (AWS, GCP, Azure)
- DevOps & CI/CD (Docker, Kubernetes, Terraform, Jenkins)
- AI/ML Integration (LangChain, TensorFlow, RAG systems)
- IoT Development (MQTT, Azure IoT Hub, ESP32)
- EV Charging Systems (OCPP protocol)

Jay is currently pursuing his Master's degree at Santa Clara University while actively working on cutting-edge projects involving AI, cloud computing, and distributed systems. He has a strong track record of delivering impactful solutions that improve system performance, reduce costs, and enhance user experience.
`
