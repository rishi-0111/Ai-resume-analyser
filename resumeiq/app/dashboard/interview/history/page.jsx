"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { History, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/context/UserContext";

// Components
import HistoryCard from "@/components/interview/HistoryCard";

export default function InterviewHistoryPage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (dbError) throw dbError;
      setSessions(data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load interview history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-heading text-3xl font-bold">Interview History</h1>
          </div>
          <p className="text-secondary-text max-w-2xl">
            Review your past mock interviews, track your progress, and revisit AI feedback to improve your performance.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="p-2.5 rounded-button bg-surface border border-border text-muted hover:text-primary-text transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
          <Link
            href="/dashboard/interview"
            className="flex items-center gap-2 bg-primary hover:bg-accent text-white font-semibold px-6 py-2.5 rounded-button transition-all duration-200 shadow-sm hover:shadow-glow-sm"
          >
            <Plus className="w-4 h-4" />
            New Interview
          </Link>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 bg-card border border-border rounded-card animate-pulse shadow-sm" />
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-danger/10 border border-danger/30 rounded-card p-6 flex flex-col items-center text-center max-w-md mx-auto"
          >
            <AlertCircle className="w-8 h-8 text-danger mb-2" />
            <p className="text-sm text-danger font-medium">{error}</p>
          </motion.div>
        ) : sessions.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-card border border-border rounded-card p-12 flex flex-col items-center text-center max-w-xl mx-auto shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-primary-text mb-2">
              No Interviews Yet
            </h3>
            <p className="text-secondary-text text-sm mb-6">
              You haven't completed any mock interviews. Start one now to practice your skills and get AI feedback.
            </p>
            <Link
              href="/dashboard/interview"
              className="bg-primary hover:bg-accent text-white font-medium px-6 py-2.5 rounded-button transition-colors"
            >
              Start Practice
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <HistoryCard session={session} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
