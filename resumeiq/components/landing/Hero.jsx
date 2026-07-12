"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
  ArrowRight,
  Play,
  Upload,
  Target,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Star,
} from "lucide-react";

const floatingCards = [
  {
    icon: <Target className="w-4 h-4 text-blue-400" />,
    label: "ATS Score",
    value: "94/100",
    color: "border-blue-500/30 bg-blue-500/10",
    position: "top-16 -left-8 md:top-24 md:-left-16",
  },
  {
    icon: <TrendingUp className="w-4 h-4 text-green-400" />,
    label: "Job Match",
    value: "88%",
    color: "border-green-500/30 bg-green-500/10",
    position: "top-4 -right-4 md:top-8 md:-right-20",
  },
  {
    icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    label: "AI Suggestions",
    value: "12 found",
    color: "border-purple-500/30 bg-purple-500/10",
    position: "bottom-16 -left-4 md:bottom-24 md:-left-12",
  },
  {
    icon: <CheckCircle className="w-4 h-4 text-amber-400" />,
    label: "Skills Gap",
    value: "3 missing",
    color: "border-amber-500/30 bg-amber-500/10",
    position: "bottom-4 -right-2 md:bottom-8 md:-right-16",
  },
];

export default function Hero() {
  const heroRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const headlineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Orb animations
      gsap.to(orb1Ref.current, {
        x: 30,
        y: -20,
        duration: 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(orb2Ref.current, {
        x: -25,
        y: 30,
        duration: 8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1,
      });
      gsap.to(orb3Ref.current, {
        x: 20,
        y: 25,
        duration: 7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2,
      });

      // Headline stagger animation
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll(".word");
        gsap.fromTo(
          words,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            delay: 0.3,
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
    >
      {/* Background Orbs */}
      <div
        ref={orb1Ref}
        className="orb orb-blue absolute w-[500px] h-[500px] top-10 left-[10%] opacity-40"
      />
      <div
        ref={orb2Ref}
        className="orb orb-purple absolute w-[400px] h-[400px] top-40 right-[5%] opacity-30"
      />
      <div
        ref={orb3Ref}
        className="orb orb-cyan absolute w-[300px] h-[300px] bottom-20 left-[30%] opacity-20"
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(37,99,235,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border border-primary/20">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-secondary-text">
                  Trusted by 250,000+ professionals
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={itemVariants}>
              <h1
                ref={headlineRef}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
              >
                <span className="overflow-hidden block">
                  {["Land", "More", "Interviews", "With"].map((word, i) => (
                    <span key={i} className="word inline-block mr-3">
                      {word}
                    </span>
                  ))}
                </span>
                <span className="overflow-hidden block mt-1">
                  {["AI-Powered"].map((word, i) => (
                    <span key={i} className="word inline-block mr-3 gradient-text">
                      {word}
                    </span>
                  ))}
                  {["Resume", "Analysis"].map((word, i) => (
                    <span key={i} className="word inline-block mr-3">
                      {word}
                    </span>
                  ))}
                </span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg text-secondary-text leading-relaxed max-w-lg"
            >
              Upload your resume, paste a job description, and get instant ATS
              scores, skill gap analysis, AI suggestions, and interview prep —
              all in seconds.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/dashboard/upload"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-accent text-white font-semibold px-8 py-4 rounded-button transition-all duration-200 hover:shadow-glow group"
              >
                <Upload className="w-4 h-4" />
                Analyze My Resume Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center justify-center gap-2 glass border border-border hover:border-primary/40 text-secondary-text hover:text-primary-text font-semibold px-8 py-4 rounded-button transition-all duration-200">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Play className="w-3 h-3 text-primary ml-0.5" />
                </div>
                Watch Demo
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-6 pt-2"
            >
              <div className="flex -space-x-2">
                {["SC", "MW", "PP", "JR", "ET"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm font-semibold ml-1">4.9/5</span>
                </div>
                <p className="text-xs text-muted">
                  from 12,000+ reviews
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative hidden lg:block"
          >
            {/* Main Card */}
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="glass border border-border/50 rounded-card p-6 shadow-premium"
              >
                {/* Mock Dashboard Preview */}
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted mb-1">Analysis Report</div>
                      <div className="font-heading font-bold text-lg">Alex_Resume_v3.pdf</div>
                    </div>
                    <div className="w-12 h-12 rounded-card bg-primary/20 flex items-center justify-center border border-primary/30">
                      <span className="font-heading font-bold text-primary text-lg">82</span>
                    </div>
                  </div>

                  {/* Score bars */}
                  <div className="space-y-3">
                    {[
                      { label: "ATS Score", value: 74, color: "bg-blue-500" },
                      { label: "Job Match", value: 88, color: "bg-green-500" },
                      { label: "Keywords", value: 65, color: "bg-amber-500" },
                      { label: "Clarity", value: 90, color: "bg-purple-500" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-secondary-text">{item.label}</span>
                          <span className="text-primary-text font-medium">{item.value}%</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            className={`progress-fill ${item.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom chips */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["TypeScript", "GraphQL", "Docker", "AWS"].map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-3 py-1 rounded-full bg-danger/10 text-danger border border-danger/20"
                      >
                        Missing: {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Cards */}
              {floatingCards.map((card, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, i % 2 === 0 ? -8 : 8, 0] }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                  className={`absolute ${card.position} glass border ${card.color} rounded-xl px-3 py-2 shadow-card`}
                >
                  <div className="flex items-center gap-2">
                    {card.icon}
                    <div>
                      <div className="text-[10px] text-muted">{card.label}</div>
                      <div className="text-sm font-semibold text-primary-text">{card.value}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
