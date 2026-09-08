"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getReviews } from "@/lib/storage";
import { ReviewHistory } from "@/types";
import { User as UserIcon, Mail, Calendar, LogOut, FileText, Award, BarChart3, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [reviews, setReviews] = useState<ReviewHistory[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      getReviews()
        .then((userReviews) => {
          if (isMounted) setReviews(userReviews);
        })
        .catch((err) => console.error("Error loading profile reviews:", err));
    } else {
      setReviews([]);
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (isLoading) {
    return <div className="page-container flex items-center justify-center font-medium text-slate-600 dark:text-slate-400">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="page-container pt-28 pb-16 flex flex-col items-center justify-center text-center">
        <div className="content-wrapper max-w-md">
          <div className="glass-card p-10 rounded-2xl text-center flex flex-col items-center shadow-xl">
            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-6 text-indigo-500">
              <UserIcon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">No Account Signed In</h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
              Please sign in or create an account to view your profile details, overall resume statistics, and saved reviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link href="/login?redirect=/profile" className="btn-secondary py-3 px-6 rounded-xl flex-1 text-xs font-semibold">
                Sign In
              </Link>
              <Link href="/signup?redirect=/profile" className="btn-primary py-3 px-6 rounded-xl flex-1 text-xs font-semibold shadow-lg shadow-indigo-500/20">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const averageScore = reviews.length > 0
    ? Math.round(reviews.reduce((acc, r) => acc + r.overallScore, 0) / reviews.length)
    : 0;

  const highestScore = reviews.length > 0
    ? Math.max(...reviews.map(r => r.overallScore))
    : 0;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  return (
    <div className="page-container pt-28 pb-16">
      <div className="content-wrapper">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">User Profile</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your account details and view overall resume statistics.</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="btn-danger inline-flex items-center gap-2 px-4 py-2.5 self-start md:self-auto"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-4">
            <div className="glass-card p-6 rounded-2xl shadow-xl flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 p-1 mb-4 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center overflow-hidden">
                  <UserIcon className="w-12 h-12 text-indigo-400" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user.name}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 flex items-center gap-1.5">
                <Mail size={13} /> {user.email}
              </p>

              <div className="w-full pt-4 border-t border-slate-200 dark:border-white/5 space-y-3 text-xs text-left">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> Member Since</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{memberSince}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Account Status</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-5 rounded-2xl shadow-lg border-l-4 border-l-indigo-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Reviews</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{reviews.length}</div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl shadow-lg border-l-4 border-l-emerald-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Average Score</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{averageScore}/100</div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 rounded-2xl shadow-lg border-l-4 border-l-amber-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Highest Score</div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{highestScore}/100</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Analysis Activity */}
            <div className="glass-card p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Resume Analyses</h3>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  No resume analyses recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 4).map((r) => (
                    <div key={r.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5">
                      <div className="truncate pr-4">
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">{r.fileName}</h4>
                        <p className="text-[11px] text-slate-500">{new Date(r.analyzedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{r.overallScore}/100</span>
                        <Link href={`/review/${r.id}`} className="text-xs text-slate-400 hover:text-white">
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
