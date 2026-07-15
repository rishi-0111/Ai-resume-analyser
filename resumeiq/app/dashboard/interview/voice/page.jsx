"use client";

import { motion } from "framer-motion";
import { useInterview, STEPS } from "@/lib/hooks/useInterview";
import ResumeSelector from "@/components/interview/ResumeSelector";
import InterviewSetup from "@/components/interview/InterviewSetup";
import ChatRoom from "@/components/interview/ChatRoom";
import { Mic, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VoiceInterviewPage() {
  const router = useRouter();
  const {
    step,
    selectedResume,
    setupData,
    setSetupData,
    messages,
    isGenerating,
    results,
    confirmResume,
    generateInterview,
    sendMessage,
    submitInterview,
    reset
  } = useInterview({ type: 'technical' }); // Uses technical AI, but highly tailored to concepts

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
            <Mic className="w-6 h-6 text-pink-500" />
            Speak with AI
          </h1>
          <p className="text-secondary-text text-sm">
            Live, hands-free conversation focused on specific concepts.
          </p>
        </div>
      </div>

      {/* Step 0: Select Resume */}
      {step === STEPS.SELECT_RESUME && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-heading font-semibold text-primary-text mb-6">Select a Context Resume</h2>
          <ResumeSelector 
            selected={selectedResume}
            onSelect={confirmResume} 
          />
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => confirmResume(null)}
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
          <h2 className="text-xl font-heading font-semibold text-primary-text mb-6">Interview Parameters</h2>
          <InterviewSetup 
            value={setupData}
            onChange={setSetupData}
            isTechnical={true}
            isVoice={true}
          />
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={reset}
              className="px-6 py-2 bg-surface border border-border text-primary-text hover:text-primary rounded-button transition-colors"
            >
              Back
            </button>
            <button
              onClick={generateInterview}
              disabled={!setupData.role}
              className="px-6 py-2 bg-pink-500 text-white rounded-button hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-glow-sm"
            >
              Start Live Interview
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Generating */}
      {step === STEPS.GENERATING && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <h3 className="text-xl font-heading font-bold text-primary-text">Connecting...</h3>
          <p className="text-secondary-text text-center max-w-sm">
            Initializing AI voice modules and setting up your environment. Make sure your volume is up!
          </p>
        </div>
      )}

      {/* Step 3: Interview Active */}
      {step === STEPS.INTERVIEW && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ChatRoom 
            messages={messages} 
            onSendMessage={sendMessage} 
            onEndInterview={submitInterview} 
            isGenerating={isGenerating}
            forceVoiceMode={true}
            interviewerPersona={setupData.interviewerPersona}
          />
        </motion.div>
      )}

      {/* Step 4: Results */}
      {step === STEPS.EVALUATING && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <h3 className="text-xl font-heading font-bold text-primary-text">Evaluating Performance...</h3>
          <p className="text-secondary-text text-center max-w-sm">
            The AI is analyzing your answers, technical depth, and communication skills.
          </p>
        </div>
      )}

      {step === STEPS.RESULTS && results && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-8">
          {/* Reuse result UI from HR/Technical */}
          <div className="bg-card border border-border p-10 rounded-2xl shadow-sm text-center">
             <div className="w-20 h-20 bg-pink-500/10 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-primary-text mb-2">Interview Completed!</h2>
            <div className="inline-block p-6 bg-surface border border-border rounded-xl mt-6">
              <div className="text-5xl font-black gradient-text mb-2">{results.overallScore}%</div>
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
              Start New Interview
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
