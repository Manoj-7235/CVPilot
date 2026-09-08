import fs from 'fs';
import { analyzeResume } from './lib/gemini.ts';

async function verifyEndToEnd() {
  console.log("===============================================================================");
  console.log("🔍 TESTING END-TO-END RESUME ANALYSIS DIFFERENTIATION FOR BUG VERIFICATION");
  console.log("===============================================================================\n");

  // TEST 1: FRONTEND DEVELOPER RESUME vs FRONTEND JOB
  const resume1Text = fs.readFileSync('scratch/resume1_frontend.txt', 'utf8');
  const jobTitle1 = "Senior React / Frontend Developer";
  const jobDesc1 = "Looking for an expert React and TypeScript Developer skilled in Next.js, Redux, Tailwind CSS, Jest, Webpack, Docker, and AWS.";

  console.log("--- 📄 TEST 1: FRONTEND RESUME & JOB ---");
  const result1 = await analyzeResume(resume1Text, jobDesc1, jobTitle1);
  console.log(`Target Job Title : ${result1.jobTitle}`);
  console.log(`Overall Score    : ${result1.overallScore}/100`);
  console.log(`ATS Compatibility: ${result1.atsCompatibility}%`);
  console.log(`Keyword Match %  : ${result1.keywords.percentage}%`);
  console.log(`Matched Keywords :`, result1.keywords.matched);
  console.log(`Missing Keywords :`, result1.keywords.missing);
  console.log(`Key Strengths    :`, result1.strengths);
  console.log(`Key Weaknesses   :`, result1.weaknesses);
  console.log(`Executive Summary: ${result1.summary}\n`);

  // TEST 2: DATA ANALYST RESUME vs DATA ENGINEER JOB
  const resume2Text = fs.readFileSync('scratch/resume2_data.txt', 'utf8');
  const jobTitle2 = "Lead Data Engineer";
  const jobDesc2 = "Seeking a Data Engineer with deep expertise in Python, SQL, Apache Spark, Hadoop, Snowflake, AWS, Docker, Kubernetes, and Machine Learning.";

  console.log("--- 📄 TEST 2: DATA ANALYST RESUME vs DATA ENGINEER JOB ---");
  const result2 = await analyzeResume(resume2Text, jobDesc2, jobTitle2);
  console.log(`Target Job Title : ${result2.jobTitle}`);
  console.log(`Overall Score    : ${result2.overallScore}/100`);
  console.log(`ATS Compatibility: ${result2.atsCompatibility}%`);
  console.log(`Keyword Match %  : ${result2.keywords.percentage}%`);
  console.log(`Matched Keywords :`, result2.keywords.matched);
  console.log(`Missing Keywords :`, result2.keywords.missing);
  console.log(`Key Strengths    :`, result2.strengths);
  console.log(`Key Weaknesses   :`, result2.weaknesses);
  console.log(`Executive Summary: ${result2.summary}\n`);

  console.log("===============================================================================");
  console.log("📊 COMPARISON & DIFFERENTIATION VERIFICATION SUMMARY");
  console.log("===============================================================================");
  console.log(`Overall Scores   -> Resume 1: ${result1.overallScore} | Resume 2: ${result2.overallScore} (Different? ${result1.overallScore !== result2.overallScore ? '✅ YES' : '❌ NO'})`);
  console.log(`ATS Match %      -> Resume 1: ${result1.atsCompatibility}% | Resume 2: ${result2.atsCompatibility}% (Different? ${result1.atsCompatibility !== result2.atsCompatibility ? '✅ YES' : '❌ NO'})`);
  console.log(`Keyword Match %  -> Resume 1: ${result1.keywords.percentage}% | Resume 2: ${result2.keywords.percentage}% (Different? ${result1.keywords.percentage !== result2.keywords.percentage ? '✅ YES' : '❌ NO'})`);
  console.log(`Matched Keywords -> Resume 1 (${result1.keywords.matched.length} skills) vs Resume 2 (${result2.keywords.matched.length} skills) (Different? ${JSON.stringify(result1.keywords.matched) !== JSON.stringify(result2.keywords.matched) ? '✅ YES' : '❌ NO'})`);
  console.log("===============================================================================\n");
}

verifyEndToEnd().catch(console.error);
