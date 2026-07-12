"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { CheckCircle, Loader2, Zap } from "lucide-react";

const steps = [
  { id: 1, label: "Reading Resume", detail: "Parsing document structure and content" },
  { id: 2, label: "Extracting Skills", detail: "Identifying technical and soft skills" },
  { id: 3, label: "Finding Keywords", detail: "Matching against ATS keyword database" },
  { id: 4, label: "Calculating ATS Score", detail: "Running compatibility checks" },
  { id: 5, label: "Generating Suggestions", detail: "Creating AI-powered improvements" },
  { id: 6, label: "Preparing Dashboard", detail: "Finalizing your personalized report" },
];

const STEP_DURATION = 900; // ms per step

export default function LoadingAnalysisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressBarRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    // Animate title with GSAP
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }

    // Step by step progression
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      setCurrentStep(stepIndex);
      const pct = Math.round((stepIndex / steps.length) * 100);
      setProgress(pct);

      // GSAP progress bar
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          width: `${pct}%`,
          duration: 0.5,
          ease: "power2.out",
        });
      }

      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          router.push("/dashboard/analysis/analysis-001");
        }, 800);
      }
    }, STEP_DURATION);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      {/* Background orbs */}
      <div className="orb orb-blue absolute w-[600px] h-[600px] top-0 left-0 opacity-20" />
      <div className="orb orb-purple absolute w-[400px] h-[400px] bottom-0 right-0 opacity-15" />

      <div className="relative z-10 max-w-lg w-full mx-auto px-6">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl">
              Resume<span className="gradient-text">IQ</span>
            </span>
          </div>
        </div>

        {/* Animated headline */}
        <div ref={titleRef} className="text-center mb-10">
          <h1 className="font-heading text-3xl font-bold mb-3">
            Analyzing your resume
          </h1>
          <p className="text-secondary-text">
            Our AI is working hard to give you the best insights
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-secondary-text">Progress</span>
            <span className="font-semibold text-primary">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              ref={progressBarRef}
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              style={{ width: "0%" }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isDone || isActive ? 1 : 0.3,
                  x: 0,
                }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  isActive ? "bg-primary/10 border border-primary/20" : "bg-transparent"
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <AnimatePresence mode="wait">
                    {isDone ? (
                      <motion.div
                        key="done"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                      >
                        <CheckCircle className="w-6 h-6 text-success" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        key="active"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-6 h-6 text-primary" />
                      </motion.div>
                    ) : (
                      <div
                        key="pending"
                        className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center text-xs font-bold text-muted"
                      >
                        {i + 1}
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm transition-colors duration-300 ${
                      isDone
                        ? "text-success"
                        : isActive
                        ? "text-primary-text"
                        : "text-muted"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-secondary-text mt-0.5"
                    >
                      {step.detail}
                    </motion.p>
                  )}
                </div>

                {/* Shimmer on active */}
                {isActive && (
                  <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      className="h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent"
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-muted mt-8">
          Estimated time: 5–10 seconds · Your data is encrypted and private
        </p>
      </div>
    </div>
  );
}
