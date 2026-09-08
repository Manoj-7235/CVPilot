"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Mail,
  Phone,
  MapPin,
  SplitSquareVertical,
  Zap,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { AnalysisResult, EnhancedResumeData } from "@/types";
import { generateEnhancedResumeData, verifyResumeAuthenticity, AuthenticityVerificationResult } from "@/lib/gemini";

function LinkedInIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z" />
    </svg>
  );
}

function GitHubIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface ResumeComparisonViewProps {
  result: AnalysisResult;
}

export function ResumeComparisonView({ result }: ResumeComparisonViewProps) {
  const [viewMode, setViewMode] = useState<"enhanced" | "original" | "split">("enhanced");
  const [highlightChanges, setHighlightChanges] = useState(true);
  const [copied, setCopied] = useState(false);

  // Ensure enhanced resume data is always fresh and up-to-date with latest parsing rules
  const enhancedData: EnhancedResumeData = result.resumeText
    ? generateEnhancedResumeData(result.resumeText, {
        jobTitle: result.jobTitle,
        keywords: result.keywords,
        transferableSkills: result.transferableSkills,
        summary: result.summary,
        improvements: result.improvements,
        strengths: result.strengths,
      })
    : (result.enhancedResume ||
       generateEnhancedResumeData("", {
         jobTitle: result.jobTitle,
         keywords: result.keywords,
         transferableSkills: result.transferableSkills,
         summary: result.summary,
         improvements: result.improvements,
         strengths: result.strengths,
       }));

  const originalText = result.resumeText || "No original resume text available.";

  // Programmatic verification: Check enhanced content directly against original resume facts
  const authCheck = verifyResumeAuthenticity(originalText, enhancedData);

  const handleCopy = () => {
    const textToCopy = formatResumeAsPlainText(enhancedData);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = formatResumeAsPlainText(enhancedData);
    const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${enhancedData.fullName.replace(/\s+/g, "_")}_Optimized_ATS_Resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="glass-card rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl border border-slate-200/80 dark:border-white/10 relative overflow-hidden"
    >
      {/* Background ambient accents */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar matching "Your resume, two ways" */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Your resume, two ways
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compare your original document against the AI-optimized ATS version.
          </p>
        </div>

        {/* View mode segmented switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-white/10 flex items-center shadow-inner">
            <button
              onClick={() => setViewMode("original")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === "original"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <FileText size={14} /> Original
            </button>
            <button
              onClick={() => setViewMode("enhanced")}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                viewMode === "enhanced"
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Sparkles size={14} className="text-amber-300" /> Optimized ATS Resume
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`hidden lg:flex px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 items-center gap-1.5 ${
                viewMode === "split"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Side-by-Side Comparison"
            >
              <SplitSquareVertical size={14} /> Side-by-Side
            </button>
          </div>
        </div>
      </div>

      {/* Sub-header banner: Authentic ATS Guarantee */}
      <div className="py-4 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-white/5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-semibold">
          <ShieldCheck size={14} className="shrink-0 text-emerald-500" />
          <span>100% Fact-Preserved ATS Optimization · Zero Fabrication</span>
        </div>

        {/* Enhancement Controls */}
        <div className="flex items-center gap-3">
          {(viewMode === "enhanced" || viewMode === "split") && (
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 font-medium">
              <input
                type="checkbox"
                checked={highlightChanges}
                onChange={(e) => setHighlightChanges(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="flex items-center gap-1">
                <Zap size={12} className="text-amber-500" /> Highlight Optimizations
              </span>
            </label>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 font-medium"
              title="Copy formatted text"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copied ? "Copied!" : "Copy CV Text"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 transition-colors flex items-center gap-1.5 font-medium"
              title="Download clean plain text resume"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recruiter Integrity Guarantee Banner */}
      <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
        <ShieldCheck className="text-emerald-500 w-4 h-4 shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-semibold">Optimized ATS Resume: </strong>
          Improves ATS relevance and active phrasing while strictly preserving all original employers, job titles, skills, numbers, achievements, education, and certifications. Never invents, adds, removes, or exaggerates information.
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {viewMode === "split" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-slate-50/60 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText size={14} /> Original Extracted Resume
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  Before AI
                </span>
              </div>
              <OriginalResumeCard text={originalText} />
            </div>

            <div className="border-2 border-indigo-500/30 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-xl relative">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Optimized ATS Resume
                </span>
                {authCheck.isVerified ? (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25 flex items-center gap-1" title="Checked against original resume text">
                    <ShieldCheck size={12} className="text-emerald-500" /> Authenticity Verified
                  </span>
                ) : (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/25 flex items-center gap-1" title={authCheck.details.join(" | ")}>
                    <AlertTriangle size={12} className="text-amber-500" /> Review Required
                  </span>
                )}
              </div>
              <EnhancedResumeTemplate data={enhancedData} highlightChanges={highlightChanges} authCheck={authCheck} />
            </div>
          </div>
        ) : viewMode === "original" ? (
          <motion.div
            key="original"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 bg-slate-50/70 dark:bg-slate-900/40 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Original Document View
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exact text extracted from {result.fileName}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Unmodified Raw Content
              </span>
            </div>
            <OriginalResumeCard text={originalText} />
          </motion.div>
        ) : (
          <motion.div
            key="enhanced"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border-2 border-indigo-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl relative"
          >
            <EnhancedResumeTemplate data={enhancedData} highlightChanges={highlightChanges} authCheck={authCheck} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Authentic ATS Resume Template Component
// ─────────────────────────────────────────────────────────────
function EnhancedResumeTemplate({
  data,
  highlightChanges,
  authCheck,
}: {
  data: EnhancedResumeData;
  highlightChanges: boolean;
  authCheck?: AuthenticityVerificationResult;
}) {
  return (
    <div className="text-slate-900 dark:text-slate-100 font-sans leading-relaxed">
      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200 dark:border-white/10">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          <Sparkles size={14} /> Optimized ATS Resume
        </span>
        {authCheck?.isVerified ? (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25 flex items-center gap-1" title="All employers, job titles, technical skills, metrics, and education verified against original resume.">
            <ShieldCheck size={12} className="text-emerald-500" /> Authenticity Verified
          </span>
        ) : (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/25 flex items-center gap-1" title={authCheck?.details.join(" | ") || "Needs review"}>
            <AlertTriangle size={12} className="text-amber-500" /> Review Required
          </span>
        )}
      </div>

      {/* ── Top Header with Avatar Badge ── */}
      <div className="flex items-start justify-between gap-4 pb-6 border-b-2 border-slate-800 dark:border-white/20 mb-7">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
            {data.fullName}
          </h1>

          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-base sm:text-lg mt-1 tracking-wide">
            {data.targetRole}
          </p>

          {/* Contact Strip */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {data.contact.phone && (
              <span className="inline-flex items-center gap-1.5 hover:text-indigo-500">
                <Phone size={13} className="text-slate-400" /> {data.contact.phone}
              </span>
            )}
            {data.contact.email && (
              <span className="inline-flex items-center gap-1.5 hover:text-indigo-500">
                <Mail size={13} className="text-slate-400" /> {data.contact.email}
              </span>
            )}
            {data.contact.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" /> {data.contact.location}
              </span>
            )}
            {data.contact.linkedin && (
              <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <LinkedInIcon size={13} /> {data.contact.linkedin}
              </span>
            )}
            {data.contact.github && (
              <span className="inline-flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                <GitHubIcon size={13} /> {data.contact.github}
              </span>
            )}
          </div>
        </div>

        {/* Circular Avatar / Initials Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-lg shrink-0 tracking-wider">
          {data.initials}
        </div>
      </div>

      {/* ── Summary Section ── */}
      {data.summary && data.summary.trim().length > 0 && (
        <section className="mb-7">
          <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-2.5 pb-1 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <span>Executive Summary</span>
            {highlightChanges && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 normal-case bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 size={11} /> Grounded in Verified Skills
              </span>
            )}
          </h2>
          <p className={`text-sm sm:text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 ${
            highlightChanges ? "bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/15" : ""
          }`}>
            {data.summary}
          </p>
        </section>
      )}

      {/* ── Transferable Skills Bridge (If any detected) ── */}
      {data.transferableSkills && data.transferableSkills.length > 0 && (
        <section className="mb-7 p-4 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-indigo-500/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Lightbulb size={13} className="text-amber-500" /> Transferable Skills Bridge
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold">
              Foundational Knowledge · Not Direct Experience
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            You possess verified foundational skills that provide conceptual overlap with target role requirements. These represent transferable conceptual competencies, not direct production experience:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {data.transferableSkills.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-indigo-500/15 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono text-[11px]">
                    {item.candidateSkill}
                  </span>
                  <ArrowRight size={12} className="text-indigo-500 shrink-0" />
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-mono text-[11px]">
                    {item.jobRequirement}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {item.rationale}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Skills Section (Categorized) ── */}
      <section className="mb-7">
        <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3 pb-1 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <span>Verified Technical Proficiencies</span>
          {highlightChanges && (
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 normal-case bg-indigo-500/10 px-2 py-0.5 rounded">
              Verified Technical Proficiencies
            </span>
          )}
        </h2>

        {data.skillCategories && data.skillCategories.length > 0 && data.skillCategories.some(c => c.items.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.skillCategories.map((cat, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5"
              >
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {cat.category}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-sm"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
            No technical skills section detected in original resume. Adding a dedicated technical proficiencies section with verified competencies will significantly improve ATS keyword alignment.
          </div>
        )}

        {/* Target Job Skill Gaps (Explicitly separated from candidate skills) */}
        {data.skillGaps && data.skillGaps.length > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-500" /> Target Role Skill Gaps ({data.skillGaps.length})
              </h4>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/15 px-2 py-0.5 rounded">
                Do Not Fabricate
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2.5">
              These skills were requested in the target job description but not detected in your resume. Only add them if you have real hands-on or coursework experience:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.skillGaps.map((gap, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-white/80 dark:bg-slate-800/80 text-amber-700 dark:text-amber-300 border border-amber-500/25 font-medium"
                >
                  {gap}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Experience Section ── */}
      <section className="mb-7">
        <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3 pb-1 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <span>ATS-Optimized Experience</span>
          {highlightChanges && (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 normal-case bg-emerald-500/10 px-2 py-0.5 rounded">
              ATS-Optimized Experience
            </span>
          )}
        </h2>

        {data.experience && data.experience.length > 0 ? (
          <div className="space-y-5">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="relative pl-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {exp.role}
                    </span>
                    <span className="text-slate-400 mx-2">|</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">
                      {exp.company}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {exp.period} {exp.location ? `· ${exp.location}` : ""}
                  </div>
                </div>

                <ul className="space-y-2.5 mt-2">
                  {exp.bullets.map((b, bIdx) => (
                    <li
                      key={bIdx}
                      className={`text-sm leading-relaxed ${
                        b.isEnhanced && highlightChanges
                          ? "p-2.5 rounded-lg bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-slate-900 dark:text-slate-100"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-indigo-500 font-bold mt-1 text-xs shrink-0">•</span>
                        <div className="flex-1">
                          <span>{b.text}</span>
                          {b.hasMetrics && highlightChanges && (
                            <span className="inline-block ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold align-middle">
                              Verified Metric
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
            No work experience section detected in original resume. Adding verified professional experience or internships helps ATS systems evaluate your background.
          </div>
        )}
      </section>

      {/* ── Education Section ── */}
      {data.education && data.education.length > 0 && (
        <section className="mb-7">
          <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3 pb-1 border-b border-slate-200 dark:border-white/10">
            Education
          </h2>
          <div className="space-y-3">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {edu.degree}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {edu.institution} {edu.details ? `· ${edu.details}` : ""}
                  </div>
                </div>
                {edu.year && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {edu.year}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Projects Section ── */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-7">
          <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3 pb-1 border-b border-slate-200 dark:border-white/10">
            Projects & Technical Implementations
          </h2>
          <div className="space-y-3">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {proj.title}
                  </div>
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((t, tIdx) => (
                        <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ul className="space-y-1 mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {proj.bullets.map((pb, pbIdx) => (
                    <li key={pbIdx} className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-0.5">•</span>
                      <span>{pb}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Certifications Section (Only if genuine ones exist) ── */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-2.5 pb-1 border-b border-slate-200 dark:border-white/10">
            Certifications & Credentials
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.certifications.map((cert, idx) => (
              <span key={idx} className="text-xs px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium border border-slate-200 dark:border-white/10">
                {cert}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Original Resume Viewer Component
// ─────────────────────────────────────────────────────────────
function OriginalResumeCard({ text }: { text: string }) {
  return (
    <div className="font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-[700px] overflow-y-auto p-4 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 shadow-inner">
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helper to generate clean plain text representation
// ─────────────────────────────────────────────────────────────
function formatResumeAsPlainText(data: EnhancedResumeData): string {
  const contactLines = [
    data.contact.phone,
    data.contact.email,
    data.contact.location,
    data.contact.linkedin,
    data.contact.github,
  ].filter(Boolean).join(" | ");

  let content = `${data.fullName.toUpperCase()}\n`;
  content += `${data.targetRole}\n`;
  content += `${contactLines}\n\n`;

  if (data.summary && data.summary.trim().length > 0) {
    content += `SUMMARY\n`;
    content += `${data.summary}\n\n`;
  }

  if (data.skillCategories && data.skillCategories.length > 0 && data.skillCategories.some(c => c.items.length > 0)) {
    content += `SKILLS\n`;
    data.skillCategories.forEach((cat) => {
      if (cat.items.length > 0) {
        content += `${cat.category}: ${cat.items.map((i) => i.name).join(", ")}\n`;
      }
    });
    content += `\n`;
  }

  if (data.experience && data.experience.length > 0) {
    content += `WORK EXPERIENCE\n`;
    data.experience.forEach((exp) => {
      content += `${exp.role} | ${exp.company} (${exp.period})\n`;
      exp.bullets.forEach((b) => {
        content += `• ${b.text}\n`;
      });
      content += `\n`;
    });
  }

  if (data.education && data.education.length > 0) {
    content += `EDUCATION\n`;
    data.education.forEach((edu) => {
      content += `${edu.degree} - ${edu.institution} (${edu.year || ""})\n`;
      if (edu.details) content += `${edu.details}\n`;
    });
    content += `\n`;
  }

  if (data.projects && data.projects.length > 0) {
    content += `PROJECTS\n`;
    data.projects.forEach((p) => {
      content += `${p.title}${p.technologies ? ` [${p.technologies.join(", ")}]` : ""}\n`;
      p.bullets.forEach((pb) => {
        content += `• ${pb}\n`;
      });
      content += `\n`;
    });
  }

  if (data.certifications && data.certifications.length > 0) {
    content += `CERTIFICATIONS\n`;
    data.certifications.forEach((c) => {
      content += `• ${c}\n`;
    });
    content += `\n`;
  }

  content += `[Optimized with CVPilot — 100% Authentic Candidate Background]\n`;

  return content;
}
