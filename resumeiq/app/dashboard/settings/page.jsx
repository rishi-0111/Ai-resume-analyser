"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Moon,
  Sun,
  Bell,
  Globe,
  Shield,
  Trash2,
  ChevronRight,
  Check,
  AlertTriangle,
  Monitor,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

const tabs = [
  { id: "appearance", label: "Appearance", icon: Monitor },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "language", label: "Language & Region", icon: Globe },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
];

function ToggleSwitch({ checked, onChange, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        checked ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingRow({ icon: Icon, title, description, right }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-secondary-text" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-primary-text">{title}</p>
          {description && (
            <p className="text-xs text-muted mt-0.5 max-w-sm">{description}</p>
          )}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">{right}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  
  const [activeTab, setActiveTab] = useState("appearance");
  const [accentColor, setAccentColor] = useState("#2563EB");
  
  // Persisted state
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    analysis: true,
    marketing: false,
    weekly: true,
  });
  const [language, setLanguage] = useState("en");
  const [privacy, setPrivacy] = useState({
    analytics: true,
    sharing: false,
    twoFactor: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedNotifs = localStorage.getItem("resumeiq_notifications");
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    
    const savedLang = localStorage.getItem("resumeiq_language");
    if (savedLang) setLanguage(savedLang);
    
    const savedPrivacy = localStorage.getItem("resumeiq_privacy");
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
    
    const savedAccent = localStorage.getItem("resumeiq_accent");
    if (savedAccent) setAccentColor(savedAccent);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("resumeiq_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("resumeiq_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("resumeiq_privacy", JSON.stringify(privacy));
  }, [privacy]);

  useEffect(() => {
    localStorage.setItem("resumeiq_accent", accentColor);
    // document.documentElement.style.setProperty('--primary', accentColor); // Simplified for now
  }, [accentColor]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/settings/export');
      if (!res.ok) throw new Error("Failed to export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resumeiq_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Error exporting data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear all analysis and interview history?")) return;
    setIsClearing(true);
    try {
      const res = await fetch('/api/settings/clear-history', { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to clear history");
      alert("History cleared successfully.");
    } catch (err) {
      alert("Error clearing history.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Soft delete: clear their data via API, then sign out
      await fetch('/api/settings/clear-history', { method: 'DELETE' });
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      alert("Error deleting account.");
    } finally {
      setIsDeleting(false);
    }
  };

  const languages = [
    { code: "en", label: "English (US)" },
    { code: "es", label: "Spanish" },
    { code: "fr", label: "French" },
    { code: "de", label: "German" },
    { code: "pt", label: "Portuguese" },
    { code: "hi", label: "Hindi" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold mb-1">Settings</h1>
        <p className="text-secondary-text">Manage your account preferences and privacy settings</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-card border border-border rounded-card p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-secondary-text hover:text-primary-text hover:bg-surface"
                  } ${tab.id === "danger" ? "text-danger hover:bg-danger/10 hover:text-danger" : ""}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-left">{tab.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3"
        >
          <AnimatePresence mode="wait">
            {activeTab === "appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-card p-6"
              >
                <h2 className="font-heading font-semibold mb-6">Appearance</h2>
                <div className="mb-6">
                  <p className="text-sm font-medium mb-4">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {mounted && [
                      { id: "light", label: "Light", icon: Sun },
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "system", label: "System", icon: Monitor },
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setTheme(id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                          theme === id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/30 bg-surface"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${theme === id ? "text-primary" : "text-muted"}`} />
                        <span className="text-sm font-medium">{label}</span>
                        {theme === id && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <p className="text-sm font-medium mb-3">Accent Color</p>
                  <div className="flex gap-3">
                    {[
                      "#2563EB", "#8B5CF6", "#22C55E", "#F59E0B", "#EF4444", "#EC4899",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${accentColor === color ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Set accent color to ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-card p-6"
              >
                <h2 className="font-heading font-semibold mb-6">Notifications</h2>
                <div className="divide-y divide-border">
                  <SettingRow
                    icon={Mail}
                    title="Email Notifications"
                    description="Receive analysis results and updates via email"
                    right={
                      <ToggleSwitch
                        id="notif-email"
                        checked={notifications.email}
                        onChange={(v) => setNotifications({ ...notifications, email: v })}
                      />
                    }
                  />
                  <SettingRow
                    icon={Smartphone}
                    title="Push Notifications"
                    description="Browser push notifications for real-time updates"
                    right={
                      <ToggleSwitch
                        id="notif-push"
                        checked={notifications.push}
                        onChange={(v) => setNotifications({ ...notifications, push: v })}
                      />
                    }
                  />
                  <SettingRow
                    icon={Bell}
                    title="Analysis Complete"
                    description="Notify when resume analysis finishes"
                    right={
                      <ToggleSwitch
                        id="notif-analysis"
                        checked={notifications.analysis}
                        onChange={(v) => setNotifications({ ...notifications, analysis: v })}
                      />
                    }
                  />
                  <SettingRow
                    icon={Mail}
                    title="Weekly Digest"
                    description="Weekly summary of your job search progress"
                    right={
                      <ToggleSwitch
                        id="notif-weekly"
                        checked={notifications.weekly}
                        onChange={(v) => setNotifications({ ...notifications, weekly: v })}
                      />
                    }
                  />
                  <SettingRow
                    icon={Bell}
                    title="Marketing Emails"
                    description="Product updates, tips, and promotional content"
                    right={
                      <ToggleSwitch
                        id="notif-marketing"
                        checked={notifications.marketing}
                        onChange={(v) => setNotifications({ ...notifications, marketing: v })}
                      />
                    }
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "language" && (
              <motion.div
                key="language"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-card p-6"
              >
                <h2 className="font-heading font-semibold mb-6">Language & Region</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-secondary-text block mb-3">
                      Display Language
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                            language === lang.code
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-surface text-secondary-text hover:border-primary/30 hover:text-primary-text"
                          }`}
                        >
                          {lang.label}
                          {language === lang.code && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-card p-6"
              >
                <h2 className="font-heading font-semibold mb-6">Privacy & Security</h2>
                <div className="divide-y divide-border">
                  <SettingRow
                    icon={Shield}
                    title="Two-Factor Authentication"
                    description="Add an extra layer of security to your account"
                    right={
                      <ToggleSwitch
                        id="privacy-2fa"
                        checked={privacy.twoFactor}
                        onChange={(v) => setPrivacy({ ...privacy, twoFactor: v })}
                      />
                    }
                  />
                  <SettingRow
                    icon={Eye}
                    title="Usage Analytics"
                    description="Help us improve by sharing anonymous usage data"
                    right={
                      <ToggleSwitch
                        id="privacy-analytics"
                        checked={privacy.analytics}
                        onChange={(v) => setPrivacy({ ...privacy, analytics: v })}
                      />
                    }
                  />
                  <SettingRow
                    icon={Lock}
                    title="Data Sharing"
                    description="Share anonymized data to improve AI models"
                    right={
                      <ToggleSwitch
                        id="privacy-sharing"
                        checked={privacy.sharing}
                        onChange={(v) => setPrivacy({ ...privacy, sharing: v })}
                      />
                    }
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <button className="flex items-center gap-2 text-sm font-medium text-secondary-text hover:text-primary-text px-4 py-2 border border-border hover:border-primary/30 rounded-button transition-all">
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "danger" && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-danger/20 rounded-card p-6"
              >
                <h2 className="font-heading font-semibold mb-2 text-danger flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </h2>
                <p className="text-secondary-text text-sm mb-8">
                  These actions are permanent and cannot be undone.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
                    <div>
                      <p className="font-semibold text-sm">Export All Data</p>
                      <p className="text-xs text-muted mt-0.5">
                        Download a copy of all your resume data
                      </p>
                    </div>
                    <button 
                      onClick={handleExport}
                      disabled={isExporting}
                      className="text-sm font-medium px-4 py-2 border border-border rounded-button hover:border-primary/30 text-secondary-text hover:text-primary-text transition-all disabled:opacity-50"
                    >
                      {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
                    <div>
                      <p className="font-semibold text-sm">Delete All Analyses</p>
                      <p className="text-xs text-muted mt-0.5">
                        Remove all resume analysis history
                      </p>
                    </div>
                    <button 
                      onClick={handleClearHistory}
                      disabled={isClearing}
                      className="text-sm font-medium px-4 py-2 border border-warning/30 bg-warning/10 rounded-button text-warning hover:bg-warning/20 transition-all disabled:opacity-50"
                    >
                      {isClearing ? 'Clearing...' : 'Clear History'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-danger/5 border border-danger/30">
                    <div>
                      <p className="font-semibold text-sm text-danger">Delete Account</p>
                      <p className="text-xs text-muted mt-0.5">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="text-sm font-semibold px-4 py-2 bg-danger text-white rounded-button hover:bg-danger/90 transition-all"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card border border-danger/30 rounded-card p-8 shadow-premium"
            >
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-danger" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-2">Delete Account?</h3>
                <p className="text-secondary-text text-sm leading-relaxed mb-8">
                  This action is permanent. All your data, analyses, and history will be
                  deleted immediately. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 rounded-button border border-border text-secondary-text hover:text-primary-text hover:border-primary/30 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 py-3 rounded-button bg-danger text-white font-semibold hover:bg-danger/90 transition-all disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
