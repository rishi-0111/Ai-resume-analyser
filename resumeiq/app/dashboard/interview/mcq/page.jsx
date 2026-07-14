"use client";

import { motion } from "framer-motion";
import { useMCQ, STEPS } from "@/lib/hooks/useMCQ";
import ResumeSelector from "@/components/interview/ResumeSelector";
import InterviewSetup from "@/components/interview/InterviewSetup";
import MCQAssessment from "@/components/interview/MCQAssessment";
import { HelpCircle, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MCQPage() {
  const router = useRouter();
  const {
    step,
    setStep,
    selectedResume,
    setSelectedResume,
    setupData,
    setSetupData,
    questions,
    currentIndex,
    userAnswers,
    results,
    error,
    initAssessment,
    handleAnswer,
    nextQuestion,
    submitAssessment,
    forceSkipQuestion,
    reset
  } = useMCQ();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link 
          href="/dashboard/interview"
          className="p-2 bg-surface hover:bg-card border border-border rounded-lg text-secondary-text hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary-text flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-green-500" />
            MCQ Assessment
          </h1>
          <p className="text-secondary-text text-sm">
            Strict timed assessment with anti-cheating enabled.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      {/* Step 0: Select Resume */}
      {step === STEPS.SELECT_RESUME && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-heading font-semibold text-primary-text mb-6">Select a Context Resume</h2>
          <ResumeSelector 
            onSelect={(resume) => {
              setSelectedResume(resume);
              if (resume?.job_title) {
                setSetupData(prev => ({ ...prev, role: resume.job_title }));
              }
              setStep(STEPS.SETUP);
            }} 
          />
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(STEPS.SETUP)}
              className="px-6 py-2 bg-surface border border-border text-primary-text hover:text-primary rounded-button transition-colors"
            >
              Skip Resume
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 1: Setup */}
      {step === STEPS.SETUP && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-heading font-semibold text-primary-text mb-6">Test Parameters</h2>
          <InterviewSetup 
            value={setupData}
            onChange={setSetupData}
            isTechnical={true}
          />
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => setStep(STEPS.SELECT_RESUME)}
              className="px-6 py-2 bg-surface border border-border text-primary-text hover:text-primary rounded-button transition-colors"
            >
              Back
            </button>
            <button
              onClick={initAssessment}
              disabled={!setupData.role}
              className="px-6 py-2 bg-green-500 text-white rounded-button hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-glow-sm"
            >
              Start Assessment
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Generating */}
      {step === STEPS.GENERATING && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <h3 className="text-xl font-heading font-bold text-primary-text">Preparing Test...</h3>
          <p className="text-secondary-text text-center max-w-sm">
            Generating challenging multiple choice questions based on your profile. Get ready!
          </p>
        </div>
      )}

      {/* Step 3: Test Mode */}
      {step === STEPS.TEST && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <MCQAssessment 
            questionData={questions[currentIndex]}
            currentIndex={currentIndex}
            totalCount={questions.length}
            userAnswer={userAnswers[currentIndex]}
            onAnswer={handleAnswer}
            onNext={nextQuestion}
            onForceSkip={forceSkipQuestion}
          />
        </motion.div>
      )}

      {/* Step 4: Results */}
      {step === STEPS.RESULTS && results && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-8">
          <div className="bg-card border border-border p-10 rounded-2xl shadow-sm text-center">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-primary-text mb-2">Test Completed!</h2>
            <p className="text-secondary-text mb-8">You answered {results.correct} out of {results.total} correctly.</p>
            
            <div className="inline-block p-6 bg-surface border border-border rounded-xl">
              <div className="text-5xl font-black gradient-text mb-2">{results.score}%</div>
              <div className="text-sm font-medium text-secondary-text uppercase tracking-wider">Overall Score</div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => router.push('/dashboard/interview/history')}
              className="px-8 py-3 bg-surface border border-border text-primary-text rounded-button hover:border-primary/50 transition-all"
            >
              View History
            </button>
            <button
              onClick={reset}
              className="px-8 py-3 bg-primary text-white rounded-button hover:bg-primary-hover shadow-glow-sm transition-all"
            >
              Take Another Test
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
