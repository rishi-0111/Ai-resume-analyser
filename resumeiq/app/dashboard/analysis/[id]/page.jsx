"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Download,
  Share2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Star,
  AlertTriangle,
  Target,
  Zap,
  TrendingUp,
  FileText,
  BookOpen,
  Loader2,
  Copy,
} from "lucide-react";

import Link from "next/link";
import { getResumeById } from "@/lib/services/resumeService";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ScoreRing({ score, size = 100, strokeWidth = 8, color = "#2563EB", label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" stroke="#1F2937" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            stroke={color}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading font-bold text-xl">{score}</span>
        </div>
      </div>
      {label && <span className="text-xs text-secondary-text">{label}</span>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-card">
        <p className="text-xs text-muted mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function InterviewCard({ q, index }) {
  const [open, setOpen] = useState(false);
  const categoryColors = {
    Technical: "text-blue-400 bg-blue-400/10",
    Behavioral: "text-purple-400 bg-purple-400/10",
    "System Design": "text-amber-400 bg-amber-400/10",
    "Culture Fit": "text-green-400 bg-green-400/10",
  };
  const color = categoryColors[q.category] || "text-muted bg-muted/10";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${color}`}>
          {q.category}
        </span>
        <span className="flex-1 text-sm font-medium text-primary-text">
          {q.question}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />}
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 pt-1 border-t border-border">
            <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3">
              <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-primary mb-1">Interview Tip</p>
                <p className="text-xs text-secondary-text leading-relaxed">{q.tip}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AnalysisPage({ params }) {
  // Unify params unwrapping (Next.js 15+ best practice)
  const resolvedParams = use(params);
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    async function loadData() {
      try {
        const { resume, error: dbError } = await getResumeById(resolvedParams.id);
        if (dbError || !resume) throw new Error(dbError || "Resume not found");
        if (!resume.analysis_data) throw new Error("Analysis data is missing for this resume.");
        
        // Merge db fields into the structured analysis output expected by UI
        const data = {
          ...resume.analysis_data,
          id: resume.id,
          fileName: resume.file_name,
          uploadedAt: resume.uploaded_at,
          jobTitle: resume.job_title,
          company: resume.company
        };
        setAnalysis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="text-xl font-bold">Analysis Not Found</h2>
        <p className="text-secondary-text">{error || "Could not load analysis data."}</p>
        <Link href="/dashboard">
          <button className="mt-4 px-4 py-2 bg-card border border-border rounded-lg">Back to Dashboard</button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "sections", label: "Sections" },
    { id: "suggestions", label: "AI Suggestions" },
    { id: "interview", label: "Interview Prep" },
    { id: "cover-letter", label: "Cover Letter" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted text-sm mb-1">
            <span>{analysis.jobTitle}</span>
            <span>·</span>
            <span>{analysis.company}</span>
          </div>
          <h1 className="font-heading text-2xl font-bold">{analysis.fileName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/upload">
            <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-button bg-card border border-border hover:border-primary/30 text-secondary-text hover:text-primary-text transition-all">
              <RefreshCw className="w-4 h-4" />
              Analyze Again
            </button>
          </Link>
          <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-button bg-card border border-border hover:border-primary/30 text-secondary-text hover:text-primary-text transition-all">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-button bg-primary hover:bg-accent text-white transition-all hover:shadow-glow-sm">
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </motion.div>

      {/* Score Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overall Score", score: analysis.overallScore, color: "#2563EB", icon: Star },
          { label: "ATS Score", score: analysis.atsScore, color: "#8B5CF6", icon: Target },
          { label: "Job Match", score: analysis.jobMatch, color: "#22C55E", icon: TrendingUp },
          { label: "Resume Health", score: analysis.resumeHealth, color: "#F59E0B", icon: Zap },
        ].map(({ label, score, color, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 + 0.2 }}
            className="bg-card border border-border rounded-card p-6 flex flex-col items-center text-center hover:border-primary/20 transition-all duration-300"
          >
            <Icon className="w-5 h-5 mb-3" style={{ color }} />
            <ScoreRing score={score} size={90} color={color} />
            <p className="text-secondary-text text-sm mt-3">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 bg-surface/50 border border-border rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSection === tab.id
                ? "bg-primary text-white shadow-glow-sm"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* AI Summary Card */}
          <motion.div variants={itemVariants} className="bg-card border border-border rounded-card p-6">
            <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              AI Summary & Career Profile
            </h3>
            <p className="text-sm text-secondary-text leading-relaxed mb-4">
              {analysis.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-semibold">
                Level: {analysis.careerLevel}
              </span>
              {analysis.recommendedJobRoles?.map((role, i) => (
                <span key={i} className="px-3 py-1 bg-surface border border-border text-muted rounded-full text-xs">
                  {role}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <motion.div variants={itemVariants} className="bg-card border border-border rounded-card p-6">
            <h3 className="font-heading font-semibold mb-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Resume Analysis Radar
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={analysis.radarData}>
                <PolarGrid stroke="#1F2937" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                <Radar name="Score" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} dot={{ fill: "#2563EB", r: 3 }} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart */}
          <motion.div variants={itemVariants} className="bg-card border border-border rounded-card p-6">
            <h3 className="font-heading font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Score vs Previous
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analysis.barData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="prev" name="Previous" fill="#1F2937" radius={[4, 4, 0, 0]} />
                <Bar dataKey="score" name="Current" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Strengths */}
          <motion.div variants={itemVariants} className="bg-card border border-border rounded-card p-6">
            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2 text-success">
              <CheckCircle className="w-4 h-4" />
              Strengths
            </h3>
            <ul className="space-y-3">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/10 border border-success/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-sm text-secondary-text">{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Weaknesses */}
          <motion.div variants={itemVariants} className="bg-card border border-border rounded-card p-6">
            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2 text-warning">
              <AlertTriangle className="w-4 h-4" />
              Areas to Improve
            </h3>
            <ul className="space-y-3">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-warning/10 border border-warning/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-3 h-3 text-warning" />
                  </div>
                  <span className="text-sm text-secondary-text">{w}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Missing Skills */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-card border border-border rounded-card p-6">
            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-danger" />
              Missing Skills
              <span className="text-xs text-muted font-normal ml-auto">Add these to boost your score</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map(({ skill, priority }) => {
                const colors = {
                  high: "bg-danger/10 text-danger border-danger/30",
                  medium: "bg-warning/10 text-warning border-warning/30",
                  low: "bg-muted/10 text-muted border-muted/30",
                };
                return (
                  <span
                    key={skill}
                    className={`flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-full border font-medium transition-all hover:scale-105 cursor-default ${colors[priority]}`}
                  >
                    {skill}
                    <span className="text-[10px] uppercase opacity-60">{priority}</span>
                  </span>
                );
              })}
            </div>
          </motion.div>

          {/* Suggested Projects */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-card border border-border rounded-card p-6">
            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Suggested Projects to Build
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {analysis.suggestedProjects.map((p) => (
                <div
                  key={p.title}
                  className="bg-surface border border-border rounded-xl p-4 hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-primary-text group-hover:text-white transition-colors">
                      {p.title}
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.impact === "High" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
                      {p.impact} Impact
                    </span>
                  </div>
                  <p className="text-xs text-secondary-text leading-relaxed mb-3">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Grammar & Keywords (New) */}
          {(analysis.grammarIssues?.length > 0 || analysis.keywordSuggestions?.length > 0) && (
            <motion.div variants={itemVariants} className="bg-card border border-border rounded-card p-6 lg:col-span-2">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Grammar Issues */}
                <div>
                  <h3 className="font-heading font-semibold mb-4 flex items-center gap-2 text-danger">
                    <AlertTriangle className="w-4 h-4" />
                    Grammar & Phrasing Issues
                  </h3>
                  {analysis.grammarIssues?.length > 0 ? (
                    <ul className="space-y-3">
                      {analysis.grammarIssues.map((g, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
                          </div>
                          <span className="text-sm text-secondary-text">{g}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted">No major grammar issues detected!</p>
                  )}
                </div>

                {/* Keyword Suggestions */}
                <div>
                  <h3 className="font-heading font-semibold mb-4 flex items-center gap-2 text-primary">
                    <Target className="w-4 h-4" />
                    Missing ATS Keywords
                  </h3>
                  {analysis.keywordSuggestions?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordSuggestions.map((k, i) => (
                        <span key={i} className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-medium text-secondary-text">
                          {k}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Your resume contains great keyword coverage.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {activeSection === "sections" && (
        <div className="space-y-4">
          {analysis.sectionScores.map((section, i) => {
            const pct = (section.score / section.max) * 100;
            const color =
              pct >= 80 ? "#22C55E" : pct >= 60 ? "#F59E0B" : "#EF4444";
            return (
              <motion.div
                key={section.section}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-card p-5 flex items-center gap-6"
              >
                <div className="w-32 flex-shrink-0">
                  <p className="font-semibold text-sm">{section.section}</p>
                </div>
                <div className="flex-1">
                  <div className="progress-bar">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right flex-shrink-0">
                  <span className="font-bold text-lg" style={{ color }}>
                    {section.score}
                  </span>
                  <span className="text-muted text-sm">/{section.max}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {activeSection === "suggestions" && (
        <div className="space-y-6">
          {analysis.aiSuggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-card p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">{s.section} Section</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-danger mb-2 uppercase tracking-wide">Before</p>
                  <p className="text-sm text-secondary-text leading-relaxed">{s.original}</p>
                </div>
                <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-success mb-2 uppercase tracking-wide">AI Improved</p>
                  <p className="text-sm text-secondary-text leading-relaxed">{s.improved}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3">
                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-secondary-text">{s.reason}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeSection === "interview" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-semibold text-lg">
              Interview Questions for {analysis.company}
            </h2>
          </div>
          {analysis.interviewQuestions.map((q, i) => (
            <InterviewCard key={i} q={q} index={i} />
          ))}
        </div>
      )}

      {activeSection === "cover-letter" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Tailored Cover Letter
            </h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(analysis.coverLetter);
              }}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-button bg-surface border border-border hover:border-primary/30 text-secondary-text hover:text-primary-text transition-all"
            >
              <Copy className="w-4 h-4" />
              Copy to Clipboard
            </button>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-secondary-text leading-relaxed whitespace-pre-wrap">
            {analysis.coverLetter || "No cover letter was generated. Please try analyzing again."}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
