"use client";

import { useState, useCallback, useRef } from "react";

export const STEPS = {
  SELECT_RESUME: "select_resume",
  SETUP: "setup", // Replaces SELECT_ROLE
  GENERATING: "generating",
  INTERVIEW: "interview",
  SUBMITTING: "submitting",
  RESULTS: "results",
};

export function useInterview({ type = "hr" } = {}) {
  // ─── State ───────────────────────────────────────────
  const [step, setStep] = useState(STEPS.SELECT_RESUME);
  const [selectedResume, setSelectedResume] = useState(null);
  const [setupData, setSetupData] = useState({
    role: "",
    domain: "",
    experienceLevel: "",
    targetCompany: "",
    concepts: "",
    difficulty: "Medium",
    questionCount: 5,
    interviewerPersona: "Male"
  });
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // for streaming/typing indicator

  // Track timing
  const startedAtRef = useRef(null);

  // ─── Actions ─────────────────────────────────────────

  const confirmResume = useCallback((resume) => {
    setSelectedResume(resume);
    setError(null);
    setStep(STEPS.SETUP);
  }, []);

  const generateInterview = useCallback(async () => {
    if (!setupData.role) {
      setError("Please provide a target role.");
      return;
    }

    setStep(STEPS.GENERATING);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/interview/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          resumeId: selectedResume?.id === "skip" ? null : (selectedResume?.id || null),
          jobTitle: setupData.role,
          domain: setupData.domain,
          experienceLevel: setupData.experienceLevel,
          targetCompany: setupData.targetCompany,
          concepts: setupData.concepts,
          difficulty: setupData.difficulty,
          questionCount: setupData.questionCount,
          interviewerPersona: setupData.interviewerPersona
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.details || "Failed to initialize interview");
      }

      const session = await res.json();
      setSessionId(session.id);
      setMessages(session.messages || []);
      startedAtRef.current = Date.now();
      setStep(STEPS.INTERVIEW);
    } catch (err) {
      console.error("Init error:", err);
      setError(err.message);
      setStep(STEPS.SETUP); 
    } finally {
      setLoading(false);
    }
  }, [selectedResume, setupData, type]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !sessionId) return;

    // Optimistically add user message
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);
    setError(null);

    try {
      // Artificial "Thinking" delay to make the AI feel more human
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await fetch(`/api/interview/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: text
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      const { message } = await res.json();
      setMessages(prev => [...prev, message]);
    } catch (err) {
      console.error("Chat error:", err);
      setError(err.message);
      // Remove the optimistic message if it failed, so they can retry
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsGenerating(false);
    }
  }, [sessionId]);

  const submitInterview = useCallback(async () => {
    setStep(STEPS.SUBMITTING);
    setError(null);
    setLoading(true);

    const duration = startedAtRef.current
      ? Math.round((Date.now() - startedAtRef.current) / 1000)
      : 0;

    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          duration,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.details || "Failed to evaluate interview");
      }

      const session = await res.json();
      setResults(session);
      setStep(STEPS.RESULTS);
    } catch (err) {
      console.error("Evaluate error:", err);
      setError(err.message);
      setStep(STEPS.INTERVIEW); // let them resume the chat if evaluate fails
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const retry = useCallback(() => {
    setError(null);
    if (step === STEPS.GENERATING) {
      generateInterview();
    } else if (step === STEPS.SUBMITTING) {
      submitInterview();
    }
  }, [step, generateInterview, submitInterview]);

  const reset = useCallback(() => {
    setStep(STEPS.SELECT_RESUME);
    setSelectedResume(null);
    setSetupData({ role: "", domain: "", experienceLevel: "", targetCompany: "", concepts: "", difficulty: "Medium", questionCount: 5, interviewerPersona: "Male" });
    setMessages([]);
    setSessionId(null);
    setResults(null);
    setError(null);
    setLoading(false);
    setIsGenerating(false);
    startedAtRef.current = null;
  }, []);

  return {
    step,
    selectedResume,
    setupData,
    setSetupData,
    messages,
    sessionId,
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
  };
}
