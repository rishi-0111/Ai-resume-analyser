"use client";

import { motion } from "framer-motion";
import { Upload, Brain, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Upload Your Resume",
    description:
      "Drag and drop your resume in PDF or DOCX format. Optionally paste a job description for targeted analysis.",
    icon: Upload,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    connector: "from-blue-500/40 to-indigo-500/40",
  },
  {
    step: "02",
    title: "AI Analyzes Everything",
    description:
      "Our AI engine reads your resume, checks ATS compatibility, extracts skills, and matches against job requirements in seconds.",
    icon: Brain,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    connector: "from-indigo-500/40 to-green-500/40",
  },
  {
    step: "03",
    title: "Get Actionable Insights",
    description:
      "Receive a detailed report with scores, suggestions, missing skills, and interview prep — ready to act on immediately.",
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    connector: null,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-secondary-text">
              Simple 3-step process
            </span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            From upload to insights{" "}
            <span className="gradient-text">in seconds</span>
          </h2>
          <p className="text-secondary-text text-lg max-w-2xl mx-auto">
            No complex setup. No learning curve. Just upload and get results.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-1/6 right-1/6 h-px bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-green-500/20" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="relative text-center lg:text-left"
                >
                  {/* Step number + icon */}
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-6">
                    <div className="relative">
                      <div
                        className={`w-14 h-14 rounded-2xl border ${step.bg} flex items-center justify-center`}
                      >
                        <Icon className={`w-6 h-6 ${step.color}`} />
                      </div>
                      {/* Step badge */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                        {i + 1}
                      </div>
                    </div>

                    {/* Arrow connector between steps (desktop) */}
                    {i < steps.length - 1 && (
                      <div className="hidden lg:flex items-center absolute -right-4 top-4 z-10">
                        <ArrowRight className="w-5 h-5 text-muted" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 justify-center lg:justify-start">
                      <span className="text-xs font-bold text-muted tracking-widest uppercase">
                        Step {step.step}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-xl text-primary-text">
                      {step.title}
                    </h3>
                    <p className="text-secondary-text leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <a
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 bg-primary hover:bg-accent text-white font-semibold px-8 py-4 rounded-button transition-all duration-200 hover:shadow-glow group"
          >
            Try It Now — It&apos;s Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
