"use client";

import { motion } from "framer-motion";
import Link from "next/link";
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
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  mockUser,
  mockDashboardStats,
  mockActivity,
  mockHistory,
  quickActions,
} from "@/lib/mock-data";
import { formatRelativeTime, getScoreColor, getScoreBgColor, getScoreLabel } from "@/lib/utils";

const iconMap = {
  FileText,
  Target,
  Briefcase,
  BarChart: BarChart2,
  Upload,
  History,
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function StatCard({ stat, index }) {
  const Icon = iconMap[stat.icon] || FileText;
  const colorClasses = {
    primary: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    success: "text-green-400 bg-green-500/10 border-green-500/20",
    warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-card border border-border rounded-card p-6 hover:border-primary/20 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorClasses[stat.color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          {stat.change}
        </div>
      </div>

      <div className="flex items-end gap-1">
        <span className="font-heading text-3xl font-bold text-primary-text">
          {stat.value}
        </span>
        <span className="text-secondary-text text-sm mb-1">{stat.unit}</span>
      </div>
      <p className="text-secondary-text text-sm mt-1">{stat.label}</p>
    </motion.div>
  );
}

function ActivityIcon({ type }) {
  if (type === "analysis") return <BarChart2 className="w-4 h-4 text-primary" />;
  if (type === "upload") return <Upload className="w-4 h-4 text-green-400" />;
  return <CheckCircle className="w-4 h-4 text-secondary-text" />;
}

export default function DashboardPage() {
  const recentUploads = mockHistory.slice(0, 5);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-muted text-sm mb-1">{today}</p>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {mockUser.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-secondary-text max-w-lg">
            Your resume score has improved by{" "}
            <span className="text-success font-semibold">14 points</span> since
            last week. Keep optimizing to land that dream role!
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mockDashboardStats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Analyses — Takes 2 cols */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-lg">Recent Analyses</h2>
            <Link
              href="/dashboard/history"
              className="text-sm text-primary hover:text-accent transition-colors flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-card divide-y divide-border overflow-hidden">
            {recentUploads.map((item, i) => (
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
                    {item.jobTitle}
                  </p>
                  <p className="text-xs text-muted">{item.company} · {formatRelativeTime(item.uploadedAt)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-sm font-bold ${getScoreColor(item.overallScore)}`}
                  >
                    {item.overallScore}
                  </span>
                  <Link
                    href={`/dashboard/analysis/${item.id}`}
                    className="text-xs text-primary hover:text-accent transition-colors font-medium px-3 py-1.5 bg-primary/10 rounded-full"
                  >
                    View
                  </Link>
                </div>
              </motion.div>
            ))}
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
                { icon: Target, label: "Best Score", href: "/dashboard/analysis/analysis-001", color: "text-green-400 bg-green-500/10" },
                { icon: Briefcase, label: "Profile", href: "/dashboard/profile", color: "text-amber-400 bg-amber-500/10" },
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

          {/* Activity Timeline */}
          <motion.div variants={itemVariants}>
            <h2 className="font-heading font-semibold text-lg mb-4">Activity</h2>
            <div className="bg-card border border-border rounded-card p-4 space-y-4">
              {mockActivity.slice(0, 4).map((activity, i) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
                      <ActivityIcon type={activity.type} />
                    </div>
                    {i < mockActivity.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-sm font-medium text-primary-text leading-snug">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{activity.detail}</p>
                    <p className="text-xs text-muted mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatRelativeTime(activity.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Resume Score Overview Card */}
      <motion.div variants={itemVariants} className="bg-card border border-border rounded-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading font-semibold text-lg">Resume Improvement Journey</h2>
            <p className="text-secondary-text text-sm mt-1">Your scores across all analyses</p>
          </div>
          <Link href="/dashboard/history" className="text-sm text-primary hover:text-accent transition-colors">
            Full history →
          </Link>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {mockHistory.slice(0, 6).map((h, i) => (
            <div key={h.id} className="text-center">
              <div className="relative w-14 h-14 mx-auto mb-2">
                <svg className="w-14 h-14 -rotate-90">
                  <circle cx="28" cy="28" r="22" strokeWidth="4" fill="none" stroke="#1F2937" />
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    strokeWidth="4"
                    fill="none"
                    stroke={h.overallScore >= 80 ? "#22C55E" : h.overallScore >= 60 ? "#F59E0B" : "#EF4444"}
                    strokeDasharray={`${(h.overallScore / 100) * 138.2} 138.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {h.overallScore}
                </span>
              </div>
              <p className="text-[10px] text-muted truncate">{h.company}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
