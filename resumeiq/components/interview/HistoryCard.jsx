"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronRight, Briefcase, Award } from "lucide-react";
import { formatDate, getScoreColor } from "@/lib/utils";

/**
 * HistoryCard — Reusable card for the interview history page.
 */
export default function HistoryCard({ session }) {
  const scoreColor = getScoreColor(session.scores?.overall || 0);

  // Derive duration formatted
  const formatDuration = (seconds) => {
    if (!seconds) return "Unknown";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-border rounded-card p-5 shadow-card group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-text truncate max-w-[200px]">
                {session.job_title}
              </h3>
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                {session.type} Interview
              </span>
            </div>
          </div>
          
          {session.scores?.overall != null && (
            <div className="flex flex-col items-end">
              <span className={`text-xl font-heading font-bold ${scoreColor}`}>
                {session.scores.overall}%
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs text-secondary-text bg-surface px-3 py-2 rounded-lg border border-border">
            <Calendar className="w-3.5 h-3.5 text-muted" />
            <span>{formatDate(session.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-secondary-text bg-surface px-3 py-2 rounded-lg border border-border">
            <Clock className="w-3.5 h-3.5 text-muted" />
            <span>{formatDuration(session.duration)}</span>
          </div>
        </div>
      </div>

      <Link
        href={`/dashboard/interview/${session.id}`}
        className="w-full flex items-center justify-center gap-2 bg-surface hover:bg-primary/5 text-primary-text font-medium py-2.5 rounded-button border border-border hover:border-primary/30 transition-all text-sm group-hover:text-primary"
      >
        View Full Report
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
}
