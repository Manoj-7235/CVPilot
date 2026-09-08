import fs from 'fs';
import { analyzeResume } from './lib/gemini.ts';

async function testPipeline() {
  console.log("🚀 Testing Resume Analysis Engine with Demo Resume...");
  const resumeText = fs.readFileSync('scratch/demo_resume.txt', 'utf8');
  const jobTitle = "Senior Frontend Engineer";
  const jobDescription = "We are seeking a Senior Frontend Engineer proficient in React, TypeScript, Next.js, Docker, AWS, and modern UI engineering.";

  const result = await analyzeResume(resumeText, jobDescription, jobTitle);
  console.log("\n============================================");
  console.log("✅ ANALYSIS RESULTS GENERATED SUCCESSFULLY!");
  console.log("============================================");
  console.log("Target Job Title:", result.jobTitle);
  console.log("Overall Score:", result.overallScore + "/100");
  console.log("ATS Match Score:", result.atsCompatibility + "%");
  console.log("Matched Skills Percentage:", result.keywords.percentage + "%");
  console.log("Matched Keywords:", result.keywords.matched);
  console.log("Missing Keywords:", result.keywords.missing);
  console.log("\nSection-by-Section Scores:");
  result.sections.forEach(s => {
    console.log(` - ${s.name}: ${s.score}/100 [${s.status}] -> ${s.feedback.slice(0, 60)}...`);
  });
  console.log("\nKey Strengths:", result.strengths);
  console.log("\nSummary:", result.summary);
  console.log("============================================");
}

testPipeline().catch(console.error);
