"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/FileUpload";
import { LoadingAnalysis } from "@/components/ui/LoadingAnalysis";
import { AuthModal } from "@/components/ui/AuthModal";
import { saveReview } from "@/lib/storage";
import { useAuth } from "@/components/providers/AuthProvider";
import { AnalysisResult } from "@/types";
import { AlertTriangle, Sparkles } from "lucide-react";

function ReviewPageContent() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const MAX_JD_LENGTH = 2000;

  const handleAnalyze = async () => {
    if (!file) return;

    if (!isLoading && !user) {
      setShowAuthModal(true);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (jobDescription) formData.append("jobDescription", jobDescription);
      if (jobTitle) formData.append("jobTitle", jobTitle);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      const result: AnalysisResult = {
        ...data,
        id: crypto.randomUUID(),
        userId: user?.id,
        fileName: file.name,
        fileSize: file.size,
        analyzedAt: new Date().toISOString(),
        jobTitle: jobTitle || data.jobTitle,
      };

      await saveReview(result);
      router.push(`/review/${result.id}`);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return <LoadingAnalysis isLoading={true} />;
  }

  return (
    <div className="page-container pt-28 pb-16">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          handleAnalyze();
        }}
      />

      <div className="content-wrapper">
        <div className="mb-10">
          <h1 className="text-4xl font-bold gradient-text mb-2">Review Your Resume</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base font-medium">
            Upload your resume and optionally provide a job description to get tailored AI feedback.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 mb-8 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-300">
            <AlertTriangle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-600 dark:text-red-200 text-sm">Analysis Error</h3>
              <p className="text-red-600/80 dark:text-red-200/80 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Upload Card */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="glass-card shadow-xl rounded-2xl p-6 flex flex-col h-full justify-between">
              <div>
                <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
                  Upload Resume (PDF, DOCX, or TXT)
                </h2>
              </div>
              
              <div className="flex-1 flex flex-col justify-center my-4">
                <FileUpload 
                  selectedFile={file} 
                  onFileSelect={setFile} 
                  onClear={() => setFile(null)} 
                />
              </div>

              <div className="pt-2 text-xs text-slate-500 text-center">
                Your file is parsed securely on the server. No data is shared.
              </div>
            </div>
          </div>

          {/* Target Job Card */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="glass-card shadow-xl rounded-2xl p-6 flex flex-col h-full justify-between">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Target Job (Optional)
                </h2>

                <div>
                  <label htmlFor="jobTitle" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Job Title
                  </label>
                  <input
                    id="jobTitle"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white text-sm"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="jobDescription" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Job Description
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">
                      {jobDescription.length} / {MAX_JD_LENGTH}
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      id="jobDescription"
                      maxLength={MAX_JD_LENGTH}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste job description here for targeted analysis..."
                      rows={5}
                      className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white text-sm min-h-[140px] max-h-[220px] overflow-y-auto resize-y"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={!file}
                  className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                    file 
                      ? "btn-primary shadow-lg shadow-indigo-500/20 hover:scale-[1.01]" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700/50"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  Analyze Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="page-container flex items-center justify-center font-medium text-slate-600 dark:text-slate-400">Loading upload page...</div>}>
      <ReviewPageContent />
    </Suspense>
  );
}
