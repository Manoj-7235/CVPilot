"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ResumeSection } from "@/types";

interface SectionCardProps {
  section: ResumeSection;
  index: number;
}

export function SectionCard({ section, index }: SectionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-emerald-500";
      case "good":
        return "bg-blue-500";
      case "needs_improvement":
        return "bg-amber-500";
      case "missing":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const getScoreClass = (score: number) => {
    if (score >= 80) return "score-excellent";
    if (score >= 60) return "score-good";
    if (score >= 40) return "score-needs-improvement";
    return "score-poor";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-xl overflow-hidden shadow-md"
    >
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(section.status)} shadow-[0_0_8px_currentColor] opacity-80`} />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white capitalize">
            {section.name.replace(/_/g, " ")}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreClass(section.score)}`}>
            {section.score}/100
          </span>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="mb-4 mt-4">
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-1 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full ${getStatusColor(section.status)}`} 
                    style={{ width: `${section.score}%` }} 
                  />
                </div>
              </div>
              
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">{section.feedback}</p>
              
              {section.suggestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Suggestions</h4>
                  <ul className="space-y-1.5">
                    {section.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                        <span className="text-indigo-500 font-bold mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
