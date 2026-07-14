"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Briefcase, Check } from "lucide-react";

const DEFAULT_ROLES = [
  "Java Developer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "AI Engineer",
  "Data Analyst",
  "Software Engineer",
  "DevOps Engineer",
  "Cloud Architect",
  "Machine Learning Engineer",
  "Mobile Developer",
  "QA Engineer",
  "Product Manager",
  "UI/UX Designer",
];

/**
 * RoleSelector — searchable dropdown for selecting or entering a custom job role.
 * Reusable across HR, Technical, and MCQ interviews.
 *
 * @param {Object} props
 * @param {string} props.value - Current role value.
 * @param {Function} props.onChange - Callback when role changes.
 * @param {Function} props.onSubmit - Callback when user confirms the role.
 */
export default function RoleSelector({ value, onChange, onSubmit }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const filtered = DEFAULT_ROLES.filter((r) =>
    r.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectRole = (role) => {
    setSearch(role);
    onChange(role);
    setOpen(false);
  };

  const handleSubmit = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    onChange(trimmed);
    onSubmit(trimmed);
  };

  return (
    <div className="space-y-5">
      {/* Search input */}
      <div ref={dropdownRef} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder="Search or type a custom role..."
            className="input-base w-full pl-11 pr-11"
          />
          <button
            onClick={() => setOpen(!open)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-secondary-text transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{ transformOrigin: "top" }}
              className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-premium overflow-hidden max-h-64 overflow-y-auto"
            >
              {filtered.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted">
                    No matches. Press <strong>Enter</strong> to use &quot;{search}&quot;
                  </p>
                </div>
              ) : (
                filtered.map((role) => (
                  <button
                    key={role}
                    onClick={() => selectRole(role)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                      search === role
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-primary-text hover:bg-surface"
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-muted flex-shrink-0" />
                    <span className="flex-1">{role}</span>
                    {search === role && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Start button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!search.trim()}
        whileHover={{ scale: search.trim() ? 1.02 : 1 }}
        whileTap={{ scale: search.trim() ? 0.98 : 1 }}
        className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-accent text-white font-bold py-4 px-8 rounded-button transition-all duration-200 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        <Briefcase className="w-5 h-5" />
        Start Interview
      </motion.button>
    </div>
  );
}
