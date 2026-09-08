import fs from 'fs';
import { analyzeResume } from './lib/gemini.ts';

async function testFactPreservation() {
  console.log("===============================================================================");
  console.log("🔍 TESTING 100% FACT PRESERVATION & STRONGER ATS OPTIMIZATION");
  console.log("===============================================================================\n");

  const resumeText = fs.readFileSync('scratch/demo_resume.txt', 'utf8');
  const jobTitle = "Senior Full Stack Engineer";
  const jobDesc = "Seeking a Senior Full Stack Engineer proficient in React, Next.js, TypeScript, Node.js, Docker, AWS, PostgreSQL, MySQL, and Vue.js.";

  console.log("Running resume analysis with target job description...");
  const result = await analyzeResume(resumeText, jobDesc, jobTitle);
  const enhanced = result.enhancedResume;

  console.log("\n--- 1. COMPANY NAMES & ROLES VERIFICATION ---");
  console.log("Extracted roles count:", enhanced.experience.length);
  enhanced.experience.forEach((exp, idx) => {
    console.log(`Role ${idx + 1}: "${exp.role}" at "${exp.company}" (${exp.period}, ${exp.location})`);
  });

  // Check Role 1
  const role1 = enhanced.experience[0];
  if (role1.company === "TechPulse Solutions" && role1.role === "Frontend Software Engineer") {
    console.log("✅ PASSED: Role 1 company name & job title 100% preserved!");
  } else {
    console.error("❌ FAILED: Role 1 changed!", role1);
    process.exit(1);
  }

  // Check Role 2
  const role2 = enhanced.experience[1];
  if (role2.company === "CloudScale Innovations" && role2.role === "Junior Web Developer") {
    console.log("✅ PASSED: Role 2 company name & job title 100% preserved!");
  } else {
    console.error("❌ FAILED: Role 2 changed!", role2);
    process.exit(1);
  }

  console.log("\n--- 2. PRESERVED ALL SKILLS VERIFICATION ---");
  const allEnhancedSkills = [];
  enhanced.skillCategories.forEach(cat => {
    console.log(`Category: "${cat.category}" (${cat.items.length} skills):`, cat.items.map(i => i.name).join(", "));
    cat.items.forEach(i => allEnhancedSkills.push(i.name.toLowerCase()));
  });

  const expectedSkills = [
    "javascript", "typescript", "python", "html5", "css3", "sql",
    "react", "next.js", "node.js", "express", "tailwind css", "redux toolkit",
    "postgresql", "mongodb", "redis",
    "git", "github", "vs code", "postman", "webpack", "vercel"
  ];

  const missingFromEnhanced = expectedSkills.filter(s => !allEnhancedSkills.some(es => es.includes(s)));
  if (missingFromEnhanced.length === 0) {
    console.log("✅ PASSED: 100% of candidate skills preserved (zero skills dropped or removed)!");
  } else {
    console.error("❌ FAILED: Missing candidate skills from optimized resume:", missingFromEnhanced);
    process.exit(1);
  }

  console.log("\n--- 3. NUMBERS & METRICS PRESERVATION ---");
  const allBulletsText = enhanced.experience.flatMap(e => e.bullets.map(b => b.text)).join(" ") + " " + enhanced.summary;
  const expectedMetrics = ["28%", "40%", "25%", "85%", "35%", "100k", "3+ years"];

  const missingMetrics = expectedMetrics.filter(m => !allBulletsText.toLowerCase().includes(m.toLowerCase()));
  if (missingMetrics.length === 0) {
    console.log("✅ PASSED: All original numbers & metrics (28%, 40%, 25%, 85%, 35%, 100k, 3+ years) are strictly preserved!");
  } else {
    console.error("❌ FAILED: Missing metrics in optimized text:", missingMetrics);
    process.exit(1);
  }

  console.log("\n--- 4. EDUCATION PRESERVATION ---");
  console.log("Education entries count:", enhanced.education.length);
  enhanced.education.forEach(edu => {
    console.log(`Degree: "${edu.degree}", Institution: "${edu.institution}", Year: "${edu.year}"`);
    console.log(`Details: "${edu.details}"`);
  });

  const edu1 = enhanced.education[0];
  if (
    edu1 &&
    edu1.degree.includes("Bachelor of Science in Computer Science") &&
    edu1.institution.includes("California State University") &&
    edu1.year.includes("2022") &&
    edu1.details.includes("Data Structures")
  ) {
    console.log("✅ PASSED: Education details 100% preserved!");
  } else {
    console.error("❌ FAILED: Education altered or incomplete:", edu1);
    process.exit(1);
  }

  console.log("\n--- 5. PROJECTS PRESERVATION ---");
  console.log("Projects count:", (enhanced.projects || []).length);
  const proj1 = (enhanced.projects || [])[0];
  if (proj1 && proj1.title.includes("ResumeAI Pro")) {
    console.log(`✅ PASSED: Real project "${proj1.title}" preserved! Bullets:`);
    proj1.bullets.forEach(b => console.log(`   • ${b}`));
  } else {
    console.error("❌ FAILED: Project not preserved:", proj1);
    process.exit(1);
  }

  console.log("\n--- 6. TRANSFERABLE SKILLS BRIDGE (VERIFIED SKILLS ONLY) ---");
  console.log("Detected Transferable Skills:", result.transferableSkills);
  if (result.transferableSkills && result.transferableSkills.length > 0) {
    result.transferableSkills.forEach(t => {
      const isVerified = expectedSkills.some(s => s.toLowerCase().includes(t.candidateSkill.toLowerCase()) || t.candidateSkill.toLowerCase().includes(s));
      console.log(`Transferable bridge: "${t.candidateSkill}" -> "${t.jobRequirement}" (Verified in resume? ${isVerified ? '✅ YES' : '❌ NO'})`);
      if (!isVerified) {
        console.error("❌ FAILED: Transferable skill not found in candidate's verified skills!", t);
        process.exit(1);
      }
    });
    console.log("✅ PASSED: All transferable skills are confirmed verified skills!");
  }

  console.log("\n===============================================================================");
  console.log("🎉 ALL 100% FACT PRESERVATION & STRONGER OPTIMIZATION TESTS PASSED!");
  console.log("===============================================================================\n");
}

testFactPreservation().catch(err => {
  console.error(err);
  process.exit(1);
});
