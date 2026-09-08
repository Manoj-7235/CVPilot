"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";

interface LoadingAnalysisProps {
  isLoading: boolean;
}

const STEPS = [
  "Parsing document...",
  "Extracting content...",
  "Analyzing structure...",
  "Evaluating ATS compatibility...",
  "Generating insights...",
  "Preparing report...",
];

export function LoadingAnalysis({ isLoading }: LoadingAnalysisProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card p-8 rounded-2xl w-full max-w-md mx-4 border border-indigo-500/20 shadow-2xl"
      >
        <h2 className="text-xl font-bold text-center mb-8 gradient-text">Analyzing Resume</h2>
        
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isPending ? 0.3 : 1, 
                  x: 0,
                  scale: isCurrent ? 1.02 : 1
                }}
                className={`flex items-center gap-3 ${isCurrent ? "text-white font-medium" : "text-slate-400"}`}
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                  )}
                </div>
                <span className="text-sm">{step}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-indigo-500"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}
