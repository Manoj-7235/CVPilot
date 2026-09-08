import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/gemini';
import { parseResumeFile } from '@/lib/parseResume';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function validateResumeContent(text: string): { isValid: boolean; errorReason?: string } {
  const clean = text.toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length < 30) {
    return {
      isValid: false,
      errorReason: "The uploaded file contains insufficient text to be a resume. Please upload a complete resume document."
    };
  }

  // Core resume section & structural signals
  const resumeSignals = [
    "experience", "employment", "work history", "work experience",
    "education", "university", "college", "bachelor", "master", "degree", "diploma", "gpa", "cgpa",
    "skills", "technologies", "proficiencies", "competencies", "technical skills",
    "projects", "portfolio", "achievements", "accomplishments",
    "summary", "objective", "profile", "about me", "curriculum vitae", "resume", "cv",
    "email", "phone", "linkedin", "github", "contact"
  ];

  let signalCount = 0;
  resumeSignals.forEach(signal => {
    if (clean.includes(signal)) {
      signalCount++;
    }
  });

  // A valid resume must contain at least 2 structural resume signals
  if (signalCount < 2) {
    return {
      isValid: false,
      errorReason: "The uploaded document does not appear to be a valid resume. Please upload a professional resume containing sections such as Work Experience, Education, Skills, or Projects."
    };
  }

  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobDescription = formData.get('jobDescription') as string | null;
    const jobTitle = formData.get('jobTitle') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isPdf = file.type === 'application/pdf' || extension === 'pdf';
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx';
    const isTxt = file.type === 'text/plain' || extension === 'txt';
    
    if (!isPdf && !isDocx && !isTxt) {
      return NextResponse.json({ error: 'Invalid file format. Please upload a PDF, DOCX, or TXT resume file.' }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Maximum allowed size is 10MB.' }, { status: 400 });
    }

    // Parse the file
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = isPdf ? 'pdf' : isDocx ? 'docx' : 'txt';
    const resumeText = await parseResumeFile(buffer, fileType);

    if (!resumeText || resumeText.trim().length < 30) {
      return NextResponse.json({ error: 'Could not extract text from the file. Please ensure the file is not corrupted or image-only.' }, { status: 400 });
    }

    // Validate that the document is actually a resume
    const resumeValidation = validateResumeContent(resumeText);
    if (!resumeValidation.isValid) {
      return NextResponse.json({ error: resumeValidation.errorReason }, { status: 400 });
    }

    // Analyze with AI
    const analysis = await analyzeResume(resumeText, jobDescription || undefined, jobTitle || undefined);

    return NextResponse.json({
      ...analysis,
      resumeText,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'An error occurred during analysis. Please ensure you are uploading a valid resume file.' },
      { status: 500 }
    );
  }
}
