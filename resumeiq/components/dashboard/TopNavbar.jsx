"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  Plus,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
  CheckCheck
} from "lucide-react";
import Link from "next/link";
import { mockUser } from "@/lib/mock-data";
import { useUser } from "@/lib/context/UserContext";
import { supabase } from "@/lib/supabase/client";
import { useTheme } from "next-themes";

const initialNotifications = [
  { id: 1, text: "Your resume score improved by 14 points!", time: "2h ago", unread: true },
  { id: 2, text: "New job match found: Senior Engineer at Linear", time: "5h ago", unread: true },
  { id: 3, text: "Analysis complete for Vercel position", time: "1d ago", unread: false },
];

export default function TopNavbar({ onMenuClick }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const { user } = useUser();
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = user?.user_metadata?.full_name || mockUser.name;
  const userEmail = user?.email || mockUser.email;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 transition-colors duration-200">
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-muted hover:text-secondary-text hover:bg-card transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden sm:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            placeholder="Search analyses..."
            className="w-64 bg-card border border-border rounded-input pl-9 pr-4 py-2 text-sm text-primary-text placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-secondary-text hover:bg-card transition-all"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* New Analysis CTA */}
        <Link
          href="/dashboard/upload"
          className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-accent text-white text-sm font-semibold px-4 py-2 rounded-button transition-all duration-200 hover:shadow-glow-sm ml-2"
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setUserOpen(false);
            }}
            className="relative w-9 h-9 rounded-lg bg-card border border-border hover:border-primary/30 flex items-center justify-center text-muted hover:text-secondary-text transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-12 w-80 bg-card border border-border rounded-card shadow-premium z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
                <span className="font-semibold text-sm text-primary-text">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              
              <div className="divide-y divide-border max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted text-sm">
                    No new notifications! 🎉
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 hover:bg-surface transition-colors cursor-pointer ${
                        n.unread ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {n.unread && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                        <div className={n.unread ? "" : "ml-5"}>
                          <p className="text-sm text-primary-text leading-snug">
                            {n.text}
                          </p>
                          <p className="text-xs text-muted mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="flex items-center border-t border-border bg-surface">
                  <button 
                    onClick={markAllRead}
                    className="flex-1 px-4 py-3 text-xs text-primary hover:text-accent transition-colors flex items-center justify-center gap-1.5 border-r border-border"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                  <button 
                    onClick={clearNotifications}
                    className="flex-1 px-4 py-3 text-xs text-muted hover:text-danger transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setUserOpen(!userOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-card transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
              {userInitials}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${userOpen ? "rotate-180" : ""}`} />
          </button>

          {/* User Dropdown */}
          {userOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-12 w-56 bg-card border border-border rounded-card shadow-premium z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border bg-surface">
                <p className="font-semibold text-sm text-primary-text">{userName}</p>
                <p className="text-xs text-muted">{userEmail}</p>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                  {mockUser.plan} Plan
                </span>
              </div>
              <div className="p-2 space-y-0.5 bg-card">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setUserOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-secondary-text hover:text-primary-text hover:bg-surface transition-all"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setUserOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-secondary-text hover:text-primary-text hover:bg-surface transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
              <div className="p-2 border-t border-border bg-card">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Backdrop for dropdowns */}
      {(notifOpen || userOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setNotifOpen(false);
            setUserOpen(false);
          }}
        />
      )}
    </header>
  );
}
