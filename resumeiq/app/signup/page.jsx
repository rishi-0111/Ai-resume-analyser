"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Zap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Globe2,
  Check,
} from "lucide-react";

const passwordChecks = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains number", test: (p) => /[0-9]/.test(p) },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  };

  const allChecks = passwordChecks.every((c) => c.test(form.password));
  const passwordsMatch =
    form.confirm.length === 0 || form.password === form.confirm;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-glow-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl">
              Resume<span className="gradient-text">IQ</span>
            </span>
          </Link>

          {/* Card */}
          <div className="bg-card border border-border rounded-card p-8 shadow-premium">
            <div className="mb-8 text-center">
              <h1 className="font-heading text-2xl font-bold mb-2">
                Create your account
              </h1>
              <p className="text-secondary-text text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-accent transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Google SSO */}
            <button className="w-full flex items-center justify-center gap-3 bg-surface border border-border hover:border-primary/40 text-primary-text font-semibold py-3.5 px-6 rounded-button transition-all duration-200 mb-6 group">
              <Globe2 className="w-5 h-5 text-secondary-text group-hover:text-primary-text" />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted text-xs">or create with email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-secondary-text"
                >
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Alex Johnson"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-base w-full pl-11"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-email"
                  className="text-sm font-medium text-secondary-text"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="input-base w-full pl-11"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-password"
                  className="text-sm font-medium text-secondary-text"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="input-base w-full pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-secondary-text"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password strength */}
                {form.password.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {passwordChecks.map((check, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                          check.test(form.password)
                            ? "bg-success"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {form.password.length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {passwordChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Check
                          className={`w-3 h-3 ${
                            check.test(form.password)
                              ? "text-success"
                              : "text-muted"
                          }`}
                        />
                        <span
                          className={`text-[11px] ${
                            check.test(form.password)
                              ? "text-success"
                              : "text-muted"
                          }`}
                        >
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm"
                  className="text-sm font-medium text-secondary-text"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    required
                    placeholder="Confirm your password"
                    value={form.confirm}
                    onChange={(e) =>
                      setForm({ ...form, confirm: e.target.value })
                    }
                    className={`input-base w-full pl-11 pr-11 ${
                      !passwordsMatch && form.confirm.length > 0
                        ? "border-danger focus:border-danger"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-secondary-text"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {!passwordsMatch && form.confirm.length > 0 && (
                  <p className="text-danger text-xs mt-1">
                    Passwords don&apos;t match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !allChecks || !passwordsMatch}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-accent text-white font-semibold py-3.5 px-6 rounded-button transition-all duration-200 hover:shadow-glow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-muted mt-4">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-secondary-text hover:text-primary-text">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-secondary-text hover:text-primary-text">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
