"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getReviewById, saveReview } from "@/lib/storage";
import { AnalysisResult } from "@/types";
import { generateEnhancedResumeData } from "@/lib/gemini";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { SectionCard } from "@/components/ui/SectionCard";
import { ResumeComparisonView } from "@/components/ui/ResumeComparisonView";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Calendar,
  Target,
  BarChart3,
  Search,
  Layers,
  ShieldCheck,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getReviewById(params.id)
      .then(async (data) => {
        if (!isMounted) return;
        if (data) {
          if (data.resumeText) {
            const freshEnhanced = generateEnhancedResumeData(data.resumeText, {
              jobTitle: data.jobTitle,
              keywords: data.keywords,
              transferableSkills: data.transferableSkills,
              summary: data.summary,
              improvements: data.improvements,
              strengths: data.strengths,
            });
            data.enhancedResume = freshEnhanced;
            await saveReview(data);
          }
          setResult(data);
        } else {
          setResult(null);
        }
      })
      .catch((err) => {
        console.error("Error loading review:", err);
        if (isMounted) setResult(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="page-container pt-28 pb-16 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Review Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
          This analysis could not be found or has been deleted.
        </p>
        <Link href="/review" className="btn-primary py-3 px-8 rounded-full shadow-lg shadow-indigo-500/20">
          Analyze a New Resume
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(result.analyzedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const scoreColor =
    result.overallScore >= 75 ? "text-emerald-500" :
    result.overallScore >= 50 ? "text-amber-500" : "text-red-500";

  const scoreLabel =
    result.overallScore >= 75 ? "Strong" :
    result.overallScore >= 50 ? "Average" : "Needs Work";

  return (
    <div className="page-container pt-24 pb-16">
      <div className="content-wrapper max-w-5xl">

        {/* ── Top Nav ── */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={15} /> Back to History
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <FileText size={13} className="text-indigo-500" />
            <span className="font-medium truncate max-w-[160px]">{result.fileName}</span>
            <span className="opacity-40">•</span>
            <Calendar size={13} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* ── Hero Score Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-3xl p-8 mb-6 shadow-2xl overflow-hidden relative"
        >
          {/* bg glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: info */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              <div>
                {result.jobTitle && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3">
                    <Target size={11} /> {result.jobTitle}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                  Analysis Results
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mt-2 max-w-xl">
                  {result.summary}
                </p>
              </div>

              {/* Stat chips */}
              <div className="flex flex-wrap gap-3">
                <StatChip
                  icon={<BarChart3 size={14} className="text-indigo-500" />}
                  label="ATS Compatibility"
                  value={`${result.atsCompatibility}%`}
                />
                <StatChip
                  icon={<Search size={14} className="text-emerald-500" />}
                  label="Keyword Match"
                  value={`${result.keywords.percentage}%`}
                  highlight
                />
                {result.authenticityScore && (
                  <StatChip
                    icon={<ShieldCheck size={14} className="text-emerald-500" />}
                    label="Authenticity Rating"
                    value={`${result.authenticityScore}%`}
                  />
                )}
                <StatChip
                  icon={<Layers size={14} className="text-purple-500" />}
                  label="Sections Evaluated"
                  value={`${result.sections.length}`}
                />
              </div>
            </div>

            {/* Right: gauge */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center gap-3">
              <ScoreGauge score={result.overallScore} size={160} strokeWidth={11} />
              <div className="text-center">
                <div className={`text-sm font-bold ${scoreColor}`}>{scoreLabel}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Overall Resume Score</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Strengths & Weaknesses ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6"
        >
          <div className="glass-card p-6 rounded-2xl shadow-lg border-t-[3px] border-t-emerald-500">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500 w-5 h-5" /> Key Strengths
            </h2>
            <ul className="space-y-2.5">
              {result.strengths.length > 0 ? result.strengths.map((s, i) => (
                <li key={i} className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                  {s}
                </li>
              )) : (
                <li className="text-slate-400 italic text-sm">No strengths detected.</li>
              )}
            </ul>
          </div>

          <div className="glass-card p-6 rounded-2xl shadow-lg border-t-[3px] border-t-amber-500">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500 w-5 h-5" /> Areas to Improve
            </h2>
            <ul className="space-y-2.5">
              {result.weaknesses.length > 0 ? result.weaknesses.map((w, i) => (
                <li key={i} className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0 mt-0.5">!</span>
                  {w}
                </li>
              )) : (
                <li className="text-slate-400 italic text-sm">No weaknesses found.</li>
              )}
            </ul>
          </div>
        </motion.div>

        {/* ── Keyword Analysis (Data-Driven: when matched or missing skills are detected) ── */}
        {result.keywords && (result.keywords.matched.length > 0 || result.keywords.missing.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-6 rounded-2xl mb-6 shadow-xl"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search size={18} className="text-indigo-500" /> Keyword Analysis
            </h2>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              {result.keywords.percentage}% match
            </span>
          </div>

          {/* Match bar */}
          <div className="mb-5">
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.keywords.percentage}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
                ✓ Found in Resume ({result.keywords.matched.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.matched.length > 0
                  ? result.keywords.matched.map((kw, i) => <SkillBadge key={i} keyword={kw} type="matched" />)
                  : <span className="text-slate-400 italic text-xs">No keywords detected</span>}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400 mb-2">
                ✗ Missing from Resume ({result.keywords.missing.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.missing.length > 0
                  ? result.keywords.missing.map((kw, i) => <SkillBadge key={i} keyword={kw} type="missing" />)
                  : <span className="text-slate-400 italic text-xs">No missing keywords — great match!</span>}
              </div>
            </div>
          </div>

          {/* Transferable Skills Bridge */}
          {((result.transferableSkills && result.transferableSkills.length > 0) || (result.keywords.transferable && result.keywords.transferable.length > 0)) && (
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} className="text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Transferable Skills Bridge
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-500/20">
                  Foundational Knowledge · Not Direct Experience
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                You possess verified foundational skills that provide conceptual overlap with target role requirements. These represent transferable conceptual competencies, not direct production experience:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(result.transferableSkills || result.keywords.transferable || []).map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10">
                    <div className="flex items-center gap-2 text-xs font-bold mb-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono">
                        {t.candidateSkill}
                      </span>
                      <ArrowRight size={12} className="text-indigo-500 shrink-0" />
                      <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-mono">
                        {t.jobRequirement}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
        )}


        {/* ── Your resume, two ways: Original vs Enhanced CV ── */}
        <ResumeComparisonView result={result} />

        {/* ── Section-by-Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers size={18} className="text-purple-500" /> Section Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.sections.map((section, i) => (
              <SectionCard key={i} section={section} index={i} />
            ))}
          </div>
        </motion.div>

        {/* ── Bottom Actions ── */}
        <div className="flex justify-center gap-3 pt-8 border-t border-slate-200 dark:border-white/10 flex-wrap">
          <Link href="/review" className="btn-primary py-3 px-8 rounded-full shadow-lg shadow-indigo-500/20 font-semibold">
            Analyze Another Resume
          </Link>
          <Link href="/history" className="btn-secondary py-3 px-8 rounded-full font-semibold">
            Back to History
          </Link>
        </div>

      </div>
    </div>
  );
}

function StatChip({
  icon, label, value, highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm ${
      highlight
        ? "bg-indigo-500/10 border-indigo-500/20"
        : "bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-white/5"
    }`}>
      {icon}
      <div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mb-0.5">{label}</div>
        <div className={`font-bold text-base leading-none ${highlight ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
