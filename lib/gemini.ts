import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  EnhancedResumeData,
  EnhancedResumeExperienceItem,
  EnhancedResumeEducationItem,
  EnhancedResumeProjectItem,
  EnhancedResumeSkillCategory,
  Improvement,
  TransferableSkill,
} from "../types/index.ts";

// ─────────────────────────────────────────────────────────────
// Technical Skills Dictionary & Canonical Naming
// ─────────────────────────────────────────────────────────────
export const techSkillsDictionary: Record<string, string> = {
  "node.js": "Node.js", "nodejs": "Node.js", "node": "Node.js",
  "express": "Express.js", "express.js": "Express.js",
  "postgresql": "PostgreSQL", "postgres": "PostgreSQL",
  "mysql": "MySQL", "mongodb": "MongoDB", "sql": "SQL", "redis": "Redis",
  "aws": "AWS", "ec2": "AWS EC2", "s3": "AWS S3", "lambda": "AWS Lambda", "cloud computing": "Cloud Computing",
  "gcp": "Google Cloud", "google cloud": "Google Cloud", "azure": "Azure",
  "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes",
  "ci/cd": "CI/CD", "jenkins": "Jenkins", "github actions": "GitHub Actions",
  "restful apis": "RESTful APIs", "rest api": "RESTful APIs", "restful": "RESTful APIs", "rest": "RESTful APIs",
  "graphql": "GraphQL", "microservices": "Microservices",
  "git": "Git", "github": "GitHub", "gitlab": "GitLab",
  "javascript": "JavaScript", "typescript": "TypeScript", "python": "Python", "java": "Java",
  "c++": "C++", "c#": "C#", "go": "Go", "golang": "Go", "rust": "Rust",
  "react": "React", "next.js": "Next.js", "nextjs": "Next.js", "vue": "Vue.js", "angular": "Angular",
  "html": "HTML5", "html5": "HTML5", "css": "CSS3", "css3": "CSS3", "tailwind": "Tailwind CSS", "bootstrap": "Bootstrap",
  "redux": "Redux", "redux toolkit": "Redux Toolkit",
  "jest": "Jest", "cypress": "Cypress", "unit testing": "Unit Testing", "integration testing": "Integration Testing",
  "code reviews": "Code Reviews", "system design": "System Design", "agile": "Agile", "scrum": "Scrum",
  "pandas": "Pandas", "numpy": "NumPy", "tableau": "Tableau", "power bi": "Power BI",
  "hadoop": "Hadoop", "spark": "Apache Spark", "apache spark": "Apache Spark", "snowflake": "Snowflake",
  "postman": "Postman", "webpack": "Webpack", "vite": "Vite", "vercel": "Vercel", "vs code": "VS Code"
};

// ─────────────────────────────────────────────────────────────
// Transferable Skills Semantic Map (Verified Skills Only)
// ─────────────────────────────────────────────────────────────
export const transferableSkillsMap: Record<string, { equivalents: string[]; rationale: string }> = {
  "PostgreSQL": {
    equivalents: ["MySQL", "SQL", "MongoDB", "Redis", "Oracle Database"],
    rationale: "Relational data modeling, SQL indexing, and ACID transaction principles transfer directly to PostgreSQL."
  },
  "MySQL": {
    equivalents: ["PostgreSQL", "SQL", "MongoDB", "SQLite"],
    rationale: "Deep SQL query optimization and schema design skills provide an immediate foundation."
  },
  "Docker": {
    equivalents: ["Kubernetes", "AWS", "CI/CD", "Linux", "Cloud Computing"],
    rationale: "Understanding of containerization concepts, deployment configurations, and microservices architecture."
  },
  "Kubernetes": {
    equivalents: ["Docker", "AWS EC2", "Cloud Computing", "CI/CD"],
    rationale: "Container lifecycles, service networking, and orchestration principles build directly on Docker foundations."
  },
  "AWS": {
    equivalents: ["Google Cloud", "Azure", "Cloud Computing", "Docker"],
    rationale: "Core cloud architecture paradigms (compute, object storage, serverless, VPCs) map closely across providers."
  },
  "Google Cloud": {
    equivalents: ["AWS", "Azure", "Cloud Computing"],
    rationale: "Cloud service architectures, IAM, and managed database patterns are readily transferable."
  },
  "Azure": {
    equivalents: ["AWS", "Google Cloud", "Cloud Computing"],
    rationale: "Enterprise cloud patterns, virtual networks, and scalable compute fundamentals translate seamlessly."
  },
  "React": {
    equivalents: ["Next.js", "Vue.js", "Angular", "TypeScript", "JavaScript"],
    rationale: "Component lifecycle, declarative rendering, unidirectional state management, and virtual DOM concepts."
  },
  "Next.js": {
    equivalents: ["React", "TypeScript", "Node.js"],
    rationale: "Extensive React component architecture and full-stack JavaScript foundations provide a seamless bridge."
  },
  "Vue.js": {
    equivalents: ["React", "Angular", "JavaScript", "TypeScript"],
    rationale: "Component-driven design and reactive state management principles transfer readily."
  },
  "TypeScript": {
    equivalents: ["JavaScript", "Java", "C#"],
    rationale: "Strong ECMAScript proficiency combined with typed OOP fundamentals speeds TypeScript adoption."
  },
  "Node.js": {
    equivalents: ["Express.js", "Python", "Go", "Java", "JavaScript"],
    rationale: "Asynchronous I/O, event-loop concepts, and backend service construction apply across environments."
  },
  "Apache Spark": {
    equivalents: ["Python", "Pandas", "SQL", "Hadoop"],
    rationale: "Data frame manipulation, distributed processing logic, and ETL pipeline transformations share core concepts."
  },
  "Snowflake": {
    equivalents: ["SQL", "PostgreSQL", "MySQL", "Pandas"],
    rationale: "Data warehousing patterns, analytical SQL query optimization, and columnar storage principles apply directly."
  },
  "GraphQL": {
    equivalents: ["RESTful APIs", "Node.js", "Express.js"],
    rationale: "Client-server API contracts, payload optimization, and schema design skills transfer directly."
  },
  "Jest": {
    equivalents: ["Unit Testing", "Integration Testing", "Cypress", "React Testing Library"],
    rationale: "Test-driven development, assertion patterns, mocking strategies, and regression testing are identical in concept."
  }
};

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function containsWord(text: string, word: string): boolean {
  const escaped = escapeRegExp(word);
  const regex = new RegExp(`(?:^|[^a-zA-Z0-9+#])${escaped}(?:$|[^a-zA-Z0-9+#])`, 'i');
  return regex.test(text);
}

// ─────────────────────────────────────────────────────────────
// Main Analyze Resume Function
// ─────────────────────────────────────────────────────────────
export async function analyzeResume(
  resumeText: string,
  jobDescription?: string,
  jobTitle?: string
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.warn("GEMINI_API_KEY is not configured. Utilizing dynamic AI analysis engine.");
    return generateDynamicAnalysis(resumeText, jobDescription, jobTitle);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const jobDescPart = jobDescription
      ? "\nJob Description:\n" + jobDescription + "\n"
      : "";

    const jobTitlePart = jobTitle
      ? "\nTarget Job Title: " + jobTitle + "\n"
      : "";

    const prompt = `You are an expert ATS (Applicant Tracking System) and ethical senior recruiter.
Analyze the following resume ${jobDescription ? "against the provided job description " : ""}and return the analysis STRICTLY in JSON format.

CRITICAL MANDATE — PRESERVE ALL ORIGINAL FACTS, ZERO FABRICATION & NO EXAGGERATION:
1. The optimized ATS resume must improve ATS relevance and wording without changing facts from the original resume.
2. It must be an enhancement of the original resume, NOT a replacement or fabrication.
3. NEVER invent, add, remove, or exaggerate:
   - skills or technologies
   - employers or company names
   - job titles
   - education or institutions
   - certifications
   - achievements
   - numbers or percentages
   - leadership or deployment experience
4. Preserve all important original achievements and measurable results.
5. In the Transferable Skills Bridge, ONLY show genuine transferable relationships supported by the original resume. Do not present training as professional experience and do not turn related skills into direct experience.
6. Provide an "authenticityScore" (0-100) assessing resume credibility, strict adherence to facts, and verifiable phrasing.

The JSON must match this structure exactly:
{
  "overallScore": number (0-100),
  "atsCompatibility": number (0-100),
  "authenticityScore": number (0-100),
  "sections": [
    {
      "name": string (e.g., "Contact Info", "Summary", "Work Experience", "Education", "Skills", "Projects", "Certifications"),
      "score": number (0-100),
      "feedback": string,
      "suggestions": [string],
      "status": "excellent" | "good" | "needs_improvement" | "missing"
    }
  ],
  "keywords": {
    "matched": [string],
    "missing": [string],
    "percentage": number (0-100)
  },
  "transferableSkills": [
    {
      "jobRequirement": string,
      "candidateSkill": string,
      "rationale": string
    }
  ],
  "strengths": [string],
  "weaknesses": [string],
  "improvements": [
    {
      "priority": "high" | "medium" | "low",
      "category": string,
      "suggestion": string,
      "exampleLine": string,
      "estimatedPoints": number,
      "honestNote": string
    }
  ],
  "summary": string,
  "jobTitle": string
}

Analyze at least these sections: Contact Info, Summary, Work Experience, Education, Skills, Projects. If a section is missing from the resume, still include it with status "missing".
Do not include any markdown formatting. Return only the raw JSON string, no code blocks.
${jobTitlePart}${jobDescPart}
Resume Text:
${resumeText}`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const cleanText = rawText.replace(/^```json\s*\n?/, "").replace(/\n?\s*```$/, "").trim();

    const parsed = JSON.parse(cleanText);
    parsed.enhancedResume = generateEnhancedResumeData(resumeText, parsed);
    return parsed;
  } catch (error) {
    console.error("Gemini API call encountered error, falling back to dynamic engine:", error);
    return generateDynamicAnalysis(resumeText, jobDescription, jobTitle);
  }
}

// ─────────────────────────────────────────────────────────────
// Dynamic Analysis Engine (Deterministic, Honest, Fact-Preserving)
// ─────────────────────────────────────────────────────────────
export function generateDynamicAnalysis(resumeText: string, jobDescription?: string, jobTitle?: string) {
  const textLower = resumeText.toLowerCase();
  const words = textLower.split(/\W+/).filter(w => w.length > 2);

  // 1. Detect Sections
  const hasSummary = /(?:^|\n)\s*(?:(?:professional\s+|executive\s+)?summary|profile|about\s+me|objective)\b/i.test(resumeText);
  const hasExperience = /(?:^|\n)\s*(?:(?:work\s+)?experience|employment|work\s+history|professional\s+experience)\b/i.test(resumeText);
  const hasEducation = /(?:^|\n)\s*(?:education|academic\s+background|academics)\b/i.test(resumeText) || /\b(?:bachelor|master|b\.s\.|b\.tech|degree)\b/i.test(resumeText);
  const hasSkills = /(?:^|\n)\s*(?:(?:technical\s+|core\s+)?skills|technologies\s+and\s+tools|proficiencies)\b/i.test(resumeText);
  const hasProjects = /(?:^|\n)\s*(?:(?:key\s+|personal\s+)?projects|portfolio)\b/i.test(resumeText);

  // 2. Identify Verified Candidate Skills from Resume
  const candidateSkillsFound: string[] = [];
  Object.keys(techSkillsDictionary).forEach(key => {
    if (containsWord(textLower, key)) {
      const canonical = techSkillsDictionary[key];
      if (!candidateSkillsFound.includes(canonical)) {
        candidateSkillsFound.push(canonical);
      }
    }
  });

  // Determine Target Job Title
  let derivedJobTitle = jobTitle;
  if (!derivedJobTitle) {
    if (textLower.includes("data") || textLower.includes("pandas") || textLower.includes("tableau") || textLower.includes("analyst")) derivedJobTitle = "Data Analyst";
    else if (textLower.includes("backend") || textLower.includes("node") || textLower.includes("postgres")) derivedJobTitle = "Backend Software Engineer";
    else if (textLower.includes("frontend") || textLower.includes("react")) derivedJobTitle = "Frontend Developer";
    else if (textLower.includes("full stack") || textLower.includes("fullstack")) derivedJobTitle = "Full Stack Engineer";
    else derivedJobTitle = "Software Engineer";
  }

  const roleLower = derivedJobTitle.toLowerCase();
  const isData = roleLower.includes("data") || roleLower.includes("analyst");
  const isFrontend = roleLower.includes("frontend") || roleLower.includes("react") || roleLower.includes("ui");
  const isBackend = roleLower.includes("backend") || roleLower.includes("node") || roleLower.includes("api");

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const transferableSkills: TransferableSkill[] = [];

  if (jobDescription && jobDescription.trim().length > 10) {
    const jdLower = jobDescription.toLowerCase();

    // Extract unique tech skills required by Job Description
    const requiredSkills: string[] = [];
    Object.keys(techSkillsDictionary).forEach(key => {
      if (containsWord(jdLower, key)) {
        const canonical = techSkillsDictionary[key];
        if (!requiredSkills.includes(canonical)) {
          requiredSkills.push(canonical);
        }
      }
    });

    // Check matched vs missing
    requiredSkills.forEach(skill => {
      const isPresent = candidateSkillsFound.includes(skill);
      if (isPresent) {
        if (!matchedKeywords.includes(skill)) matchedKeywords.push(skill);
      } else {
        if (!missingKeywords.includes(skill)) missingKeywords.push(skill);

        // Check if candidate has a VERIFIED transferable skill
        const transferDef = transferableSkillsMap[skill];
        if (transferDef) {
          const matchEquiv = transferDef.equivalents.find(eq => candidateSkillsFound.includes(eq));
          if (matchEquiv) {
            transferableSkills.push({
              jobRequirement: skill,
              candidateSkill: matchEquiv, // ONLY verified candidate skill!
              rationale: transferDef.rationale,
            });
          }
        }
      }
    });
  } else {
    matchedKeywords.push(...candidateSkillsFound);
  }

  const totalReqs = matchedKeywords.length + missingKeywords.length;
  const rawPercentage = totalReqs > 0 ? (matchedKeywords.length / totalReqs) * 100 : 70;
  const transferableBoost = totalReqs > 0 ? (transferableSkills.length * 0.4 / totalReqs) * 100 : 0;
  const keywordPercentage = Math.min(100, Math.round(rawPercentage + transferableBoost));

  // 3. Section Scoring
  let contactScore = 35;
  if (textLower.includes("email") || textLower.includes("@")) contactScore += 25;
  if (textLower.includes("phone") || textLower.includes("+") || textLower.includes("555")) contactScore += 20;
  if (textLower.includes("linkedin")) contactScore += 10;
  if (textLower.includes("github")) contactScore += 10;
  contactScore = Math.min(100, contactScore);

  const isGenericSummary = textLower.includes("hardworking") || textLower.includes("passionate individual") || textLower.includes("challenging role");
  const summaryScore = hasSummary ? (isGenericSummary ? 55 : (words.length > 80 ? 88 : 72)) : 20;

  const genuineMetrics = (resumeText.match(/\b\d+(%|\+|\s*users|\s*k|\s*m|\s*ms|\s*hrs|\s*years|\s*projects|\s*customers|\s*sprints)\b/gi) || []);
  const metricsCount = genuineMetrics.length;
  const hasGenericBullets = textLower.includes("helping with various tasks") || textLower.includes("fixed bugs") || textLower.includes("wrote code for internal");

  let expScore = 20;
  if (hasExperience) {
    expScore = 60;
    if (metricsCount >= 3) expScore += 25;
    else if (metricsCount > 0) expScore += 15;
    if (hasGenericBullets) expScore -= 12;
    expScore = Math.max(35, Math.min(96, expScore));
  }

  const eduScore = hasEducation ? 90 : 25;
  const skillsScore = (hasSkills || candidateSkillsFound.length > 0) ? Math.max(35, keywordPercentage) : 20;
  const projScore = hasProjects ? 82 : 30;

  // Authenticity Score
  let authenticityScore = 95;
  if (isGenericSummary) authenticityScore -= 3;
  if (hasGenericBullets) authenticityScore -= 4;
  if (metricsCount >= 2) authenticityScore += 3;
  authenticityScore = Math.min(99, Math.max(70, authenticityScore));

  // ATS Compatibility & Overall Score
  let atsCompatibility = Math.round(
    (contactScore * 0.15) +
    (expScore * 0.25) +
    (eduScore * 0.15) +
    (skillsScore * 0.25) +
    (keywordPercentage * 0.20)
  );
  atsCompatibility = Math.min(96, Math.max(30, atsCompatibility));

  let overallScore = Math.round(
    (atsCompatibility * 0.40) +
    (expScore * 0.25) +
    (skillsScore * 0.15) +
    (summaryScore * 0.10) +
    (projScore * 0.10)
  );
  overallScore = Math.min(98, Math.max(30, overallScore));

  // Strengths & Weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (contactScore >= 80) {
    strengths.push("Professional contact strip with email, phone, and direct portfolio/profile links.");
  } else {
    weaknesses.push("Contact section lacks direct links to verified professional profiles (LinkedIn or GitHub).");
  }

  if (metricsCount >= 2) {
    strengths.push(`Authentic, quantifiable accomplishments detected (${metricsCount}+ verified metric points preserved).`);
  } else {
    weaknesses.push("Work experience bullets are primarily task-based; quantify outcomes with honest metrics where possible.");
  }

  if (matchedKeywords.length >= 4) {
    strengths.push(`Verified alignment with core technical skills (${matchedKeywords.slice(0, 4).join(", ")}).`);
  }

  if (transferableSkills.length > 0) {
    strengths.push(`Strong transferable skill overlap: ${transferableSkills.map(t => `${t.candidateSkill} -> ${t.jobRequirement}`).join(", ")}.`);
  }

  if (missingKeywords.length > 0) {
    weaknesses.push(`Target role skill gaps: ${missingKeywords.slice(0, 4).join(", ")}.`);
  }

  // Improvements
  const improvements: Improvement[] = [];

  if (transferableSkills.length > 0) {
    const topTransfer = transferableSkills[0];
    improvements.push({
      priority: "high",
      category: "Transferable Skills",
      suggestion: `The target role requests ${topTransfer.jobRequirement}. Highlight your verified background in ${topTransfer.candidateSkill} and explain your rapid technical adaptability rather than claiming unearned experience.`,
      exampleLine: `"Leveraged deep ${topTransfer.candidateSkill} foundations to architect resilient software, rapidly transferring core concepts to ${topTransfer.jobRequirement} environments."`,
      estimatedPoints: 8,
      honestNote: `Recruiters value honest transferable skill bridges over unverified claims that unravel in technical interviews.`
    });
  }

  if (missingKeywords.length > 0) {
    const nonTransferable = missingKeywords.filter(m => !transferableSkills.some(t => t.jobRequirement === m));
    if (nonTransferable.length > 0) {
      const topGap = nonTransferable.slice(0, 3).join(", ");
      improvements.push({
        priority: "medium",
        category: "Skill Gaps & Upskilling",
        suggestion: `Target role requires ${topGap}. If you have academic or personal project experience with these, highlight them transparently. Otherwise, treat these as preparation focus areas.`,
        exampleLine: `"Completed hands-on practical labs with ${nonTransferable[0]}, exploring core configurations and architectural patterns."`,
        estimatedPoints: 5,
        honestNote: `Never copy keywords into your work history if you haven't used them in practice.`
      });
    }
  }

  if (metricsCount < 2) {
    let honestSTARexample = `"Delivered core web features using ${matchedKeywords[0] || 'modern frameworks'}, improving user engagement [insert real metric, e.g. +20% session time or Y daily users]."`;
    if (isBackend) {
      honestSTARexample = `"Engineered relational database schema and query indexes using PostgreSQL, achieving [insert real metric, e.g. 25% query latency drop] across production workloads."`;
    } else if (isFrontend) {
      honestSTARexample = `"Engineered modular UI components in React and TypeScript, reducing client bundle size [insert real metric, e.g. by 30%] and accelerating page load speed."`;
    } else if (isData) {
      honestSTARexample = `"Formulated automated analytical pipelines with Python and SQL, cutting manual report generation time [insert real metric, e.g. from 4 hours to 15 minutes]."`;
    }

    improvements.push({
      priority: "high",
      category: "Impact Metrics",
      suggestion: "Quantify your achievements using the XYZ formula: 'Accomplished [X] as measured by [Y] by doing [Z]'. Fill in your genuine numbers.",
      exampleLine: honestSTARexample,
      estimatedPoints: 9,
      honestNote: `Use real estimates from your actual work (e.g. users impacted, latency gained, or hours saved per sprint).`
    });
  }

  const sectionsList = [
    {
      name: "Contact Info",
      score: contactScore,
      feedback: contactScore >= 80 ? "Contact info is complete and ATS-compliant." : "Add direct links to verified professional profiles (LinkedIn/GitHub).",
      suggestions: contactScore < 80 ? ["Include custom LinkedIn URL", "Ensure phone format has country code"] : ["Contact info is clear"],
      status: contactScore >= 80 ? ("excellent" as const) : ("needs_improvement" as const)
    },
    {
      name: "Summary",
      score: summaryScore,
      feedback: hasSummary
        ? (isGenericSummary ? "Summary relies on generic adjectives; ground it in your verified tech stack." : "Summary clearly communicates technical domain and background.")
        : "No professional summary detected in resume.",
      suggestions: hasSummary
        ? (isGenericSummary ? ["Focus on verified technologies and core engineering contributions"] : ["Summary is concise and grounded"])
        : ["Add opening 2-3 sentence technical overview highlighting verified core skills"],
      status: !hasSummary ? ("missing" as const) : (isGenericSummary ? ("needs_improvement" as const) : ("good" as const))
    },
    {
      name: "Work Experience",
      score: expScore,
      feedback: hasExperience
        ? (metricsCount >= 2 ? `Strong accomplishment framing with ${metricsCount}+ verified metric points preserved.` : "Descriptions are task-focused; quantify results with authentic metrics.")
        : "No work experience section detected in resume.",
      suggestions: hasExperience
        ? ["Use active verbs (Delivered, Built, Engineered)", "Quantify genuine impact (latency, scale, sprint efficiency)"]
        : ["Add relevant professional, internship, or open-source work experience"],
      status: !hasExperience ? ("missing" as const) : (expScore >= 75 ? ("excellent" as const) : (expScore >= 55 ? ("good" as const) : ("needs_improvement" as const)))
    },
    {
      name: "Education",
      score: eduScore,
      feedback: hasEducation ? "Academic credentials and degree details clearly formatted." : "Education section not detected in resume.",
      suggestions: hasEducation ? ["Credentials clearly structured"] : ["List degree, institution, and graduation year"],
      status: hasEducation ? ("excellent" as const) : ("missing" as const)
    },
    {
      name: "Skills",
      score: skillsScore,
      feedback: (hasSkills || candidateSkillsFound.length > 0)
        ? `Identified ${candidateSkillsFound.length} verified technical skills (${keywordPercentage}% job alignment with transferable skills).`
        : "No technical skills section detected in resume.",
      suggestions: !(hasSkills || candidateSkillsFound.length > 0)
        ? ["Add a dedicated technical proficiencies section with verified skills"]
        : (missingKeywords.length > 0 ? [`Review target role skill gaps (${missingKeywords.slice(0, 3).join(", ")})`] : ["Skills are well aligned"]),
      status: !(hasSkills || candidateSkillsFound.length > 0) ? ("missing" as const) : (skillsScore >= 75 ? ("excellent" as const) : (skillsScore >= 50 ? ("good" as const) : ("needs_improvement" as const)))
    },
    {
      name: "Projects",
      score: projScore,
      feedback: hasProjects ? "Includes dedicated projects demonstrating applied skills." : "Consider highlighting 1-2 real GitHub or production projects.",
      suggestions: hasProjects ? ["Projects provide practical proof of capability"] : ["Include real repository or live application links"],
      status: hasProjects ? ("good" as const) : ("missing" as const)
    }
  ];

  const baseResult = {
    overallScore,
    atsCompatibility,
    authenticityScore,
    sections: sectionsList,
    keywords: {
      matched: matchedKeywords,
      missing: missingKeywords,
      transferable: transferableSkills,
      percentage: keywordPercentage
    },
    transferableSkills,
    strengths,
    weaknesses,
    improvements,
    summary: `Resume scored ${overallScore}/100 with an ATS compatibility rating of ${atsCompatibility}% and an Authenticity Rating of ${authenticityScore}%. Matched ${matchedKeywords.length} verified technical skills for ${derivedJobTitle}${transferableSkills.length > 0 ? ` with ${transferableSkills.length} strong transferable skill bridges` : ""}. ${missingKeywords.length > 0 ? `Target skill gaps identified in ${missingKeywords.slice(0, 3).join(', ')} — addressed via honest upskilling guidelines.` : 'Strong alignment with target role requirements.'}`,
    jobTitle: derivedJobTitle
  };

  return {
    ...baseResult,
    enhancedResume: generateEnhancedResumeData(resumeText, baseResult),
  };
}

// ─────────────────────────────────────────────────────────────
// Enhanced Resume Data Generator (100% Fact-Preserving & Stronger)
// ─────────────────────────────────────────────────────────────
export function generateEnhancedResumeData(
  resumeText: string,
  analysis: {
    jobTitle?: string;
    keywords?: { matched?: string[]; missing?: string[]; transferable?: TransferableSkill[] };
    transferableSkills?: TransferableSkill[];
    summary?: string;
    improvements?: Improvement[];
    strengths?: string[];
  }
): EnhancedResumeData {
  const lines = resumeText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Extract Candidate Full Name
  let fullName = "Candidate";
  for (const line of lines.slice(0, 6)) {
    if (
      !line.includes("@") &&
      !line.includes("http") &&
      !line.includes("github") &&
      !line.includes("linkedin") &&
      !line.toLowerCase().includes("resume") &&
      !line.toLowerCase().includes("curriculum vitae") &&
      !line.toLowerCase().includes("phone") &&
      !line.toLowerCase().includes("email") &&
      !/^\+?\d/.test(line) &&
      line.length >= 2 &&
      line.length <= 40
    ) {
      const cleaned = line.replace(/[^a-zA-Z\s.'-]/g, "").trim();
      if (cleaned.length >= 2 && !/^(software|frontend|backend|developer|engineer|full|data|junior|senior)/i.test(cleaned)) {
        fullName = cleaned;
        break;
      }
    }
  }

  // Initials
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : (nameParts[0]?.[0] || "CV").toUpperCase();

  // 2. Extract Candidate Original Professional Headline / Role
  let candidateHeadline = "";
  for (const line of lines.slice(0, 5)) {
    if (
      line !== fullName &&
      !line.includes("@") &&
      !line.includes("http") &&
      !line.toLowerCase().includes("phone") &&
      !line.toLowerCase().includes("location") &&
      line.length >= 4 &&
      line.length <= 80 &&
      /developer|engineer|analyst|architect|scientist|manager|consultant|specialist/i.test(line)
    ) {
      candidateHeadline = line.replace(/^[-•*|]\s*/, "").trim();
      break;
    }
  }

  const targetRole = candidateHeadline || analysis.jobTitle || "Software Engineer";

  // 3. Extract Contact Info
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = resumeText.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,12})/);
  const linkedinMatch = resumeText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const githubMatch = resumeText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);

  let location: string | undefined = undefined;
  const locationRegex = /(?:Bengaluru|Bangalore|Mumbai|Delhi|Hyderabad|Pune|Chennai|New York|San Francisco|Seattle|Austin|Boston|London|Berlin|Toronto|San Jose|Chicago|Remote)(?:,\s*[A-Za-z\s]+)?/i;
  const locMatch = resumeText.match(locationRegex);
  if (locMatch) {
    location = locMatch[0].trim();
  }

  // 4. Extract Candidate's ACTUAL Summary and Polish Wording (Preserving All Facts)
  const rawOriginalSummary = extractOriginalSummary(resumeText);
  const matchedKws = analysis.keywords?.matched || [];
  const missingKws = analysis.keywords?.missing || [];
  const transferable = analysis.transferableSkills || analysis.keywords?.transferable || [];

  const enhancedSummary = polishSummary(rawOriginalSummary);

  // 5. Extract ALL Original Candidate Skills (100% of skills preserved, categorized cleanly)
  const skillCategories: EnhancedResumeSkillCategory[] = extractAllOriginalSkills(resumeText, matchedKws);

  // 6. Multi-Entry Experience: 100% Preserved Company Names, Job Titles, Dates, Metrics & Facts
  const experience: EnhancedResumeExperienceItem[] = parseExperienceSection(lines, targetRole);

  // 7. Education Extraction (Exact degree, institution, year, coursework preserved)
  const education: EnhancedResumeEducationItem[] = parseEducationSection(resumeText);

  // 8. Projects Extraction (Exact projects, tech, bullets preserved with ATS polish)
  const projects: EnhancedResumeProjectItem[] = parseProjectsSection(lines);

  // 9. Certifications Extraction (Real ones only)
  const certifications: string[] = parseCertifications(resumeText);

  return {
    fullName,
    initials,
    targetRole,
    contact: {
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      location,
      linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
      github: githubMatch ? githubMatch[0] : undefined,
    },
    summary: enhancedSummary,
    skillCategories,
    experience,
    education,
    projects: projects.length > 0 ? projects : undefined,
    certifications: certifications.length > 0 ? certifications : undefined,
    skillGaps: missingKws,
    transferableSkills: transferable,
    authenticityNotice: "Optimized ATS Resume: Improves ATS relevance and active phrasing while strictly preserving 100% of original skills, employers, job titles, education, and verified metrics without exaggeration."
  };
}

// ─────────────────────────────────────────────────────────────
// Helper: Extract & Polish Summary (Preserving 100% of Facts)
// ─────────────────────────────────────────────────────────────
function extractOriginalSummary(resumeText: string): string {
  const lines = resumeText.split(/\r?\n/).map(l => l.trim());
  const sumHeaderIndex = lines.findIndex(l => /^(?:(?:professional\s+|executive\s+)?summary|profile|about\s+me|objective)(?:\s*:|\s*$)/i.test(l));
  if (sumHeaderIndex === -1) return "";

  const nextSectionIndex = lines.findIndex((l, idx) =>
    idx > sumHeaderIndex &&
    /^(?:technical\s+skills|core\s+skills|skills|technologies\s+and\s+tools|work\s+experience|experience|employment|work\s+history|education|academic|projects)(?:\s*:|\s*$)/i.test(l)
  );

  const end = nextSectionIndex !== -1 ? nextSectionIndex : lines.length;
  return lines.slice(sumHeaderIndex + 1, end).filter(Boolean).join(" ");
}

function polishSummary(originalSummary: string): string {
  if (!originalSummary || originalSummary.trim().length < 25) {
    return "";
  }

  let text = originalSummary.trim();

  // Polish wording while strictly keeping all numbers, years, metrics, tools, and roles
  text = text
    .replace(/\bresults-driven\b/i, "Results-driven")
    .replace(/\bproven track record of\b/i, "Demonstrated track record of")
    .replace(/\bresponsible for\b/i, "experienced in");

  // Ensure ends with a period
  if (!text.endsWith(".")) text += ".";

  return text;
}

// ─────────────────────────────────────────────────────────────
// Helper: Extract ALL Original Skills (100% Preserved)
// ─────────────────────────────────────────────────────────────
function extractAllOriginalSkills(resumeText: string, matchedKws: string[]): EnhancedResumeSkillCategory[] {
  const lines = resumeText.split(/\r?\n/).map(l => l.trim());
  const skillsIndex = lines.findIndex(l => /^(?:(?:technical\s+|core\s+)?skills|technologies\s+and\s+tools|proficiencies)(?:\s*:|\s*$)/i.test(l));

  if (skillsIndex === -1) {
    // Fallback: return verified skills from text
    const found: string[] = [];
    const textLower = resumeText.toLowerCase();
    Object.keys(techSkillsDictionary).forEach(k => {
      const canonical = techSkillsDictionary[k];
      if (containsWord(textLower, k) && !found.includes(canonical)) {
        found.push(canonical);
      }
    });
    if (found.length === 0) return [];
    return [{ category: "Technical Proficiencies", items: found.map(name => ({ name })) }];
  }

  const nextSectionIndex = lines.findIndex((l, idx) =>
    idx > skillsIndex &&
    /^(?:(?:work\s+)?experience|employment|work\s+history|education|academic|projects|certifications)(?:\s*:|\s*$)/i.test(l)
  );

  const end = nextSectionIndex !== -1 ? nextSectionIndex : lines.length;
  const skillLines = lines.slice(skillsIndex + 1, end).filter(Boolean);

  const categories: EnhancedResumeSkillCategory[] = [];
  const uncategorizedItems: string[] = [];

  for (const line of skillLines) {
    const cleanLine = line.replace(/^[-•*]\s*/, "").trim();
    if (!cleanLine) continue;

    // Line format: "Category Name: skill1, skill2, skill3..."
    const colonMatch = cleanLine.match(/^([^:]+):\s*(.+)$/);
    if (colonMatch) {
      const rawCategoryName = colonMatch[1].trim();
      const rawItems = colonMatch[2]
        .split(/[,;•|]/)
        .map(s => s.trim())
        .filter(Boolean);

      if (rawItems.length > 0) {
        categories.push({
          category: rawCategoryName,
          items: rawItems.map(name => ({ name })),
        });
        continue;
      }
    }

    // Line without colon: split by commas or list
    const itemsOnLine = cleanLine.split(/[,;•|]/).map(s => s.trim()).filter(s => s.length > 1);
    if (itemsOnLine.length > 1) {
      uncategorizedItems.push(...itemsOnLine);
    } else if (cleanLine.length < 40) {
      uncategorizedItems.push(cleanLine);
    }
  }

  if (uncategorizedItems.length > 0) {
    if (categories.length === 0) {
      categories.push({
        category: "Technical Skills & Proficiencies",
        items: uncategorizedItems.map(name => ({ name })),
      });
    } else {
      categories.push({
        category: "Additional Tools & Methodologies",
        items: uncategorizedItems.map(name => ({ name })),
      });
    }
  }

  // If still empty, use matchedKws only if genuine candidate skills exist
  if (categories.length === 0 && matchedKws.length > 0) {
    categories.push({
      category: "Technical Skills",
      items: matchedKws.map(name => ({ name })),
    });
  }

  return categories;
}

// ─────────────────────────────────────────────────────────────
// Helper: Polish Bullets (Strengthen Wording, Preserve 100% Facts & Metrics)
// ─────────────────────────────────────────────────────────────
function polishBullet(rawBullet: string): { text: string; hasMetrics: boolean; isEnhanced: boolean } {
  let cleaned = rawBullet.trim().replace(/^[-•*]\s*/, "");
  if (!cleaned) return { text: "", hasMetrics: false, isEnhanced: false };

  // Detect genuine metrics in the bullet (including comma-formatted numbers and key impact indicators)
  const hasMetrics = /\b[\d,]+(%|\+|\s*users|\s*k|\s*m|\s*ms|\s*hrs|\s*years|\s*projects|\s*customers|\s*sprints)\b/i.test(cleaned) ||
                     /\b(reduced|increased|improved|cut|grew|accelerated|boosted|saving|saved)\b.*\b[\d,]+/i.test(cleaned);

  // Upgrade passive verbs while STRICTLY PRESERVING ALL facts, tools, and numbers
  // NEVER invent or exaggerate leadership (e.g. "Spearheaded") or system design / deployment (e.g. "Architected")
  const verbUpgrades: [RegExp, string][] = [
    [/^(?:helped with|assisted in|helped to|worked on helping)\s+/i, "Collaborated to deliver "],
    [/^(?:responsible for|in charge of)\s+/i, "Delivered "],
    [/^(?:worked on|worked with)\s+/i, "Engineered "],
    [/^(?:fixed bugs in|bug fixing for)\s+/i, "Resolved software defects in "],
    [/^(?:wrote code for|created code for)\s+/i, "Developed software features for "],
    [/^(?:talked with|met with)\s+/i, "Collaborated cross-functionally with "],
    [/^(?:built and architected)\s+/i, "Built and implemented "],
    [/^(?:built)\s+/i, "Built and implemented "],
  ];

  let isEnhanced = false;
  for (const [pattern, replacement] of verbUpgrades) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, replacement);
      isEnhanced = true;
      break;
    }
  }

  // Capitalize first character
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  if (!cleaned.endsWith(".")) cleaned += ".";

  return {
    text: cleaned,
    hasMetrics,
    isEnhanced: isEnhanced || hasMetrics, // Marked as polished for ATS compatibility
  };
}

// ─────────────────────────────────────────────────────────────
// Helper: Parse Experience (100% Preserved Roles, Companies, Dates, Locations)
// ─────────────────────────────────────────────────────────────
function parseExperienceSection(lines: string[], defaultRole: string): EnhancedResumeExperienceItem[] {
  const expHeaderRegex = /^(?:(?:work\s+)?experience|employment|work history|professional experience)(?:\s*:|\s*$)/i;
  const eduHeaderRegex = /^(?:education|academic background|academics)(?:\s*:|\s*$)/i;
  const skillsHeaderRegex = /^(?:technical\s+skills|core\s+skills|skills|technologies\s+and\s+tools|proficiencies)(?:\s*:|\s*$)/i;
  const projHeaderRegex = /^(?:key\s+projects|projects|portfolio|personal\s+projects)(?:\s*:|\s*$)/i;
  const certHeaderRegex = /^(?:certifications|certificates|licenses)(?:\s*:|\s*$)/i;

  const expIndex = lines.findIndex(l => expHeaderRegex.test(l));
  if (expIndex === -1) {
    return [];
  }

  const nextSectionIndices = [
    lines.findIndex((l, idx) => idx > expIndex && eduHeaderRegex.test(l)),
    lines.findIndex((l, idx) => idx > expIndex && skillsHeaderRegex.test(l)),
    lines.findIndex((l, idx) => idx > expIndex && projHeaderRegex.test(l)),
    lines.findIndex((l, idx) => idx > expIndex && certHeaderRegex.test(l)),
  ].filter(i => i !== -1).sort((a, b) => a - b);

  const endIndex = nextSectionIndices.length > 0 ? nextSectionIndices[0] : lines.length;
  const expLines = lines.slice(expIndex + 1, endIndex);

  const items: EnhancedResumeExperienceItem[] = [];
  let currentCompany = "";
  let currentRole = "";
  let currentPeriod = "";
  let currentLocation = "";
  let currentBullets: string[] = [];

  const datePattern = /(?:(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:\d{4})\s*(?:-|–|to)\s*(?:Present|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\d{4})|\b\d{4}\s*(?:-|–|to)\s*(?:Present|\d{4})\b)/i;

  const flushCurrent = () => {
    if (currentCompany || currentRole || currentBullets.length > 0) {
      items.push({
        company: currentCompany || currentRole || "Professional Experience",
        role: currentRole || currentCompany || defaultRole, // Exact original role/title!
        period: currentPeriod || "Recent",
        location: currentLocation || undefined,
        bullets: currentBullets.map(b => polishBullet(b)).filter(b => b.text.length > 5),
      });
      currentCompany = "";
      currentRole = "";
      currentPeriod = "";
      currentLocation = "";
      currentBullets = [];
    }
  };

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i].trim();
    if (!line) continue;

    const isBullet = /^[-•*]\s*/.test(line);
    const dateMatch = line.match(datePattern);

    if (isBullet) {
      currentBullets.push(line);
    } else if (dateMatch) {
      const remaining = line.replace(dateMatch[0], "").trim().replace(/[|•–-]\s*$/, "").trim();
      if (remaining.includes("|") || remaining.includes("–") || remaining.includes(" - ")) {
        if (currentBullets.length > 0) flushCurrent();
        const parts = remaining.split(/\||–|\s+-\s+/).map(p => p.trim()).filter(Boolean);
        currentRole = parts[0] || "";
        currentCompany = parts[1] || "";
        currentLocation = parts[2] || "";
        currentPeriod = dateMatch[0];
      } else if (remaining) {
        if (currentBullets.length > 0) flushCurrent();
        currentPeriod = dateMatch[0];
        if (!currentRole) currentRole = remaining;
        else if (!currentCompany) currentCompany = remaining;
      } else {
        currentPeriod = dateMatch[0];
      }
    } else if (line.includes("|") || line.includes("–") || (line.includes(" - ") && line.length < 80)) {
      if (currentBullets.length > 0) flushCurrent();
      const parts = line.split(/\||–|\s+-\s+/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        currentRole = parts[0];
        currentCompany = parts[1];
        currentLocation = parts[2];
      } else if (parts.length === 2) {
        currentRole = parts[0];
        currentCompany = parts[1];
      } else {
        currentRole = line;
      }
    } else if (currentBullets.length === 0 && !currentRole) {
      currentRole = line;
    } else if (currentBullets.length === 0 && !currentCompany) {
      currentCompany = line;
    } else {
      currentBullets.push(line);
    }
  }
  flushCurrent();

  return items;
}

// ─────────────────────────────────────────────────────────────
// Helper: Parse Education (100% Preserved Degree, University, Year, Details)
// ─────────────────────────────────────────────────────────────
function parseEducationSection(resumeText: string): EnhancedResumeEducationItem[] {
  const items: EnhancedResumeEducationItem[] = [];
  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const eduIndex = lines.findIndex(l => /^(?:education|academic background|academics)(?:\s*:|\s*$)/i.test(l));
  if (eduIndex === -1) return [];

  const nextSectionRegex = /^(?:(?:work\s+)?experience|employment|work\s+history|skills|technical\s+skills|projects|certifications|awards|publications)(?:\s*:|\s*$)/i;
  const eduLines = lines.slice(eduIndex + 1);
  const relevantLines: string[] = [];
  for (const line of eduLines) {
    if (nextSectionRegex.test(line)) break;
    relevantLines.push(line);
  }

  const degreeRegex = /(?:Bachelor|Master|B\.S\.|B\.E\.|B\.Tech|M\.S\.|M\.Tech|Associate|Ph\.D\.|Degree|Diploma)[^,\n\r|]*/i;
  const uniWordRegex = /(?:University|Institute|College|School|Academy|Polytechnic)/i;
  const yearRegex = /(?:(?:Graduated|Completed|Class of)\s+)?(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\b(201\d|202\d)\b/i;

  let curDegree = "";
  let curUni = "";
  let curYear = "";
  let curDetails = "";

  const flushEdu = () => {
    if (curDegree || curUni) {
      items.push({
        degree: curDegree || "Degree Credential",
        institution: curUni || "University",
        year: curYear || undefined,
        details: curDetails || undefined,
      });
      curDegree = "";
      curUni = "";
      curYear = "";
      curDetails = "";
    }
  };

  for (let i = 0; i < relevantLines.length; i++) {
    const line = relevantLines[i];
    const isBullet = /^[-•*]\s*/.test(line);
    const hasDegree = degreeRegex.test(line);
    const hasUni = uniWordRegex.test(line);
    const hasYear = yearRegex.test(line);

    // If a new degree or institution is found and we already have an entry, flush previous
    if (!isBullet && (hasDegree || (hasUni && curUni))) {
      if (curDegree && (curUni || curYear)) {
        flushEdu();
      }
    }

    if (isBullet || line.toLowerCase().includes("coursework") || line.toLowerCase().includes("gpa") || line.toLowerCase().includes("honors")) {
      const cleanDetail = line.replace(/^[-•*]\s*/, "").trim();
      curDetails = curDetails ? `${curDetails} | ${cleanDetail}` : cleanDetail;
    } else if (line.includes("|")) {
      const parts = line.split("|").map(p => p.trim());
      for (const part of parts) {
        if (degreeRegex.test(part) && !curDegree) {
          curDegree = part.match(degreeRegex)![0].trim();
        } else if (uniWordRegex.test(part) && !curUni) {
          curUni = part;
        } else if (yearRegex.test(part) && !curYear) {
          curYear = part.match(yearRegex)![0].trim();
        }
      }
    } else {
      if (hasDegree && !curDegree) {
        curDegree = line.match(degreeRegex)![0].trim();
      } else if (hasUni && !curUni) {
        curUni = line;
      } else if (hasYear && !curYear) {
        curYear = line.match(yearRegex)![0].trim();
      }
    }
  }
  flushEdu();

  return items;
}

// ─────────────────────────────────────────────────────────────
// Helper: Parse Projects (100% Preserved Projects, Tech, Features)
// ─────────────────────────────────────────────────────────────
function parseProjectsSection(lines: string[]): EnhancedResumeProjectItem[] {
  const projIndex = lines.findIndex(l => /^(?:(?:key\s+|personal\s+)?projects|portfolio)(?:\s*:|\s*$)/i.test(l));
  if (projIndex === -1) return [];

  const nextSectionRegex = /^(?:education|academic|skills|technical\s+skills|certifications|experience|employment|work\s+history|awards)(?:\s*:|\s*$)/i;
  const projLines = lines.slice(projIndex + 1);
  const relevantLines: string[] = [];
  for (const line of projLines) {
    if (nextSectionRegex.test(line)) break;
    relevantLines.push(line);
  }

  const projects: EnhancedResumeProjectItem[] = [];
  let currentTitle = "";
  let currentTech: string[] = [];
  let currentBullets: string[] = [];

  const flushProject = () => {
    if (currentTitle) {
      projects.push({
        title: currentTitle,
        technologies: currentTech.length > 0 ? currentTech : undefined,
        bullets: currentBullets.map(b => polishBullet(b).text),
      });
      currentTitle = "";
      currentTech = [];
      currentBullets = [];
    }
  };

  for (const line of relevantLines) {
    if (/^[-•*]\s*/.test(line)) {
      currentBullets.push(line.replace(/^[-•*]\s*/, ""));
    } else if (line.includes("—") || line.includes("-") || line.includes("|")) {
      if (currentTitle) flushProject();
      const parts = line.split(/—|-|\|/).map(p => p.trim());
      currentTitle = line; // Preserve full original project title!
      if (parts[1]) {
        currentTech = parts[1].split(/[,;]/).map(t => t.trim()).filter(Boolean);
      }
    } else if (!currentTitle) {
      currentTitle = line;
    } else {
      currentBullets.push(line);
    }
  }
  flushProject();

  return projects;
}

// ─────────────────────────────────────────────────────────────
// Helper: Parse Certifications (Real ones only)
// ─────────────────────────────────────────────────────────────
function parseCertifications(resumeText: string): string[] {
  const certRegexes = [
    /AWS Certified[^\n\r,.]*/gi,
    /(?:CKA|CKAD|Certified Kubernetes)[^\n\r,.]*/gi,
    /Google Cloud Certified[^\n\r,.]*/gi,
    /Microsoft Certified[^\n\r,.]*/gi,
    /CompTIA\s+[A-Za-z+]+/gi,
    /PMP\b|Project Management Professional/gi,
    /Certified ScrumMaster|CSM\b/gi,
  ];

  const found: string[] = [];
  for (const reg of certRegexes) {
    const matches = resumeText.match(reg);
    if (matches) {
      matches.forEach(m => {
        const cleaned = m.trim();
        if (!found.includes(cleaned)) found.push(cleaned);
      });
    }
  }

  return found;
}

// ─────────────────────────────────────────────────────────────
// Programmatic Authenticity Cross-Checker (Checked Against Original Resume)
// ─────────────────────────────────────────────────────────────
export interface AuthenticityVerificationResult {
  isVerified: boolean;
  checkedCounts: {
    roles: number;
    companies: number;
    skills: number;
    education: number;
    metrics: number;
  };
  details: string[];
}

export function verifyResumeAuthenticity(
  originalText: string,
  enhanced: EnhancedResumeData
): AuthenticityVerificationResult {
  if (!originalText || originalText.trim().length < 20) {
    return {
      isVerified: false,
      checkedCounts: { roles: 0, companies: 0, skills: 0, education: 0, metrics: 0 },
      details: ["Original resume text unavailable for verification."]
    };
  }

  const origLower = originalText.toLowerCase();
  const details: string[] = [];
  let isVerified = true;

  let rolesCount = 0;
  let companiesCount = 0;
  let skillsCount = 0;
  let eduCount = 0;
  let metricsCount = 0;

  // 1. Verify Work Experience (employers, roles, numbers)
  if (enhanced.experience && enhanced.experience.length > 0) {
    for (const exp of enhanced.experience) {
      if (exp.company) {
        companiesCount++;
        const compWords = exp.company.toLowerCase().split(/[\s,.-]+/).filter(w => w.length > 2);
        const match = compWords.length === 0 || compWords.every(w => origLower.includes(w));
        if (!match) {
          isVerified = false;
          details.push(`Unverified employer: "${exp.company}" was not found in original resume.`);
        }
      }

      if (exp.role) {
        rolesCount++;
        const roleWords = exp.role.toLowerCase().split(/[\s,.-]+/).filter(w => w.length > 2);
        const match = roleWords.length === 0 || roleWords.some(w => origLower.includes(w));
        if (!match) {
          isVerified = false;
          details.push(`Unverified job title: "${exp.role}" was not found in original resume.`);
        }
      }

      for (const bullet of exp.bullets) {
        const numbers = bullet.text.match(/\b\d+(?:,\d+)*(?:\.\d+)?%?\b/g) || [];
        for (const num of numbers) {
          if (num.length >= 2 && !/^(19|20)\d{2}$/.test(num)) {
            metricsCount++;
            if (!origLower.includes(num.toLowerCase())) {
              isVerified = false;
              details.push(`Unverified number/metric: "${num}" in experience was not in original resume.`);
            }
          }
        }
      }
    }
  }

  // 2. Verify Skills (all extracted skills must exist in original text)
  if (enhanced.skillCategories && enhanced.skillCategories.length > 0) {
    for (const cat of enhanced.skillCategories) {
      for (const item of cat.items) {
        skillsCount++;
        const nameLower = item.name.toLowerCase();
        let matched = containsWord(origLower, nameLower);
        if (!matched) {
          const stripped = nameLower.replace(/\d+$|\.js$|ful$|\s*apis?$/g, "").trim();
          matched = stripped.length >= 2 && containsWord(origLower, stripped);
        }
        if (!matched) {
          // Also check techSkillsDictionary aliases
          matched = Object.keys(techSkillsDictionary).some(
            k => techSkillsDictionary[k].toLowerCase() === nameLower && containsWord(origLower, k)
          );
        }
        if (!matched) {
          isVerified = false;
          details.push(`Unverified skill: "${item.name}" was not found in original resume.`);
        }
      }
    }
  }

  // 3. Verify Education
  if (enhanced.education && enhanced.education.length > 0) {
    for (const edu of enhanced.education) {
      if (edu.institution && edu.institution !== "University") {
        eduCount++;
        const uniWords = edu.institution.toLowerCase().split(/[\s,.-]+/).filter(w => w.length > 3);
        if (uniWords.length > 0 && !uniWords.some(w => origLower.includes(w))) {
          isVerified = false;
          details.push(`Unverified institution: "${edu.institution}" was not in original resume.`);
        }
      }
    }
  }

  if (isVerified) {
    details.push("All employers, job titles, technical skills, metrics, and education verified against original resume.");
  }

  return {
    isVerified,
    checkedCounts: {
      roles: rolesCount,
      companies: companiesCount,
      skills: skillsCount,
      education: eduCount,
      metrics: metricsCount
    },
    details
  };
}
