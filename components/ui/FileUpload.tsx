"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileText, X } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function FileUpload({ onFileSelect, selectedFile, onClear }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isFileTooLarge = fileRejections.length > 0 && fileRejections[0].errors[0].code === "file-too-large";

  return (
    <div className="w-full h-full flex flex-col justify-center">
      {selectedFile ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl flex items-center justify-between border border-indigo-500/30 bg-indigo-500/10 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      ) : (
        <div
          {...getRootProps()}
          className={`relative overflow-hidden rounded-xl border border-solid p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
            isDragActive
              ? "border-indigo-500 bg-indigo-500/10 shadow-indigo-500/10 shadow-lg scale-[1.01]"
              : "border-slate-800 bg-slate-950/50 hover:border-indigo-500/40 hover:bg-slate-800/40"
          }`}
        >
          <input {...getInputProps()} />
          <motion.div
            initial={false}
            animate={{ scale: isDragActive ? 1.05 : 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className={`p-4 rounded-2xl transition-all duration-200 ${isDragActive ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800/80 text-slate-400"}`}>
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-200">
                {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF and DOCX (Max 10MB)
              </p>
            </div>
          </motion.div>
          {isFileTooLarge && (
            <p className="text-red-400 text-xs mt-4 font-medium">File is larger than 10MB limit.</p>
          )}
        </div>
      )}
    </div>
  );
}
