"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Globe2, X } from "lucide-react";
import { signIn, signInWithGoogle, sendPasswordReset } from "@/lib/services/authService";
import { useToast } from "@/lib/context/ToastContext";

export default function LoginPage() {
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await signIn(form.email, form.password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    showToast("Welcome back!", "success");
    window.location.href = "/dashboard";
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      showToast(error.message, "error");
      setGoogleLoading(false);
    }
    // On success, Supabase redirects automatically
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    const { error } = await sendPasswordReset(forgotEmail);
    setForgotLoading(false);
    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Password reset email sent! Check your inbox.", "success");
      setShowForgot(false);
      setForgotEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background orbs */}
        <div className="orb orb-blue absolute w-[400px] h-[400px] top-20 left-20 opacity-40" />
        <div className="orb orb-purple absolute w-[300px] h-[300px] bottom-20 right-10 opacity-30" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(37,99,235,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-center p-16 space-y-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ResumeIQ Logo" className="w-9 h-9 object-contain rounded-xl shadow-sm" />
            <span className="font-heading font-bold text-2xl">
              Resume<span className="gradient-text">IQ</span>
            </span>
          </Link>

          <div className="space-y-6">
            <h1 className="font-heading text-4xl font-bold leading-tight">
              Welcome back to your
              <br />
              <span className="gradient-text">career journey</span>
            </h1>
            <p className="text-secondary-text text-lg leading-relaxed max-w-md">
              Sign in to access your resume analyses, track your improvement
              journey, and land your dream job faster.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { value: "94%", label: "Interview Rate" },
              { value: "82", label: "Avg. Score" },
              { value: "250K+", label: "Users" },
            ].map((s) => (
              <div key={s.label} className="glass border border-border/50 rounded-xl p-4 text-center">
                <div className="font-heading font-bold text-xl gradient-text">{s.value}</div>
                <div className="text-xs text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <img src="/logo.png" alt="ResumeIQ Logo" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
            <span className="font-heading font-bold text-xl">
              Resume<span className="gradient-text">IQ</span>
            </span>
          </Link>

          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold mb-2">Sign in</h2>
            <p className="text-secondary-text">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary hover:text-accent transition-colors font-medium"
              >
                Create one free
              </Link>
            </p>
          </div>

          {/* Google SSO */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-surface border border-border hover:border-primary/40 text-primary-text font-semibold py-3.5 px-6 rounded-button transition-all duration-200 mb-6 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Globe2 className="w-5 h-5 text-secondary-text group-hover:text-primary-text" />
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted text-xs">or sign in with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-button text-center">
                {error}
              </div>
            )}
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-secondary-text block">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-base w-full pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium text-secondary-text block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-primary hover:text-accent transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-base w-full pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-secondary-text transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="w-4 h-4 rounded border-border bg-surface accent-primary cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-secondary-text cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-accent text-white font-semibold py-3.5 px-6 rounded-button transition-all duration-200 hover:shadow-glow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-6">
            By signing in, you agree to our{" "}
            <a href="#" className="text-secondary-text hover:text-primary-text">Terms</a>{" "}
            and{" "}
            <a href="#" className="text-secondary-text hover:text-primary-text">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-card p-8 max-w-sm w-full mx-4 shadow-premium"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold text-lg">Reset Password</h3>
              <button onClick={() => setShowForgot(false)} className="text-muted hover:text-primary-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-secondary-text text-sm mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="input-base w-full pl-11"
                />
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-accent text-white font-semibold py-3 px-6 rounded-button transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {forgotLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Send Reset Link"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
