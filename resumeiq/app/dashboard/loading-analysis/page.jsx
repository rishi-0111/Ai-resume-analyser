"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { CheckCircle, Loader2 } from "lucide-react";

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
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId");
  const force = searchParams.get("force") === "true";
  
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
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

    if (!resumeId) {
      setTimeout(() => setError("No resume ID provided."), 0);
      return;
    }

    // Step by step visual progression (fake progress while API runs)
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length - 1) { // Leave the last step for when the API actually finishes
        stepIndex++;
        setCurrentStep(stepIndex);
        const pct = Math.round((stepIndex / steps.length) * 100);
        setProgress(pct);

        if (progressBarRef.current) {
          gsap.to(progressBarRef.current, {
            width: `${pct}%`,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      }
    }, STEP_DURATION);

    // Make the actual API call
    const runAnalysis = async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId, force }),
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to analyze resume.");
        }

        // Fast-forward progress to 100%
        clearInterval(interval);
        setCurrentStep(steps.length);
        setProgress(100);
        
        if (progressBarRef.current) {
          gsap.to(progressBarRef.current, { width: "100%", duration: 0.3 });
        }

        setTimeout(() => {
          router.push(`/dashboard/analysis/${resumeId}`);
        }, 600);
        
      } catch (err) {
        clearInterval(interval);
        setError(err.message || "An unexpected error occurred.");
      }
    };

    runAnalysis();

    return () => clearInterval(interval);
  }, [router, resumeId]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      {/* Background orbs */}
      <div className="orb orb-blue absolute w-[600px] h-[600px] top-0 left-0 opacity-20" />
      <div className="orb orb-purple absolute w-[400px] h-[400px] bottom-0 right-0 opacity-15" />

      <div className="relative z-10 max-w-lg w-full mx-auto px-6">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ResumeIQ Logo" className="w-10 h-10 object-contain rounded-xl shadow-sm" />
            <span className="font-heading font-bold text-2xl">
              Resume<span className="gradient-text">IQ</span>
            </span>
          </div>
        </div>

        {/* Animated headline */}
        <div ref={titleRef} className="text-center mb-10">
          <h1 className="font-heading text-3xl font-bold mb-3">
            {error ? "Analysis Failed" : "Analyzing your resume"}
          </h1>
          <p className="text-secondary-text">
            {error ? (
              <span className="text-red-500">{error}</span>
            ) : (
              "Our AI is working hard to give you the best insights"
            )}
          </p>
          {error && (
            <button 
              onClick={() => router.push("/dashboard")}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
            >
              Back to Dashboard
            </button>
          )}
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
