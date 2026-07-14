"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  History,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  LogOut,
  X,
  Bell,
  Briefcase,
} from "lucide-react";
import { mockUser } from "@/lib/mock-data";
import { useUser } from "@/lib/context/UserContext";
import { supabase } from "@/lib/supabase/client";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Upload, label: "Upload & Analyze", href: "/dashboard/upload" },
  { icon: History, label: "History", href: "/dashboard/history" },
  { icon: Briefcase, label: "Market Intelligence", href: "/dashboard/market" },
  { icon: TrendingUp, label: "Interview Prep", href: "/dashboard/interview" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

function NavItem({ item, collapsed, active, onClick }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
        active
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-secondary-text hover:text-primary-text hover:bg-surface"
      }`}
      title={collapsed ? item.label : undefined}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 transition-colors ${
          active ? "text-primary" : "text-muted group-hover:text-secondary-text"
        }`}
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary"
        />
      )}
    </Link>
  );
}

// Desktop Sidebar
export function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  const userName = user?.user_metadata?.full_name || mockUser.name;
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

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hidden lg:flex flex-col h-screen sticky top-0 bg-surface border-r border-border flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 h-16 border-b border-border flex-shrink-0">
        <img src="/logo.png" alt="ResumeIQ Logo" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="font-heading font-bold text-lg overflow-hidden whitespace-nowrap"
            >
              Resume<span className="gradient-text">IQ</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </nav>

      {/* User + Collapse */}
      <div className="p-3 border-t border-border space-y-2">
        {/* User */}
        <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {userInitials}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-primary-text whitespace-nowrap">
                  {userName}
                </p>
                <p className="text-xs text-muted whitespace-nowrap">{mockUser.plan} Plan</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-muted hover:text-secondary-text hover:bg-card transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

// Mobile Drawer
export function MobileDrawer({ open, onClose }) {
  const pathname = usePathname();
  const { user } = useUser();

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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-surface border-r border-border lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 h-16 border-b border-border">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="ResumeIQ Logo" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
                <span className="font-heading font-bold text-lg">
                  Resume<span className="gradient-text">IQ</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-card text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  collapsed={false}
                  active={
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href)
                  }
                  onClick={onClose}
                />
              ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                  {userInitials}
                </div>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted">{userEmail}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
