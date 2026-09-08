import mammoth from 'mammoth';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const pdf = require('pdf-parse/lib/pdf-parse.js');

export async function parseResumeFile(file: Buffer, fileType: string): Promise<string> {
  try {
    if (fileType === 'pdf') {
      const data = await pdf(file);
      return data.text;
    } else if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer: file });
      return result.value;
    } else if (fileType === 'txt' || fileType === 'text' || fileType === 'text/plain') {
      return file.toString('utf8');
    } else {
      throw new Error("Unsupported file type: " + fileType);
    }
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw new Error('Failed to parse the resume file. Please ensure it is a valid PDF, DOCX, or TXT file.');
  }
}
