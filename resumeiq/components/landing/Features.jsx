"use client";

import { motion } from "framer-motion";
import {
  Target,
  Sparkles,
  GitCompare,
  Briefcase,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

const iconMap = {
  Target,
  Sparkles,
  GitCompare,
  Briefcase,
  MessageSquare,
  RefreshCw,
};

const features = [
  {
    id: 1,
    icon: "Target",
    title: "ATS Score Analysis",
    description:
      "Get a precise ATS compatibility score with detailed breakdown of how applicant tracking systems read your resume.",
    color: "text-blue-400",
    border: "border-blue-500/20 hover:border-blue-500/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    bg: "bg-blue-500/10",
    gradient: "from-blue-500/5 to-transparent",
  },
  {
    id: 2,
    icon: "Sparkles",
    title: "AI-Powered Suggestions",
    description:
      "Receive intelligent, context-aware suggestions that transform weak bullet points into compelling achievements.",
    color: "text-indigo-400",
    border: "border-indigo-500/20 hover:border-indigo-500/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]",
    bg: "bg-indigo-500/10",
    gradient: "from-indigo-500/5 to-transparent",
  },
  {
    id: 3,
    icon: "GitCompare",
    title: "Skill Gap Analysis",
    description:
      "Identify exactly which skills you're missing for your target role and get a personalized learning roadmap.",
    color: "text-green-400",
    border: "border-green-500/20 hover:border-green-500/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]",
    bg: "bg-green-500/10",
    gradient: "from-green-500/5 to-transparent",
  },
  {
    id: 4,
    icon: "Briefcase",
    title: "Job Description Match",
    description:
      "Upload any job posting and instantly see how well your resume matches — keyword by keyword.",
    color: "text-amber-400",
    border: "border-amber-500/20 hover:border-amber-500/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    bg: "bg-amber-500/10",
    gradient: "from-amber-500/5 to-transparent",
  },
  {
    id: 5,
    icon: "MessageSquare",
    title: "Interview Questions",
    description:
      "Get personalized interview questions based on your resume and target role. Practice before the real thing.",
    color: "text-purple-400",
    border: "border-purple-500/20 hover:border-purple-500/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    bg: "bg-purple-500/10",
    gradient: "from-purple-500/5 to-transparent",
  },
  {
    id: 6,
    icon: "RefreshCw",
    title: "AI Resume Rewrite",
    description:
      "Let our AI rewrite your entire resume optimized for your target role, ATS systems, and human readers.",
    color: "text-cyan-400",
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
    bg: "bg-cyan-500/10",
    gradient: "from-cyan-500/5 to-transparent",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-secondary-text">
              Everything you need
            </span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            Powerful features to{" "}
            <span className="gradient-text">supercharge</span>
            <br />
            your job search
          </h2>
          <p className="text-secondary-text text-lg max-w-2xl mx-auto">
            From ATS optimization to AI-generated interview prep — ResumeIQ
            gives you every advantage in your job search.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <motion.div
                key={feature.id}
                variants={cardVariants}
                className={`group relative bg-card border ${feature.border} rounded-card p-6 transition-all duration-300 ${feature.glow} cursor-default overflow-hidden`}
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-card`}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>

                  {/* Content */}
                  <h3 className="font-heading font-semibold text-lg text-primary-text mb-3 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-text text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div
                    className={`absolute top-0 right-0 w-full h-full ${feature.bg} rounded-bl-full`}
                    style={{ opacity: 0.3 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
