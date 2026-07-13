"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText,
  Target,
  Briefcase,
  BarChart2,
  Upload,
  History,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useUser } from "@/lib/context/UserContext";
import { getResumes, getResumeStats } from "@/lib/services/resumeService";
import { formatRelativeTime, getScoreColor } from "@/lib/utils";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [recentUploads, setRecentUploads] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const firstName = userName.split(" ")[0];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Fetch live dashboard data
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoadingData(true);
      const { stats: liveStats } = await getResumeStats(user.id);
      setStats(liveStats);
      setRecentUploads(liveStats?.recentUploads ?? []);
      setLoadingData(false);
    }

    fetchData();
  }, [user]);

  // Build live stat cards from real data
  const statCards = [
    {
      label: "Total Resumes",
      value: stats?.total ?? 0,
      unit: "",
      icon: FileText,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Best ATS Score",
      value: stats?.bestAts ?? "—",
      unit: "/100",
      icon: TrendingUp,
      color: "text-green-500 bg-green-500/10 border-green-500/20",
    },
    {
      label: "Average ATS Score",
      value: stats?.avgAts ?? "—",
      unit: "/100",
      icon: BarChart2,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Latest ATS Score",
      value: stats?.latestAts ?? "—",
      unit: "/100",
      icon: Target,
      color: "text-primary bg-primary/10 border-primary/20",
      trend: stats?.trend,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl"
    >
      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 rounded-card p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-muted text-sm mb-1">{today}</p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-secondary-text max-w-lg">
            {stats?.total
              ? `You've uploaded ${stats.total} resume${stats.total === 1 ? "" : "s"} so far. Keep optimizing to land that dream role!`
              : "Upload your first resume to start tracking your progress and improving your score."}
          </p>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 mt-6 bg-primary hover:bg-accent text-white font-semibold px-6 py-2.5 rounded-button transition-all duration-200 hover:shadow-glow-sm group text-sm"
          >
            <Upload className="w-4 h-4" />
            Analyze New Resume
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid — Live Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="bg-card border border-border rounded-card p-6 hover:border-primary/20 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {stat.trend != null && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${stat.trend > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {stat.trend > 0 ? "+" : ""}{stat.trend} pts
                  </span>
                )}
              </div>
              <div className="flex items-end gap-1">
                <span className="font-heading text-3xl font-bold text-primary-text">
                  {loadingData ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted" />
                  ) : stat.value}
                </span>
                {!loadingData && stat.unit && (
                  <span className="text-secondary-text text-sm mb-1">{stat.unit}</span>
                )}
              </div>
              <p className="text-secondary-text text-sm mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Analyses — Takes 2 cols */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-lg">Recent Uploads</h2>
            <Link
              href="/dashboard/history"
              className="text-sm text-primary hover:text-accent transition-colors flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-card divide-y divide-border overflow-hidden">
            {loadingData ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-border flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-border rounded w-1/2" />
                    <div className="h-2 bg-border rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : recentUploads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-muted" />
                </div>
                <p className="text-sm font-medium text-secondary-text mb-1">No resumes yet</p>
                <p className="text-xs text-muted mb-4">Upload your first resume to see your analysis here</p>
                <Link
                  href="/dashboard/upload"
                  className="text-sm text-primary hover:text-accent font-medium transition-colors"
                >
                  Upload Now →
                </Link>
              </div>
            ) : (
              recentUploads.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                  className="flex items-center gap-4 p-4 hover:bg-surface/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-text truncate">
                      {item.file_name}
                    </p>
                    <p className="text-xs text-muted">{formatRelativeTime(item.uploaded_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {item.overall_score != null ? (
                      <span className={`text-sm font-bold ${getScoreColor(item.overall_score)}`}>
                        {item.overall_score}
                      </span>
                    ) : (
                      <span className="text-xs text-muted bg-surface px-2 py-1 rounded-full border border-border">
                        Pending
                      </span>
                    )}
                    <Link
                      href={`/dashboard/analysis/${item.id}`}
                      className="text-xs text-primary hover:text-accent transition-colors font-medium px-3 py-1.5 bg-primary/10 rounded-full"
                    >
                      View
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="font-heading font-semibold text-lg mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Upload, label: "New Analysis", href: "/dashboard/upload", color: "text-blue-400 bg-blue-500/10" },
                { icon: History, label: "History", href: "/dashboard/history", color: "text-purple-400 bg-purple-500/10" },
                { icon: Target, label: "Profile", href: "/dashboard/profile", color: "text-green-400 bg-green-500/10" },
                { icon: Briefcase, label: "Settings", href: "/dashboard/settings", color: "text-amber-400 bg-amber-500/10" },
              ].map(({ icon: Icon, label, href, color }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-secondary-text group-hover:text-primary-text transition-colors text-center">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Score Journey */}
          <motion.div variants={itemVariants}>
            <h2 className="font-heading font-semibold text-lg mb-4">Score Journey</h2>
            <div className="bg-card border border-border rounded-card p-4">
              {loadingData ? (
                <div className="flex gap-4 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex-1 space-y-2">
                      <div className="h-10 bg-border rounded-full mx-auto w-10" />
                      <div className="h-2 bg-border rounded" />
                    </div>
                  ))}
                </div>
              ) : recentUploads.filter(r => r.overall_score != null).length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-xs text-muted">Upload a resume to see your score journey</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {recentUploads.filter(r => r.overall_score != null).slice(0, 4).map((h) => (
                    <div key={h.id} className="text-center">
                      <div className="relative w-12 h-12 mx-auto mb-1">
                        <svg className="w-12 h-12 -rotate-90">
                          <circle cx="24" cy="24" r="19" strokeWidth="3" fill="none" stroke="#E5E7EB" />
                          <circle
                            cx="24" cy="24" r="19" strokeWidth="3" fill="none"
                            stroke={h.overall_score >= 80 ? "#16A34A" : h.overall_score >= 60 ? "#D97706" : "#DC2626"}
                            strokeDasharray={`${(h.overall_score / 100) * 119.4} 119.4`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                          {h.overall_score}
                        </span>
                      </div>
                      <p className="text-[9px] text-muted truncate">{formatRelativeTime(h.uploaded_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
