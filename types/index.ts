export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ResumeSection {
  name: string;
  score: number;
  feedback: string;
  suggestions: string[];
  status: "excellent" | "good" | "needs_improvement" | "missing";
}

export interface TransferableSkill {
  jobRequirement: string;
  candidateSkill: string;
  rationale: string;
}

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  transferable?: TransferableSkill[];
  percentage: number;
}

export interface Improvement {
  priority: "high" | "medium" | "low";
  category: string;
  suggestion: string;
  exampleLine?: string;
  estimatedPoints?: number;
  honestNote?: string;
}

export interface EnhancedResumeSkillCategory {
  category: string;
  items: {
    name: string;
    isAdded?: boolean; // legacy compatibility
    isTransferable?: boolean;
    equivalentTo?: string;
    isGap?: boolean;
  }[];
}

export interface EnhancedResumeExperienceItem {
  company: string;
  role: string;
  period: string;
  location?: string;
  bullets: {
    text: string;
    hasMetrics?: boolean;
    isEnhanced?: boolean;
  }[];
}

export interface EnhancedResumeEducationItem {
  degree: string;
  institution: string;
  year?: string;
  details?: string;
}

export interface EnhancedResumeProjectItem {
  title: string;
  role?: string;
  technologies?: string[];
  bullets: string[];
}

export interface EnhancedResumeData {
  fullName: string;
  initials: string;
  targetRole: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary: string;
  skillCategories: EnhancedResumeSkillCategory[];
  experience: EnhancedResumeExperienceItem[];
  education: EnhancedResumeEducationItem[];
  projects?: EnhancedResumeProjectItem[];
  certifications?: string[];
  skillGaps?: string[];
  transferableSkills?: TransferableSkill[];
  authenticityNotice?: string;
}

export interface AnalysisResult {
  id: string;
  userId?: string;
  fileName: string;
  fileSize: number;
  analyzedAt: string;
  overallScore: number;
  atsCompatibility: number;
  authenticityScore?: number;
  sections: ResumeSection[];
  keywords: KeywordAnalysis;
  transferableSkills?: TransferableSkill[];
  strengths: string[];
  weaknesses: string[];
  improvements: Improvement[];
  summary: string;
  jobTitle?: string;
  resumeText?: string;
  enhancedResume?: EnhancedResumeData;
}

export interface ReviewHistory {
  id: string;
  userId?: string;
  fileName: string;
  overallScore: number;
  atsCompatibility: number;
  analyzedAt: string;
  summary: string;
  jobTitle?: string;
}

