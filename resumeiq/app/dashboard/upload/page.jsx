"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Clock,
  Eye,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { mockHistory } from "@/lib/mock-data";
import { formatRelativeTime, getScoreColor } from "@/lib/utils";

export default function UploadPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }, []);

  const handleFileInput = (e) => {
    const f = e.target.files[0];
    if (f) validateAndSetFile(f);
  };

  const validateAndSetFile = (f) => {
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(f.type)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      return;
    }
    setError("");
    setFile(f);
  };

  const handleAnalyze = () => {
    if (!file) {
      setError("Please upload a resume first.");
      return;
    }
    setAnalyzing(true);
    router.push("/dashboard/loading-analysis");
  };

  const removeFile = () => {
    setFile(null);
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-2xl font-bold mb-1">Upload & Analyze</h1>
        <p className="text-secondary-text">
          Upload your resume to get an instant AI-powered analysis with ATS
          score, skill gaps, and improvement suggestions.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Area — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-card border-2 border-dashed transition-all duration-300 overflow-hidden ${
              dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : file
                ? "border-success/40 bg-success/5"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            {/* Animated border glow on hover */}
            {dragOver && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-pulse" />
            )}

            <div className="relative z-10 p-12 flex flex-col items-center text-center">
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="space-y-4 w-full"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8 text-success" />
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm font-semibold text-success">
                          File Ready
                        </span>
                      </div>
                      <p className="font-semibold text-primary-text">
                        {file.name}
                      </p>
                      <p className="text-sm text-muted mt-1">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={removeFile}
                      className="flex items-center gap-2 mx-auto text-sm text-muted hover:text-danger transition-colors px-4 py-2 rounded-lg hover:bg-danger/10"
                    >
                      <X className="w-4 h-4" />
                      Remove file
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <motion.div
                      animate={dragOver ? { scale: 1.1 } : { scale: 1 }}
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto transition-colors duration-300 ${
                        dragOver ? "bg-primary/20 border-primary" : "bg-surface border border-border"
                      }`}
                    >
                      <Upload className={`w-8 h-8 transition-colors ${dragOver ? "text-primary" : "text-muted"}`} />
                    </motion.div>

                    <div>
                      <p className="text-lg font-semibold text-primary-text">
                        {dragOver ? "Drop it here!" : "Drag & drop your resume"}
                      </p>
                      <p className="text-secondary-text text-sm mt-1">
                        or click to browse files
                      </p>
                    </div>

                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileInput}
                        className="sr-only"
                        id="file-upload"
                      />
                      <span className="inline-flex items-center gap-2 bg-primary hover:bg-accent text-white font-semibold px-6 py-2.5 rounded-button transition-all duration-200 hover:shadow-glow-sm text-sm">
                        <Paperclip className="w-4 h-4" />
                        Browse Files
                      </span>
                    </label>

                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border">
                        <FileText className="w-3 h-3" /> PDF
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border">
                        <FileText className="w-3 h-3" /> DOCX
                      </span>
                      <span className="text-muted">Max 10MB</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Job Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary-text flex items-center gap-2">
              Job Description
              <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full border border-border">
                Optional — improves analysis accuracy
              </span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to get a tailored analysis with job match percentage, targeted keyword suggestions, and role-specific interview questions..."
              rows={8}
              className="input-base w-full resize-none"
            />
            <p className="text-xs text-muted text-right">
              {jobDescription.length} characters
            </p>
          </div>

          {/* Analyze Button */}
          <motion.button
            onClick={handleAnalyze}
            disabled={!file || analyzing}
            whileHover={{ scale: file ? 1.02 : 1 }}
            whileTap={{ scale: file ? 0.98 : 1 }}
            className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-accent text-white font-bold py-4 px-8 rounded-button transition-all duration-200 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {analyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting Analysis...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Analyze My Resume
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Tips */}
          <div className="bg-card border border-border rounded-card p-5">
            <h3 className="font-semibold text-sm mb-4 text-primary-text">
              💡 Tips for best results
            </h3>
            <ul className="space-y-3">
              {[
                "Use a text-based PDF, not a scanned image",
                "Include a job description for a job match score",
                "Make sure your resume is in English",
                "Remove any password protection from the file",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-secondary-text">
                  <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Uploads */}
          <div className="bg-card border border-border rounded-card p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted" />
              Recent Uploads
            </h3>
            <div className="space-y-3">
              {mockHistory.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary-text truncate">
                      {item.jobTitle}
                    </p>
                    <p className="text-[10px] text-muted">
                      {formatRelativeTime(item.uploadedAt)}
                    </p>
                  </div>
                  <span className={`text-xs font-bold ${getScoreColor(item.overallScore)}`}>
                    {item.overallScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
