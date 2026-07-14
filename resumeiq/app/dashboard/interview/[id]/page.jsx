"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, ArrowLeft, ArrowRight, CheckCircle, 
  MessageSquare, Brain, Target, Star, TrendingUp, AlertTriangle, BookOpen
} from "lucide-react";
import { interviewService } from "@/lib/services/interviewService";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function InterviewSession() {
  const { id } = useParams();
  const router = useRouter();
  
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const data = await interviewService.getSessionById(id);
        setSession(data);
        if (data.answers) setAnswers(data.answers);
      } catch (err) {
        console.error("Error loading session:", err);
        alert("Failed to load interview session.");
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [id]);

  const handleAnswerChange = (e) => {
    const questionId = session.questions[currentQuestionIndex].id;
    setAnswers({
      ...answers,
      [questionId]: e.target.value
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(curr => curr + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(curr => curr - 1);
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to submit your interview for AI evaluation?")) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: id,
          answers,
          questions: session.questions
        })
      });

      if (!response.ok) throw new Error("Failed to evaluate interview");
      
      const updatedSession = await response.json();
      setSession(updatedSession);
    } catch (err) {
      console.error(err);
      alert("Something went wrong during evaluation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return <div>Session not found.</div>;

  // -----------------------------------------------------
  // STATE: RESULTS DASHBOARD (COMPLETED)
  // -----------------------------------------------------
  if (session.status === 'completed' && session.scores) {
    const { scores, feedback } = session;
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary-text mb-2">
              Interview <span className="gradient-text">Results</span>
            </h1>
            <p className="text-secondary-text">Feedback for: {session.job_title}</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/interview')}
            className="flex items-center gap-2 text-sm text-muted hover:text-primary-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hub
          </button>
        </div>

        {/* Top Scores Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 mb-4">
              <CircularProgressbar 
                value={scores.overall} 
                text={`${scores.overall}%`}
                styles={buildStyles({ pathColor: '#3b82f6', textColor: '#fff', trailColor: 'rgba(255,255,255,0.1)' })}
              />
            </div>
            <p className="text-sm font-medium text-secondary-text">Overall Score</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <Brain className="w-5 h-5" /> <span className="font-bold text-lg">{scores.technical}%</span>
            </div>
            <p className="text-sm text-secondary-text">Technical Correctness</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <MessageSquare className="w-5 h-5" /> <span className="font-bold text-lg">{scores.communication}%</span>
            </div>
            <p className="text-sm text-secondary-text">Communication</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Target className="w-5 h-5" /> <span className="font-bold text-lg">{scores.confidence}%</span>
            </div>
            <p className="text-sm text-secondary-text">Confidence Level</p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-green-400">
              <Star className="w-5 h-5" /> Key Strengths
            </h3>
            <ul className="space-y-3">
              {feedback.strengths?.map((str, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-secondary-text bg-surface p-3 rounded-xl border border-border">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> {str}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="w-5 h-5" /> Areas to Improve
            </h3>
            <ul className="space-y-3">
              {feedback.weaknesses?.map((wk, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-secondary-text bg-surface p-3 rounded-xl border border-border">
                  <TrendingUp className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" /> {wk}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Personalized Tips & Learning Roadmap */}
        <div className="glass-panel p-8 rounded-2xl space-y-8">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-primary-text">
              <Brain className="w-6 h-6 text-primary" /> AI Coach Advice
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feedback.personalizedTips?.map((tip, i) => (
                <div key={i} className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-sm text-primary-text">
                  {tip}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-primary-text">
              <BookOpen className="w-6 h-6 text-accent" /> Learning Roadmap
            </h3>
            <div className="space-y-4">
              {feedback.learningRoadmap?.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-surface border border-border">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                    <span className="text-accent font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-text text-lg">{item.topic}</h4>
                    <p className="text-secondary-text mt-1 mb-3">{item.reason}</p>
                    <div className="inline-block bg-background px-3 py-1.5 rounded-lg text-xs font-medium border border-border">
                      <span className="text-muted mr-2">Resource Hint:</span>
                      <span className="text-accent">{item.resourceHint}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Question by Question Review */}
        <div>
          <h3 className="text-xl font-bold mb-6 text-primary-text">Answer Review</h3>
          <div className="space-y-6">
            {session.questions.map((q, i) => {
              const evalData = feedback.questionEvaluations?.find(e => e.id === q.id);
              return (
                <div key={q.id} className="glass-panel p-6 rounded-2xl border-l-4 border-l-primary">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
                      Question {i + 1} - {q.category}
                    </span>
                    {evalData && (
                      <span className={`text-sm font-bold px-2 py-1 rounded ${evalData.score >= 80 ? 'text-green-400 bg-green-400/10' : evalData.score >= 50 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>
                        Score: {evalData.score}/100
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-medium text-primary-text mb-4">{q.question}</h4>
                  
                  <div className="bg-surface p-4 rounded-xl border border-border mb-4">
                    <span className="text-xs font-bold text-muted uppercase block mb-2">Your Answer:</span>
                    <p className="text-secondary-text whitespace-pre-wrap">{answers[q.id] || "No answer provided."}</p>
                  </div>
                  
                  {evalData && (
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <span className="text-xs font-bold text-primary uppercase block mb-2">AI Feedback:</span>
                      <p className="text-primary-text text-sm">{evalData.feedback}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------
  // STATE: ACTIVE INTERVIEW (PENDING)
  // -----------------------------------------------------
  const currentQuestion = session.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in h-[calc(100vh-10rem)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary-text">
            Mock <span className="gradient-text">Interview</span>
          </h1>
          <p className="text-sm text-secondary-text">{session.job_title}</p>
        </div>
        <div className="text-sm font-medium bg-surface px-4 py-2 rounded-xl border border-border">
          Question {currentQuestionIndex + 1} of {session.questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface h-2 rounded-full overflow-hidden shrink-0">
        <div 
          className="bg-primary h-full transition-all duration-500 ease-out"
          style={{ width: `${((currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="glass-panel p-6 md:p-8 rounded-2xl flex-1 flex flex-col"
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1.5 rounded-lg mb-6 self-start">
            <MessageSquare className="w-4 h-4" />
            {currentQuestion.category}
          </div>
          
          <h2 className="text-xl md:text-2xl font-medium text-primary-text mb-8">
            {currentQuestion.question}
          </h2>

          <div className="flex-1 flex flex-col">
            <label className="text-sm font-medium text-secondary-text mb-2 flex justify-between items-end">
              <span>Your Answer</span>
              <span className="text-xs text-muted font-normal">Take your time. Explain clearly.</span>
            </label>
            <textarea
              className="flex-1 w-full bg-background border border-border rounded-xl p-4 text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-medium leading-relaxed"
              placeholder="Type your answer here..."
              value={answers[currentQuestion.id] || ""}
              onChange={handleAnswerChange}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-between shrink-0 pt-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {currentQuestionIndex === session.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 font-bold"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {isSubmitting ? "Evaluating..." : "Submit Interview"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
