import { useState, useCallback, useEffect } from 'react';

export const STEPS = {
  SELECT_RESUME: 0,
  SETUP: 1,
  GENERATING: 2,
  TEST: 3,
  RESULTS: 4
};

export function useMCQ() {
  const [step, setStep] = useState(STEPS.SELECT_RESUME);
  const [selectedResume, setSelectedResume] = useState(null);
  const [setupData, setSetupData] = useState({
    role: "",
    domain: "",
    experienceLevel: "",
    difficulty: "Medium",
    questionCount: 10
  });
  
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const initAssessment = useCallback(async () => {
    try {
      setStep(STEPS.GENERATING);
      setError(null);
      
      const res = await fetch('/api/interview/mcq/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResume?.id || null,
          jobTitle: setupData.role,
          domain: setupData.domain,
          experienceLevel: setupData.experienceLevel,
          difficulty: setupData.difficulty,
          questionCount: setupData.questionCount
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to initialize MCQ");
      }

      const data = await res.json();
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setStep(STEPS.TEST);
      setCurrentIndex(0);
      setUserAnswers({});
      
    } catch (err) {
      setError(err.message);
      setStep(STEPS.SETUP);
    }
  }, [selectedResume, setupData]);

  const submitAssessment = useCallback(async (finalAnswers) => {
    try {
      setStep(STEPS.GENERATING);
      const res = await fetch('/api/interview/mcq/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userAnswers: finalAnswers || userAnswers
        }),
      });

      if (!res.ok) throw new Error("Failed to submit assessment");
      const data = await res.json();
      setResults(data);
      setStep(STEPS.RESULTS);
    } catch (err) {
      setError(err.message);
      setStep(STEPS.TEST); // go back so they can try submitting again
    }
  }, [sessionId, userAnswers]);

  const handleAnswer = useCallback((answer) => {
    setUserAnswers(prev => ({ ...prev, [currentIndex]: answer }));
  }, [currentIndex]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Last question reached
      submitAssessment();
    }
  }, [currentIndex, questions.length, submitAssessment]);

  // Tab switch penalty logic
  const forceSkipQuestion = useCallback(() => {
    setUserAnswers(prev => ({ ...prev, [currentIndex]: null })); // Record null as incorrect
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Last question skipped via cheating penalty -> submit immediately
      submitAssessment({ ...userAnswers, [currentIndex]: null });
    }
  }, [currentIndex, questions.length, submitAssessment, userAnswers]);

  const reset = useCallback(() => {
    setStep(STEPS.SELECT_RESUME);
    setSelectedResume(null);
    setSetupData({ role: "", domain: "", experienceLevel: "", difficulty: "Medium", questionCount: 10 });
    setSessionId(null);
    setQuestions([]);
    setCurrentIndex(0);
    setUserAnswers({});
    setResults(null);
  }, []);

  return {
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
  };
}
