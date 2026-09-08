"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getReviews, deleteReview, clearAllReviews } from "@/lib/storage";
import { useAuth } from "@/components/providers/AuthProvider";
import { ReviewHistory } from "@/types";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { FileSearch, Trash2, Calendar, Target, FileText } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getReviews()
      .then((data) => {
        if (isMounted) setReviews(data);
      })
      .catch((err) => {
        console.error("Error loading reviews:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      await deleteReview(id);
      const updated = await getReviews();
      setReviews(updated);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all review history? This cannot be undone.")) {
      await clearAllReviews();
      setReviews([]);
    }
  };



  if (loading) {
    return <div className="page-container flex justify-center items-center font-medium text-slate-600 dark:text-slate-400">Loading history...</div>;
  }

  return (
    <div className="page-container pt-28 pb-16">
      <div className="content-wrapper max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Review History</h1>
            <p className="text-slate-600 dark:text-slate-400 text-base font-medium">Access your past resume analyses and track your improvements.</p>
          </div>
          
          {reviews.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="btn-danger py-2 px-4 text-xs rounded-xl flex items-center gap-2"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="glass-card py-20 px-4 text-center rounded-2xl flex flex-col items-center shadow-xl">
            <div className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-6">
              <FileSearch className="w-12 h-12 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">No reviews yet</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8 text-sm leading-relaxed">
              You haven&apos;t analyzed any resumes yet. Upload your first resume to get started!
            </p>
            <Link href="/review" className="btn-primary py-3 px-8 rounded-full shadow-lg shadow-indigo-500/20">
              Analyze Resume
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => {
              const date = new Date(review.analyzedAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
              });
              
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col h-full hover:border-indigo-500/40 transition-all shadow-lg relative"
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-4 overflow-hidden">
                        <h3 className="font-semibold text-lg truncate flex items-center gap-2 text-slate-900 dark:text-white" title={review.fileName}>
                          <FileText size={18} className="text-indigo-500 flex-shrink-0" />
                          <span className="truncate">{review.fileName}</span>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1 font-medium">
                          <Calendar size={12} /> {date}
                        </p>
                        {review.jobTitle && (
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-1 truncate font-medium">
                            <Target size={12} /> {review.jobTitle}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <ScoreGauge score={review.overallScore} size={60} strokeWidth={6} />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">ATS Match</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{review.atsCompatibility}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${review.atsCompatibility}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {review.summary}
                    </p>
                  </div>
                  
                  <div className="bg-slate-100 dark:bg-slate-900/60 p-4 border-t border-slate-200 dark:border-white/5 flex flex-wrap gap-2">
                    <Link 
                      href={`/review/${review.id}`}
                      className="flex-1 bg-white dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-center py-2 rounded-lg text-xs transition-colors font-semibold"
                    >
                      View Details
                    </Link>


                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg transition-colors"
                      aria-label="Delete review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
