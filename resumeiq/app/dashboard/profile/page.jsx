"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  MapPin,
  Briefcase,
  Mail,
  Edit3,
  CheckCircle,
  TrendingUp,
  FileText,
  Target,
  Award,
  Upload,
  Star,
  Zap,
  BarChart2,
  Loader2,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { useUser } from "@/lib/context/UserContext";
import { useToast } from "@/lib/context/ToastContext";
import { getProfile, updateProfile, upsertProfile } from "@/lib/services/profileService";
import { getResumeStats } from "@/lib/services/resumeService";

const iconMap = { Upload, TrendingUp, Target, BarChart2: BarChart2, Zap };

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ProfilePage() {
  const { user } = useUser();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saved, setSaved] = useState(false);
  const [resumeStats, setResumeStats] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    location: "",
    plan: "Free",
  });

  // Load profile + resume stats on mount
  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoadingProfile(true);
      // Ensure profile row exists
      const { profile: dbProfile } = await getProfile(user.id);
      setProfile({
        name: dbProfile?.full_name || user.user_metadata?.full_name || "",
        email: user.email ?? "",
        role: dbProfile?.role ?? "",
        location: dbProfile?.location ?? "",
        plan: dbProfile?.plan ?? "Free",
      });
      setLoadingProfile(false);

      // Also fetch resume stats for sidebar widgets
      const { stats } = await getResumeStats(user.id);
      setResumeStats(stats);
    }

    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await updateProfile(user.id, {
      full_name: profile.name,
      role: profile.role,
      location: profile.location,
    });

    setSaving(false);
    setEditing(false);

    if (error) {
      showToast("Failed to save profile: " + error.message, "error");
    } else {
      setSaved(true);
      showToast("Profile saved successfully!", "success");
      setTimeout(() => setSaved(false), 2000);
    }
  };


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header Card */}
      <motion.div
        variants={itemVariants}
        className="bg-card border border-border rounded-card p-8 relative overflow-hidden"
      >
        {/* Background banner */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/20 via-accent/10 to-purple-500/10" />

        <div className="relative pt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white shadow-glow-sm">
                {profile.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <button className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              {editing ? (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="input-base text-sm"
                    placeholder="Full Name"
                  />
                  <input
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="input-base text-sm"
                    placeholder="Job Title"
                  />
                  <input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="input-base text-sm"
                    placeholder="Email"
                  />
                  <input
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="input-base text-sm"
                    placeholder="Location"
                  />
                </div>
              ) : (
                <>
                  <h1 className="font-heading text-2xl font-bold">{profile.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-secondary-text text-sm">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      {profile.role}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      {profile.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {saved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 text-success text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </motion.div>
              )}
              {editing ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary hover:bg-accent text-white font-semibold px-5 py-2.5 rounded-button transition-all text-sm hover:shadow-glow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 bg-card border border-border hover:border-primary/30 text-secondary-text hover:text-primary-text font-semibold px-5 py-2.5 rounded-button transition-all text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
              <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20 font-medium">
                {profile.plan} Plan
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid — Live Data */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Uploads", value: resumeStats?.total ?? "—", icon: FileText, color: "text-blue-400 bg-blue-500/10" },
          { label: "Best ATS Score", value: resumeStats?.bestAts ?? "—", icon: TrendingUp, color: "text-green-400 bg-green-500/10" },
          { label: "Latest ATS", value: resumeStats?.latestAts ?? "—", icon: Target, color: "text-purple-400 bg-purple-500/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-card p-5 text-center">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="font-heading font-bold text-2xl">{value}</p>
            <p className="text-secondary-text text-xs mt-1">{label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-card p-6">
          <h2 className="font-heading font-semibold mb-6 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {!resumeStats?.recentUploads?.length ? (
              <p className="text-sm text-muted">No recent activity.</p>
            ) : (
              resumeStats.recentUploads.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center flex-shrink-0">
                    {a.status === "completed" ? (
                      <BarChart2 className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-text">
                      {a.status === "completed" ? "Analyzed resume" : "Uploaded resume"}
                    </p>
                    <p className="text-xs text-muted">{a.file_name}</p>
                    <p className="text-xs text-muted mt-0.5">{formatRelativeTime(a.uploaded_at)}</p>
                  </div>
                  {a.ats_score != null && (
                    <span className={`text-xs font-bold flex-shrink-0 ${a.ats_score >= 80 ? 'text-green-600' : a.ats_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {a.ats_score}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-card p-6">
          <h2 className="font-heading font-semibold mb-6 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Achievements
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 1, name: "First Steps", description: "Uploaded your first resume", earned: (resumeStats?.total ?? 0) > 0 },
              { id: 2, name: "Optimizer", description: "Analyzed 5 or more resumes", earned: (resumeStats?.total ?? 0) >= 5 },
              { id: 3, name: "High Achiever", description: "Scored 80+ on ATS Match", earned: (resumeStats?.bestAts ?? 0) >= 80 },
              { id: 4, name: "Perfectionist", description: "Scored 90+ on ATS Match", earned: (resumeStats?.bestAts ?? 0) >= 90 },
            ].map((a) => (
              <div
                key={a.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  a.earned
                    ? "bg-primary/5 border-primary/20"
                    : "bg-surface border-border opacity-40"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  a.earned ? "bg-primary/20" : "bg-surface"
                }`}>
                  <Award className={`w-4 h-4 ${a.earned ? "text-primary" : "text-muted"}`} />
                </div>
                <p className="text-sm font-semibold text-primary-text">{a.name}</p>
                <p className="text-xs text-muted mt-1">{a.description}</p>
                {a.earned && (
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle className="w-3 h-3 text-success" />
                    <span className="text-[10px] text-success">Earned</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Score Progress Over Time */}
      <motion.div variants={itemVariants} className="bg-card border border-border rounded-card p-6">
        <h2 className="font-heading font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Score Progress
        </h2>
        {(!resumeStats?.recentUploads || resumeStats.recentUploads.filter(h => h.overall_score != null).length === 0) ? (
          <div className="flex items-center justify-center h-32 text-muted text-sm">
            Upload resumes to track your score progress
          </div>
        ) : (
          <div className="flex items-end gap-4 h-32">
            {resumeStats.recentUploads.filter(h => h.overall_score != null).slice().reverse().map((h) => {
              const height = h.overall_score;
              const color = h.overall_score >= 80 ? "#16A34A" : h.overall_score >= 60 ? "#D97706" : "#DC2626";
              return (
                <div key={h.id} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                  <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }}>
                    {h.overall_score}
                  </span>
                  <div className="w-full rounded-t-lg relative" style={{ height: `${height}%`, backgroundColor: color, opacity: 0.8 }}>
                    <div className="absolute inset-0 rounded-t-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                  </div>
                  <span className="text-[10px] text-muted truncate w-full text-center">
                    {formatRelativeTime(h.uploaded_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
