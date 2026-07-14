import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const TIMER_SECONDS = 60;

export default function MCQAssessment({ 
  questionData, 
  currentIndex, 
  totalCount, 
  userAnswer, 
  onAnswer, 
  onNext, 
  onForceSkip 
}) {
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [warning, setWarning] = useState(null);

  // Anti-Cheating: Detect Tab Switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarning("Tab switching detected! You have forfeited this question.");
        // Short delay to let them see the warning before skipping
        setTimeout(() => {
          setWarning(null);
          onForceSkip();
        }, 3000);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [onForceSkip]);

  // Anti-Cheating: Disable copy-paste & context menu
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    return () => {
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('copy', preventDefault);
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    setTimeLeft(TIMER_SECONDS); // Reset timer on new question
  }, [currentIndex]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onForceSkip(); // Time's up -> force skip
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, onForceSkip]);

  if (!questionData) return null;

  return (
    <div className="max-w-3xl mx-auto w-full select-none">
      
      {/* Header / Progress */}
      <div className="flex items-center justify-between mb-8 bg-surface border border-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-secondary-text">Question {currentIndex + 1} of {totalCount}</span>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeLeft < 15 ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'} font-bold`}>
          <Clock className="w-4 h-4" />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Warning Toast */}
      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">{warning}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Card */}
      <motion.div
        key={currentIndex} // forces re-animation when question changes
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card border border-border p-8 rounded-2xl shadow-sm mb-6"
      >
        <h2 className="text-xl font-heading font-semibold text-primary-text mb-6">
          {questionData.question}
        </h2>

        <div className="space-y-3">
          {questionData.options.map((option, idx) => {
            const isSelected = userAnswer === option;
            return (
              <button
                key={idx}
                onClick={() => onAnswer(option)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                  isSelected 
                    ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                    : 'border-border bg-surface hover:border-primary/50 hover:bg-surface-hover'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-primary bg-primary text-white' : 'border-muted'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-background rounded-full" />}
                </div>
                <span className="text-primary-text">{option}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Footer / Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!userAnswer}
          className={`px-8 py-3 rounded-button font-medium transition-all ${
            !userAnswer 
              ? 'bg-surface border border-border text-muted cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover shadow-glow-sm'
          }`}
        >
          {currentIndex === totalCount - 1 ? 'Submit Test' : 'Next Question'}
        </button>
      </div>

    </div>
  );
}
