"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  Briefcase, 
  Target, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  BookOpen, 
  ArrowLeft,
  Lightbulb,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MarketReportPage({ params }) {
  // Unwrap params using React 19 `use` hook
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      const { data, error } = await supabase
        .from("career_reports")
        .select("*, resumes(file_name)")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Report not found", error);
        router.push("/dashboard/market");
        return;
      }
      setReport(data);
      setLoading(false);
    }
    fetchReport();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-secondary-text animate-pulse">Loading market intelligence report...</p>
      </div>
    );
  }

  const ai = report.ai_report;
  const isHighReady = ai.marketReadinessScore >= 75;
  const readinessColor = isHighReady ? "text-emerald-500" : (ai.marketReadinessScore >= 50 ? "text-amber-500" : "text-rose-500");

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/market" className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Market Intelligence
          </Link>
          <h1 className="text-3xl font-heading font-bold text-primary-text flex items-center gap-3">
            Market Report: {report.job_title}
          </h1>
          <p className="text-secondary-text mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> {report.location || "Any Location"} &bull; Resume: {report.resumes?.file_name}
          </p>
        </div>
        
        {/* Top Level Score */}
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm flex items-center gap-6">
          <div>
            <p className="text-sm text-muted font-medium mb-1">Market Readiness</p>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold font-heading ${readinessColor}`}>
                {ai.marketReadinessScore}
              </span>
              <span className="text-secondary-text mb-1">/ 100</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-card border border-border">
            {isHighReady ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Skills & Insights */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Hiring Trends */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-primary-text">Current Hiring Trends</h2>
            </div>
            <p className="text-secondary-text leading-relaxed">{ai.hiringTrends}</p>
          </motion.div>

          {/* Skills Gap Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-bold text-primary-text">Trending Skills</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {ai.trendingSkills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h2 className="text-lg font-bold text-primary-text">Missing Skills</h2>
              </div>
              {ai.missingSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ai.missingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-500 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> You have all the trending skills!
                </p>
              )}
            </motion.div>
          </div>

          {/* Learning Roadmap */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-primary-text">Custom Learning Roadmap</h2>
            </div>
            <div className="space-y-4">
              {ai.learningRoadmap?.map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-text text-base">{item.topic}</h3>
                    <p className="text-sm text-secondary-text mt-1">{item.actionableStep}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Salary, Jobs & AI Suggestions */}
        <div className="space-y-6">
          
          {/* Salary Insights */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-primary-text">Salary Insights</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-card rounded-xl border border-border">
                <span className="text-sm text-muted">Minimum</span>
                <span className="font-semibold text-primary-text">${ai.salaryInsights?.min?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="text-sm font-medium text-emerald-600">Median Market</span>
                <span className="font-bold text-emerald-600">${ai.salaryInsights?.median?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-card rounded-xl border border-border">
                <span className="text-sm text-muted">Maximum</span>
                <span className="font-semibold text-primary-text">${ai.salaryInsights?.max?.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* AI Suggestions */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-primary-text">AI Suggestions</h2>
            </div>
            <ul className="space-y-3">
              {ai.aiSuggestions?.map((suggestion, i) => (
                <li key={i} className="flex gap-3 text-sm text-secondary-text leading-relaxed">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Recommended Jobs */}
          {ai.recommendedJobs?.length > 0 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-primary-text">Live Jobs</h2>
              </div>
              <div className="space-y-3">
                {ai.recommendedJobs.map((job, i) => (
                  <a 
                    key={i} 
                    href={job.link || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <h3 className="font-medium text-primary-text text-sm group-hover:text-primary transition-colors flex justify-between items-start gap-2">
                      {job.title}
                      <ExternalLink className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                    </h3>
                    <p className="text-xs text-muted mt-1">{job.employer}</p>
                  </a>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
