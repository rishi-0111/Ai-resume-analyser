"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronRight, ArrowLeft, AlertCircle } from "lucide-react";
import { useInterview, STEPS } from "@/lib/hooks/useInterview";

// UI Components
import ResumeSelector from "@/components/interview/ResumeSelector";
import InterviewSetup from "@/components/interview/InterviewSetup";
import ChatRoom from "@/components/interview/ChatRoom";
import ScoreCard from "@/components/interview/ScoreCard";
import FeedbackCard from "@/components/interview/FeedbackCard";

// Dynamic import for confetti to avoid SSR issues
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function TechnicalInterviewPage() {
  const {
    step,
    selectedResume,
    setupData,
    setSetupData,
    messages,
    results,
    error,
    loading,
    isGenerating,
    confirmResume,
    generateInterview,
    sendMessage,
    submitInterview,
    retry,
    reset,
  } = useInterview({ type: "technical" });

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    if (step === STEPS.RESULTS && results?.scores?.overall >= 90) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
    }
  }, [step, results]);

  const renderHeader = () => {
    if (step === STEPS.RESULTS) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-muted mb-8">
        <Link href="/dashboard/interview" className="hover:text-primary transition-colors">
          Interviews
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-primary-text font-medium">Technical Interview</span>
        {setupData.role && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary-text">{setupData.role}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 relative min-h-[80vh]">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti width={windowSize.width} height={windowSize.height} />
        </div>
      )}

      {renderHeader()}

      <AnimatePresence mode="wait">
        {/* Error State */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-danger/10 border border-danger/30 rounded-card p-6 flex flex-col items-center text-center shadow-sm"
          >
            <AlertCircle className="w-10 h-10 text-danger mb-3" />
            <h3 className="font-heading font-semibold text-lg text-primary-text mb-1">
              Something went wrong
            </h3>
            <p className="text-secondary-text text-sm mb-6 max-w-md">
              {error}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={reset}
                className="px-6 py-2 rounded-button font-medium text-sm border border-border hover:bg-surface transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={retry}
                className="px-6 py-2 rounded-button font-medium text-sm bg-primary text-white hover:bg-accent transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-border rounded-full" />
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="font-heading font-semibold text-xl text-primary-text mb-2">
              {step === STEPS.GENERATING
                ? "Connecting you to your AI Senior Engineer..."
                : "Evaluating your technical architecture and answers..."}
            </h3>
            <p className="text-secondary-text text-sm max-w-sm text-center">
              {step === STEPS.GENERATING
                ? "The AI is reviewing your tech stack and preparing to drill into your experience."
                : "Our AI is analyzing the entire conversation to build your feedback report."}
            </p>
          </motion.div>
        )}

        {/* Step 1: Select Resume */}
        {!loading && !error && step === STEPS.SELECT_RESUME && (
          <motion.div
            key="select_resume"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-heading text-2xl font-bold mb-1">Choose a Resume</h1>
              <p className="text-secondary-text">
                Select the resume you want to use for this Technical interview.
              </p>
            </div>
            <ResumeSelector
              selected={selectedResume}
              onSelect={confirmResume}
            />
          </motion.div>
        )}

        {/* Step 2: Setup Interview */}
        {!loading && !error && step === STEPS.SETUP && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 mt-12"
          >
            <button
              onClick={reset}
              className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to resumes
            </button>
            <div className="text-center mb-8">
              <h1 className="font-heading text-2xl font-bold mb-2">Technical Deep Dive</h1>
              <p className="text-secondary-text text-sm">
                Select your domain and experience level to calibrate the technical difficulty.
              </p>
            </div>
            <InterviewSetup
              value={setupData}
              onChange={setSetupData}
              onSubmit={generateInterview}
              isTechnical={true}
            />
          </motion.div>
        )}

        {/* Step 3: Chat Room */}
        {!loading && !error && step === STEPS.INTERVIEW && (
          <motion.div
            key="interview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ChatRoom
              messages={messages}
              onSendMessage={sendMessage}
              onEndInterview={submitInterview}
              isGenerating={isGenerating}
            />
          </motion.div>
        )}

        {/* Step 4: Results */}
        {!loading && !error && step === STEPS.RESULTS && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-3xl font-bold mb-2">Technical Feedback Report</h1>
                <p className="text-secondary-text">
                  Your personalized technical performance review.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/interview/history"
                  className="px-5 py-2.5 rounded-button text-sm font-medium border border-border hover:bg-surface transition-colors"
                >
                  View History
                </Link>
                <button
                  onClick={reset}
                  className="px-5 py-2.5 rounded-button text-sm font-medium bg-primary text-white hover:bg-accent transition-colors"
                >
                  New Interview
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <ScoreCard
                  score={results.scores?.overall || 0}
                  title="Technical Readiness"
                  subtitle={`For ${results.job_title}`}
                />
              </div>
              <div className="lg:col-span-2">
                <FeedbackCard feedback={results.feedback} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
