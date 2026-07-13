"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  FileText,
  Eye,
  Trash2,
  ChevronDown,
  TrendingUp,
  Calendar,
  Target,
  BarChart2,
  Loader2,
  RefreshCw,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/lib/context/UserContext";
import { useToast } from "@/lib/context/ToastContext";
import { getResumes, deleteResume, getCareerReports, deleteCareerReport } from "@/lib/services/resumeService";
import { formatDate, getScoreColor, getScoreBgColor, getScoreLabel } from "@/lib/utils";

const sortOptions = ["Newest First", "Oldest First", "Highest Score", "Lowest Score"];

export default function HistoryPage() {
  const { user } = useUser();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("resumes"); // 'resumes' or 'market'
  const [resumes, setResumes] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest First");
  const [sortOpen, setSortOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch live history
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    Promise.all([
      getResumes(user.id),
      getCareerReports(user.id)
    ]).then(([resumesData, reportsData]) => {
      if (resumesData.error || reportsData.error) {
        showToast("Failed to load history.", "error");
      } else {
        setResumes(resumesData.resumes);
        setReports(reportsData.reports);
      }
      setLoading(false);
    });
  }, [user, showToast]);

  // Filter + sort for Resumes
  const filteredResumes = resumes
    .filter((h) =>
      h.file_name.toLowerCase().includes(search.toLowerCase()) ||
      (h.job_title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (h.company ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "Newest First") return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      if (sort === "Oldest First") return new Date(a.uploaded_at) - new Date(b.uploaded_at);
      if (sort === "Highest Score") return (b.overall_score ?? 0) - (a.overall_score ?? 0);
      if (sort === "Lowest Score") return (a.overall_score ?? 0) - (b.overall_score ?? 0);
      return 0;
    });

  // Filter + sort for Market Reports
  const filteredReports = reports
    .filter((h) =>
      h.job_title.toLowerCase().includes(search.toLowerCase()) ||
      (h.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (h.resumes?.file_name ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "Newest First") return new Date(b.created_at) - new Date(a.created_at);
      if (sort === "Oldest First") return new Date(a.created_at) - new Date(b.created_at);
      const scoreA = a.ai_report?.marketReadinessScore ?? 0;
      const scoreB = b.ai_report?.marketReadinessScore ?? 0;
      if (sort === "Highest Score") return scoreB - scoreA;
      if (sort === "Lowest Score") return scoreA - scoreB;
      return 0;
    });

  const currentData = activeTab === "resumes" ? filteredResumes : filteredReports;

  // Reset pagination when filter/sort/tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sort, activeTab]);

  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDeleteResume = async (resume) => {
    if (!confirm(`Delete resume "${resume.file_name}"? This cannot be undone.`)) return;
    setDeletingId(resume.id);
    const { error } = await deleteResume(resume.id, resume.file_path);
    if (error) {
      showToast("Failed to delete resume: " + error, "error");
    } else {
      setResumes((prev) => prev.filter((r) => r.id !== resume.id));
      showToast("Resume deleted.", "success");
    }
    setDeletingId(null);
  };

  const handleDeleteReport = async (report) => {
    if (!confirm(`Delete market report for "${report.job_title}"? This cannot be undone.`)) return;
    setDeletingId(report.id);
    const { error } = await deleteCareerReport(report.id);
    if (error) {
      showToast("Failed to delete report: " + error, "error");
    } else {
      setReports((prev) => prev.filter((r) => r.id !== report.id));
      showToast("Report deleted.", "success");
    }
    setDeletingId(null);
  };

  // Computed stats from live data
  const resumeScores = resumes.filter((r) => r.overall_score != null).map((r) => r.overall_score);
  const bestScore = resumeScores.length ? Math.max(...resumeScores) : 0;
  const avgScore = resumeScores.length ? Math.round(resumeScores.reduce((a, b) => a + b, 0) / resumeScores.length) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold mb-1">Analysis History</h1>
        <p className="text-secondary-text">Track your resume improvements and market intelligence over time</p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Total Uploads", value: loading ? "—" : resumes.length, icon: BarChart2, color: "text-blue-400 bg-blue-500/10" },
          { label: "Best Resume Score", value: loading ? "—" : (bestScore || "—"), icon: TrendingUp, color: "text-green-400 bg-green-500/10" },
          { label: "Avg Resume Score", value: loading ? "—" : (avgScore || "—"), icon: Target, color: "text-amber-400 bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-2xl">{value}</p>
              <p className="text-secondary-text text-xs">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-border mb-4">
        <button
          onClick={() => setActiveTab("resumes")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "resumes" ? "border-primary text-primary" : "border-transparent text-secondary-text hover:text-primary-text"
          }`}
        >
          <FileText className="w-4 h-4" />
          Resume Analyses
        </button>
        <button
          onClick={() => setActiveTab("market")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "market" ? "border-primary text-primary" : "border-transparent text-secondary-text hover:text-primary-text"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Market Intelligence
        </button>
      </div>

      {/* Search + Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="input-base w-full pl-10"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 bg-card border border-border hover:border-primary/30 text-secondary-text hover:text-primary-text px-4 py-3 rounded-input text-sm font-medium transition-all"
          >
            <Filter className="w-4 h-4" />
            {sort}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
          </button>
          {sortOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-12 bg-card border border-border rounded-xl shadow-card z-10 w-48 py-1 overflow-hidden"
            >
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSort(opt); setSortOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-surface ${sort === opt ? "text-primary font-semibold" : "text-secondary-text"}`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
          {sortOpen && <div className="fixed inset-0 z-[5]" onClick={() => setSortOpen(false)} />}
        </div>
      </motion.div>

      {/* History List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-card p-5 flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-border flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-border rounded w-1/3" />
                <div className="h-3 bg-border rounded w-1/2" />
              </div>
            </div>
          ))
        ) : (
          <AnimatePresence mode="wait">
            {currentData.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-4">
                  {activeTab === "resumes" ? <FileText className="w-8 h-8 text-muted" /> : <Briefcase className="w-8 h-8 text-muted" />}
                </div>
                <h3 className="font-semibold text-lg mb-1">No {activeTab === "resumes" ? "analyses" : "reports"} found</h3>
                <p className="text-secondary-text text-sm mb-6">
                  {search ? "Try adjusting your search" : `Generate your first ${activeTab === "resumes" ? "resume analysis" : "market report"} to get started`}
                </p>
                <Link
                  href={activeTab === "resumes" ? "/dashboard/upload" : "/dashboard/market"}
                  className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-button hover:bg-accent transition-all hover:shadow-glow-sm text-sm"
                >
                  {activeTab === "resumes" ? "Upload Resume" : "Generate Report"}
                </Link>
              </motion.div>
            ) : (
              paginatedData.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                  className="bg-card border border-border rounded-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/20 transition-all duration-200 group"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    {activeTab === "resumes" ? (
                      <FileText className="w-6 h-6 text-primary" />
                    ) : (
                      <Briefcase className="w-6 h-6 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-primary-text">
                        {activeTab === "resumes" ? (item.job_title || item.file_name) : item.job_title}
                      </h3>
                      {activeTab === "resumes" && item.overall_score != null && (
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getScoreBgColor(item.overall_score)}`}>
                          {getScoreLabel(item.overall_score)}
                        </span>
                      )}
                      {activeTab === "market" && item.ai_report?.marketReadinessScore != null && (
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${item.ai_report.marketReadinessScore >= 75 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                          {item.ai_report.marketReadinessScore >= 75 ? 'High Readiness' : 'Needs Improvement'}
                        </span>
                      )}
                    </div>
                    <p className="text-secondary-text text-sm mt-0.5">
                      {activeTab === "resumes" 
                        ? `${item.company ? `${item.company} · ` : ""}${item.file_name}`
                        : `${item.location ? `${item.location} · ` : ""}Resume: ${item.resumes?.file_name || "Unknown"}`
                      }
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(activeTab === "resumes" ? item.uploaded_at : item.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  {activeTab === "resumes" && item.overall_score != null && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={`font-heading text-3xl font-bold ${getScoreColor(item.overall_score)}`}>
                        {item.overall_score}
                      </span>
                      <span className="text-muted text-sm">/100</span>
                    </div>
                  )}
                  {activeTab === "market" && item.ai_report?.marketReadinessScore != null && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={`font-heading text-3xl font-bold ${item.ai_report.marketReadinessScore >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {item.ai_report.marketReadinessScore}
                      </span>
                      <span className="text-muted text-sm">/100</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={activeTab === "resumes" ? `/dashboard/analysis/${item.id}` : `/dashboard/market/${item.id}`}
                      className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-button bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Link>
                    <button
                      onClick={() => activeTab === "resumes" ? handleDeleteResume(item) : handleDeleteReport(item)}
                      disabled={deletingId === item.id}
                      className="w-9 h-9 rounded-button bg-surface border border-border hover:border-danger hover:bg-danger/10 text-muted hover:text-danger flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                      aria-label="Delete"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium rounded-button border border-border bg-card hover:bg-surface disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-secondary-text">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium rounded-button border border-border bg-card hover:bg-surface disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
