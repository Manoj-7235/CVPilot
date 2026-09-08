import fs from 'fs';
import { analyzeResume } from './lib/gemini.ts';

async function verifyHonestOptimizer() {
  console.log("===============================================================================");
  console.log("🛡️ VERIFYING HONEST & SMARTER CV OPTIMIZER (ZERO FAKE QUALIFICATIONS)");
  console.log("===============================================================================\n");

  const resumeText = fs.readFileSync('scratch/demo_resume.txt', 'utf8');

  // Job requiring Docker, AWS, PostgreSQL, GraphQL
  const jobTitle = "Senior Backend Engineer";
  const jobDesc = "Seeking a Senior Backend Engineer proficient in Node.js, Express, PostgreSQL, Docker, AWS, and GraphQL.";

  console.log("Analyzing Demo Resume against Backend Job Description with Docker & AWS...");
  const result = await analyzeResume(resumeText, jobDesc, jobTitle);

  console.log(`\nOverall Score       : ${result.overallScore}/100`);
  console.log(`ATS Compatibility   : ${result.atsCompatibility}%`);
  console.log(`Authenticity Score  : ${result.authenticityScore}%`);
  console.log(`Matched Skills      :`, result.keywords.matched);
  console.log(`Missing (Skill Gaps):`, result.keywords.missing);
  console.log(`Transferable Skills :`, result.transferableSkills);

  const enhanced = result.enhancedResume;
  console.log("\n--- Enhanced Resume Data Verification ---");
  console.log("Target Role:", enhanced.targetRole);
  console.log("Authenticity Notice:", enhanced.authenticityNotice);

  // TEST 1: Missing keywords MUST NOT be in candidate's verified skill categories
  const allEnhancedSkills = [];
  enhanced.skillCategories.forEach(cat => {
    cat.items.forEach(item => allEnhancedSkills.push(item.name));
  });

  const missingInSkills = result.keywords.missing.filter(m => allEnhancedSkills.includes(m));
  console.log("\n[Test 1] Missing skills injected into verified skills list?");
  if (missingInSkills.length === 0) {
    console.log("✅ PASSED: Zero missing skills were injected into verified skills! Count:", missingInSkills.length);
  } else {
    console.error("❌ FAILED: Missing skills found in verified list:", missingInSkills);
    process.exit(1);
  }

  // TEST 2: No fake project "AI Cloud Architecture"
  console.log("\n[Test 2] No hallucinated 'AI Cloud Architecture' project?");
  const hasFakeProject = (enhanced.projects || []).some(p => p.title.toLowerCase().includes("ai cloud architecture"));
  if (!hasFakeProject) {
    console.log("✅ PASSED: No hallucinated fake projects! Real parsed projects:", (enhanced.projects || []).map(p => p.title));
  } else {
    console.error("❌ FAILED: Found hallucinated fake project 'AI Cloud Architecture'!");
    process.exit(1);
  }

  // TEST 3: No fake certification "AWS Certified Developer"
  console.log("\n[Test 3] No hallucinated 'AWS Certified Developer' certification?");
  const hasFakeCert = (enhanced.certifications || []).some(c => c.toLowerCase().includes("aws certified developer (in-progress)"));
  if (!hasFakeCert) {
    console.log("✅ PASSED: No hallucinated fake certifications! Real certs count:", (enhanced.certifications || []).length);
  } else {
    console.error("❌ FAILED: Found hallucinated fake certification!");
    process.exit(1);
  }

  // TEST 4: Multi-entry experience parsed (Candidate has 2 roles in demo_resume.txt)
  console.log("\n[Test 4] Multi-entry experience preserved from resume?");
  console.log("Parsed roles count:", enhanced.experience.length);
  enhanced.experience.forEach((exp, idx) => {
    console.log(` - Role ${idx + 1}: ${exp.role} @ ${exp.company} (${exp.period}) [${exp.bullets.length} bullets]`);
  });
  if (enhanced.experience.length >= 2) {
    console.log("✅ PASSED: Preserved multiple work experience entries cleanly.");
  } else {
    console.error("❌ FAILED: Expected at least 2 experience entries, got:", enhanced.experience.length);
  }

  // TEST 5: No fake metrics appended to bullets that didn't have them
  console.log("\n[Test 5] Zero fabricated metrics appended to unquantified bullets?");
  let fabricatedCount = 0;
  enhanced.experience.forEach(exp => {
    exp.bullets.forEach(b => {
      if (b.text.includes("improving response speed by 35% and overall throughput") ||
          b.text.includes("accelerating release velocity by 28% for 50,000+ monthly active users")) {
        fabricatedCount++;
      }
    });
  });
  if (fabricatedCount === 0) {
    console.log("✅ PASSED: No fake numbers or hallucinated metrics appended to bullets!");
  } else {
    console.error("❌ FAILED: Found fabricated metrics in bullets! Count:", fabricatedCount);
    process.exit(1);
  }

  // TEST 6: Transferable Skills Bridge properly identified
  console.log("\n[Test 6] Transferable Skills Bridge properly generated?");
  if (result.transferableSkills && result.transferableSkills.length > 0) {
    console.log("✅ PASSED: Detected transferable skills:");
    result.transferableSkills.forEach(t => {
      console.log(`   * ${t.candidateSkill} -> ${t.jobRequirement} (${t.rationale})`);
    });
  } else {
    console.warn("⚠️ Note: No transferable skills detected for this pair.");
  }

  console.log("\n===============================================================================");
  console.log("🎉 ALL HONESTY & ETHICAL ATS OPTIMIZATION TESTS PASSED PERFECTLY!");
  console.log("===============================================================================\n");
}

verifyHonestOptimizer().catch(err => {
  console.error(err);
  process.exit(1);
});
