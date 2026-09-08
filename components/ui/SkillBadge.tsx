"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface SkillBadgeProps {
  keyword: string;
  type: "matched" | "missing";
}

export function SkillBadge({ keyword, type }: SkillBadgeProps) {
  const isMatched = type === "matched";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
        isMatched ? "badge-matched" : "badge-missing"
      }`}
    >
      {isMatched ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <XCircle className="w-3.5 h-3.5" />
      )}
      {keyword}
    </motion.div>
  );
}
