"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Target, 
  Search, 
  BarChart3, 
  Lightbulb, 
  ShieldCheck, 
  Zap, 
  UploadCloud, 
  BrainCircuit, 
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Flame
} from "lucide-react";

export default function Home() {

  const features = [
    {
      icon: <Target className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />,
      tag: "ATS Simulation",
      title: "ATS Scanner Emulation",
      description: "Pre-tests your resume against enterprise applicant tracking algorithms (Workday, Taleo, Greenhouse) to eliminate formatting traps.",
      accent: "from-indigo-500/20 via-indigo-500/5 to-transparent",
      badgeColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      iconBg: "bg-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white text-indigo-500 dark:text-indigo-400",
    },
    {
      icon: <Search className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
      tag: "Semantic NLP",
      title: "Semantic Keyword Match",
      description: "Compares your resume against target job postings to uncover high-priority missing skills, technologies, and required competencies.",
      accent: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white text-emerald-500 dark:text-emerald-400",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
      tag: "Zero Hallucination",
      title: "Fact-Preserving Rewrites",
      description: "Elevates clarity and impact verbs without inventing fake metrics, false employers, or misleading technical certifications.",
      accent: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      badgeColor: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      iconBg: "bg-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-white text-cyan-500 dark:text-cyan-400",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-500 dark:text-purple-400" />,
      tag: "Deep Metrics",
      title: "Granular Section Scoring",
      description: "Breaks down your score across Experience, Education, Skills, and Summary with clear priorities on what to optimize first.",
      accent: "from-purple-500/20 via-purple-500/5 to-transparent",
      badgeColor: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
      iconBg: "bg-purple-500/10 group-hover:bg-purple-500 group-hover:text-white text-purple-500 dark:text-purple-400",
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
      tag: "Smart Insights",
      title: "Action-Driven Recommendations",
      description: "Provides line-by-line rewrite suggestions using active impact verbs, quantitative phrasing, and concise executive language.",
      accent: "from-amber-500/20 via-amber-500/5 to-transparent",
      badgeColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
      iconBg: "bg-amber-500/10 group-hover:bg-amber-500 group-hover:text-white text-amber-500 dark:text-amber-400",
    },
    {
      icon: <Zap className="w-6 h-6 text-rose-500 dark:text-rose-400" />,
      tag: "Fast Turnaround",
      title: "Sub-4 Second Analysis",
      description: "Powered by optimized Gemini LLM streaming and resilient PostgreSQL persistence so you can iterate rapidly across multiple applications.",
      accent: "from-rose-500/20 via-rose-500/5 to-transparent",
      badgeColor: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
      iconBg: "bg-rose-500/10 group-hover:bg-rose-500 group-hover:text-white text-rose-500 dark:text-rose-400",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-28 pb-20">
        {/* Ambient background glows */}
        <div className="absolute inset-0 bg-[var(--background)] overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 px-4 max-w-6xl mx-auto flex flex-col items-center">

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-center mb-6 text-[var(--foreground)] max-w-4xl leading-[1.15]"
          >
            Turn Your Resume Into An <br />
            <span className="gradient-text">Interview Magnet</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 text-center mb-10 max-w-2xl leading-relaxed"
          >
            75% of resumes are discarded by ATS scanners before human eyes ever see them. 
            CVPilot tests, optimizes, and rewrites your resume with verified recruiter metrics.
          </motion.p>
          
          {/* Hero CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center"
          >
            <Link 
              href="/review" 
              className="btn-primary py-4 px-8 text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 hover:scale-[1.03] transition-all font-semibold"
            >
              <span>Analyze My Resume Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/history" 
              className="btn-secondary py-4 px-8 text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all font-semibold"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>View Past Reviews</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── DYNAMIC HOVER FEATURE CARDS SECTION ─── */}
      <section className="py-24 px-4 bg-[var(--background-tertiary)] relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3 border border-indigo-500/20">
              <Flame className="w-3.5 h-3.5" />
              INTELLIGENT ANALYSIS ENGINE
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-[var(--foreground)] tracking-tight">
              Crafted to Put You Ahead of the Competition
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
              Explore the core capabilities that turn a standard resume into an ATS-compliant interview magnet.
            </p>
          </div>
          
          {/* Card Grid with Rich Hover Effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="group relative rounded-3xl glass-card p-7 sm:p-8 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Subtle top-corner gradient glow on hover */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${feat.accent} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none opacity-50 group-hover:opacity-100`} />

                <div>
                  {/* Icon & Category Tag Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${feat.iconBg}`}>
                      <div className="group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        {feat.icon}
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${feat.badgeColor}`}>
                      {feat.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 text-[var(--foreground)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feat.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3-STEP PIPELINE SECTION ─── */}
      <section className="py-24 px-4 bg-[var(--background)] relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[var(--foreground)]">
              Three Simple Steps to Land Interviews
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base">
              No complicated configuration. Upload your resume and let our engine do the heavy lifting.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <StepCard 
              number="01"
              icon={<UploadCloud className="w-7 h-7 text-indigo-400" />}
              title="Upload Document"
              description="Drop in your existing PDF or DOCX file and optionally paste the job posting you want to target."
              color="from-indigo-500 to-indigo-600"
            />
            <StepCard 
              number="02"
              icon={<BrainCircuit className="w-7 h-7 text-purple-400" />}
              title="AI Analysis"
              description="Our AI performs multi-stage evaluation across ATS match, authenticity, impact metrics, and clarity."
              color="from-purple-500 to-purple-600"
            />
            <StepCard 
              number="03"
              icon={<CheckCircle2 className="w-7 h-7 text-emerald-400" />}
              title="Optimize & Apply"
              description="Review line-by-line diff rewrites, fix missing keywords, and export a recruiter-ready resume."
              color="from-emerald-500 to-emerald-600"
            />
          </div>
        </div>
      </section>

      {/* ─── QUICK HIGHLIGHTS ─── */}
      <section className="py-20 px-4 bg-[var(--background-secondary)] border-y border-slate-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3">
              Included Free With Every Review
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Instant feedback designed to give you an unfair advantage over applicant pools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <HighlightCard 
              icon={<Target className="w-6 h-6 text-indigo-400" />} 
              title="ATS Match Score" 
              description="Understand how applicant systems score your layout, headers, and section structure." 
            />
            <HighlightCard 
              icon={<Search className="w-6 h-6 text-emerald-400" />} 
              title="Semantic Keywords" 
              description="Discover missing industry terminology and technical keywords to incorporate." 
            />
            <HighlightCard 
              icon={<Zap className="w-6 h-6 text-amber-400" />} 
              title="Instant Latency" 
              description="Fast server execution gives you complete analysis in under 4 seconds." 
            />
            <HighlightCard 
              icon={<ShieldCheck className="w-6 h-6 text-cyan-400" />} 
              title="Fact-Checked Rewrites" 
              description="Improve your bullet points without hallucinating fabricated credentials or numbers." 
            />
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA BANNER ─── */}
      <section className="py-24 px-4 text-center bg-[var(--background)] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto glass-card p-10 sm:p-14 rounded-3xl border border-indigo-500/30 shadow-2xl bg-gradient-to-b from-indigo-500/10 via-slate-900/40 to-slate-950/80">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 mx-auto mb-6 flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-white">
            Ready to Beat the ATS Filter?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            Upload your resume now to uncover blind spots, boost your ATS compatibility, and start booking interviews.
          </p>
          <Link 
            href="/review" 
            className="btn-primary py-4 px-10 text-base font-semibold rounded-2xl inline-flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-indigo-500/30"
          >
            <span>Start Your Free Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function StepCard({ 
  number, 
  icon, 
  title, 
  description, 
  color 
}: { 
  number: string, 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  color: string 
}) {
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col items-center text-center relative group"
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} p-0.5 flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
        <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-xs font-black tracking-widest text-indigo-500 dark:text-indigo-400 mb-2 uppercase">
        Step {number}
      </div>
      <h3 className="text-xl font-bold mb-3 text-[var(--foreground)]">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function HighlightCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string 
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card p-6 rounded-2xl flex flex-col items-start gap-3 shadow-md hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 border border-slate-200 dark:border-white/10 group cursor-pointer"
    >
      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 group-hover:scale-110 group-hover:border-indigo-500/30 transition-all">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{description}</p>
    </motion.div>
  );
}
