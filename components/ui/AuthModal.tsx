"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Compass, X, LogIn, UserPlus, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleNavigateLogin = () => {
    onClose();
    router.push("/login?redirect=/review");
  };

  const handleNavigateSignUp = () => {
    onClose();
    router.push("/signup?redirect=/review");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md glass-card p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/10 text-center"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header Icon */}
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg">
            <Compass className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Sign In Required
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Please create an account or sign in to analyze your resume, get AI ATS scores, and save your review history.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleNavigateLogin}
              className="py-3 px-4 rounded-xl btn-secondary text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-indigo-500" />
              Sign In
            </button>

            <button
              onClick={handleNavigateSignUp}
              className="py-3 px-4 rounded-xl btn-primary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20"
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Free account • Instant access • Private & Secure
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
