"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Calendar, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/context/UserContext";
import { formatDate, getScoreColor } from "@/lib/utils";

/**
 * ResumeSelector — fetches and displays all user resumes for selection.
 * Reusable across HR, Technical, and MCQ interview pages.
 *
 * @param {Object} props
 * @param {Object|null} props.selected - Currently selected resume object.
 * @param {Function} props.onSelect - Callback when a resume is selected.
 */
export default function ResumeSelector({ selected, onSelect }) {
  const { user } = useUser();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchResumes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("resumes")
        .select("id, file_name, uploaded_at, overall_score, ats_score, status")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (!error && data) {
        setResumes(data);
      }
      setLoading(false);
    };

    fetchResumes();
  }, [user]);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-card border border-border bg-card animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-heading font-semibold text-lg text-primary-text mb-1">
          No Resumes Found
        </h3>
        <p className="text-secondary-text text-sm">
          Upload a resume first to start an interview.
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {resumes.map((resume, i) => {
        const isSelected = selected?.id === resume.id;
        return (
          <motion.button
            key={resume.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(resume)}
            className={`relative text-left p-5 rounded-card border-2 transition-all duration-200 group cursor-pointer ${
              isSelected
                ? "border-primary bg-primary/5 shadow-glow-sm"
                : "border-border bg-card hover:border-primary/30 hover:shadow-card"
            }`}
          >
            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3"
              >
                <CheckCircle className="w-5 h-5 text-primary" />
              </motion.div>
            )}

            {/* File icon */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                isSelected
                  ? "bg-primary/15 text-primary"
                  : "bg-primary/5 text-muted group-hover:text-primary"
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>

            {/* Name */}
            <p className="font-semibold text-sm text-primary-text truncate pr-6">
              {resume.file_name}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-muted">
                <Calendar className="w-3 h-3" />
                {formatDate(resume.uploaded_at)}
              </span>

              {resume.ats_score != null && (
                <span
                  className={`flex items-center gap-1 text-xs font-bold ${getScoreColor(
                    resume.ats_score
                  )}`}
                >
                  <Sparkles className="w-3 h-3" />
                  ATS {resume.ats_score}
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
