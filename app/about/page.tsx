"use client";

import Link from "next/link";
import { 
  Code2, 
  Cpu, 
  Layout, 
  FileText, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  BarChart3, 
  BrainCircuit, 
  CheckCircle2, 
  Database, 
  ArrowRight, 
  KeyRound, 
  FileCheck,
  Compass
} from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const capabilities = [
    { label: "Document Formats", value: "PDF & DOCX", icon: <FileText className="w-4 h-4 text-indigo-400" /> },
    { label: "Target Comparison", value: "Resume + JD", icon: <BrainCircuit className="w-4 h-4 text-emerald-400" /> },
    { label: "Granular Scoring", value: "4 Pillars", icon: <BarChart3 className="w-4 h-4 text-purple-400" /> },
    { label: "Data Persistence", value: "PostgreSQL", icon: <Database className="w-4 h-4 text-cyan-400" /> },
  ];

  const corePillars = [
    {
      title: "ATS Reverse Engineering",
      desc: "Simulates enterprise screening engines like Workday, Taleo, and Greenhouse to guarantee your resume avoids common formatting rejection traps.",
      icon: <Target className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />,
      badge: "Compliance",
      bg: "from-indigo-500/10 to-indigo-500/5",
      border: "border-indigo-500/20",
    },
    {
      title: "Authenticity & Zero-Hallucination",
      desc: "Unlike standard AI tools that fabricate metrics, CVPilot strictly enhances your genuine experience without inventing fake figures or false credentials.",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
      badge: "Honesty Guarantee",
      bg: "from-emerald-500/10 to-emerald-500/5",
      border: "border-emerald-500/20",
    },
    {
      title: "Semantic Role Alignment",
      desc: "Compares your resume against specific target job descriptions using advanced semantic embeddings to uncover and bridge missing keyword gaps.",
      icon: <BrainCircuit className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
      badge: "Keyword Match",
      bg: "from-cyan-500/10 to-cyan-500/5",
      border: "border-cyan-500/20",
    },
    {
      title: "Secure PostgreSQL & Data Sovereignty",
      desc: "Your uploaded resumes and account details are safely stored in an isolated, secure PostgreSQL database. We never sell or share candidate data.",
      icon: <Database className="w-6 h-6 text-purple-500 dark:text-purple-400" />,
      badge: "Data Privacy",
      bg: "from-purple-500/10 to-purple-500/5",
      border: "border-purple-500/20",
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Document Ingestion & AST Extraction",
      desc: "Parses PDF and DOCX files server-side, stripping invisible glyphs, multi-column artifacts, and layout noise while preserving logical document hierarchy.",
      icon: <FileText className="w-5 h-5 text-indigo-400" />,
      color: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
    },
    {
      step: 2,
      title: "Multi-Dimensional Gemini AI Analysis",
      desc: "Extracts key responsibilities and evaluates impact density, action verbs, readability score, and quantifiable achievements across each career stage.",
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      color: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    },
    {
      step: 3,
      title: "Calibrated Scoring & Gap Detection",
      desc: "Calculates overall score, ATS compatibility, and authenticity confidence score, mapping weaknesses directly to actionable recommendations.",
      icon: <BarChart3 className="w-5 h-5 text-cyan-400" />,
      color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    },
    {
      step: 4,
      title: "Interactive Side-by-Side Optimization",
      desc: "Provides instant before-and-after rewrite suggestions that preserve your voice and facts, ready to copy or integrate with a single click.",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },
  ];

  const techStack = [
    { icon: <Zap className="w-5 h-5 text-indigo-400" />, name: "Next.js 14", detail: "App Router & Server Actions", bg: "bg-indigo-500/10" },
    { icon: <BrainCircuit className="w-5 h-5 text-purple-400" />, name: "Google Gemini", detail: "High-accuracy LLM inference", bg: "bg-purple-500/10" },
    { icon: <Database className="w-5 h-5 text-emerald-400" />, name: "PostgreSQL", detail: "ACID production persistence", bg: "bg-emerald-500/10" },
    { icon: <Code2 className="w-5 h-5 text-blue-400" />, name: "TypeScript", detail: "Strict end-to-end type safety", bg: "bg-blue-500/10" },
    { icon: <Layout className="w-5 h-5 text-cyan-400" />, name: "Tailwind CSS", detail: "Responsive modern design system", bg: "bg-cyan-500/10" },
    { icon: <Sparkles className="w-5 h-5 text-pink-400" />, name: "Framer Motion", detail: "Fluid 60fps micro-animations", bg: "bg-pink-500/10" },
    { icon: <KeyRound className="w-5 h-5 text-amber-400" />, name: "Bcrypt & Auth", detail: "Salted hashes & HTTP cookies", bg: "bg-amber-500/10" },
    { icon: <FileCheck className="w-5 h-5 text-teal-400" />, name: "PDF & DOCX Parser", detail: "Robust document extraction", bg: "bg-teal-500/10" },
  ];

  return (
    <div className="page-container pt-28 pb-20">
      <div className="content-wrapper max-w-5xl">
        
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6 shadow-sm">
            <Compass className="w-3.5 h-3.5" />
            <span>MISSION & ARCHITECTURE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Engineered to Beat the <span className="gradient-text">ATS Filter</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
            CVPilot was built to eliminate the black-box barrier between qualified candidates and recruiter inboxes. 
            We combine rigorous ATS parsing algorithms with ethical, fact-preserving AI to supercharge your career.
          </p>

          {/* Practical Capabilities Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-2 rounded-2xl glass-card border border-slate-200 dark:border-white/10 shadow-lg">
            {capabilities.map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/40">
                <div className="flex items-center gap-1.5 mb-1">
                  {item.icon}
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{item.value}</span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Core Pillars / Why Choose CVPilot */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Why Candidates Choose CVPilot
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
              Built on transparency, precision, and privacy—delivering recruiter-ready resumes without fluff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {corePillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                className={`p-6 rounded-2xl glass-card border ${pillar.border} bg-gradient-to-br ${pillar.bg} shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/10">
                      {pillar.icon}
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works (Timeline Steps) */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              How the Analysis Pipeline Operates
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              From raw document parsing to structured intelligence in four distinct phases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((s) => (
              <div 
                key={s.step} 
                className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-md flex gap-4 items-start"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      Phase {s.step}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Grid */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Technology Stack
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Built with industry-standard, high-performance web and AI technologies.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {techStack.map((tech, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                className="glass-card p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-start"
              >
                <div className={`p-2.5 rounded-xl mb-3 ${tech.bg}`}>
                  {tech.icon}
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                  {tech.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {tech.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </section>


        {/* Call To Action */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/60 border border-indigo-500/30 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-2">
            Ready to review and optimize your resume?
          </h3>
          <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
            Get your instant ATS score, keyword gap report, and bullet improvement suggestions in seconds.
          </p>
          <Link
            href="/review"
            className="btn-primary inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all"
          >
            <span>Start Free Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
