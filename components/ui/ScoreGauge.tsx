"use client";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  strokeWidth?: number;
}

export function ScoreGauge({
  score,
  size = 120,
  label,
  strokeWidth = 8,
}: ScoreGaugeProps) {
  let color = "#ef4444"; // red
  let shadowColor = "rgba(239, 68, 68, 0.4)";
  if (score >= 80) {
    color = "#10b981"; // green
    shadowColor = "rgba(16, 185, 129, 0.4)";
  } else if (score >= 60) {
    color = "#3b82f6"; // blue
    shadowColor = "rgba(59, 130, 246, 0.4)";
  } else if (score >= 40) {
    color = "#f59e0b"; // yellow
    shadowColor = "rgba(245, 158, 11, 0.4)";
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center relative"
      style={{ width: size }}
    >
      <div 
        className="relative w-full rounded-full transition-shadow duration-500"
        style={{ boxShadow: `0 0 20px ${shadowColor}` }}
      >
        <CircularProgressbar
          value={score}
          strokeWidth={strokeWidth}
          styles={buildStyles({
            pathColor: color,
            trailColor: "rgba(255, 255, 255, 0.1)",
            strokeLinecap: "round",
            pathTransitionDuration: 1.5,
          })}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            <AnimatedCounter target={score} />
          </span>
        </div>
      </div>
      {label && <span className="mt-4 text-sm font-medium text-slate-300">{label}</span>}
    </motion.div>
  );
}
