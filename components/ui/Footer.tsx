"use client";

import Link from "next/link";
import { Globe, ExternalLink, Mail, Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 py-12 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Compass className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <span className="font-bold text-xl gradient-text tracking-tight">CVPilot</span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 max-w-xs text-sm leading-relaxed">
              Supercharge your job search with AI-powered resume analysis and optimization.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/review" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Review Resume</Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-indigo-600 dark:hover:text-white transition-colors">History</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-indigo-600 dark:hover:text-white transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase mb-4">
              Connect
            </h3>
            <div className="flex space-x-4">
              <Link href="/" title="CVPilot Website" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </Link>
              <Link href="/review" title="Analyze Resume" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                <ExternalLink className="w-5 h-5" />
              </Link>
              <a href="mailto:support@cvpilot.com" title="Email Support" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} CVPilot. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
