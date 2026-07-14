"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Mic,
  Send,
  MessageSquare,
} from "lucide-react";

const MAX_CHARS = 2000;

/**
 * QuestionCard — shows one interview question at a time with an answer textarea.
 * ChatGPT-like feel: one question displayed, user answers, then next.
 *
 * @param {Object} props
 * @param {Object} props.question - Current question object { id, question, category }.
 * @param {number} props.index - 0-based index.
 * @param {number} props.total - Total question count.
 * @param {string} props.savedAnswer - Previously saved answer for this question.
 * @param {boolean} props.isLast - Whether this is the last question.
 * @param {Function} props.onNext - Callback with answer text.
 * @param {Function} props.onPrev - Callback to go back.
 * @param {Function} props.onSubmit - Callback for final submission with answer text.
 */
export default function QuestionCard({
  question,
  index,
  total,
  savedAnswer = "",
  isLast,
  onNext,
  onPrev,
  onSubmit,
}) {
  const [answer, setAnswer] = useState(savedAnswer);
  const textareaRef = useRef(null);

  // Reset answer when question changes
  useEffect(() => {
    setAnswer(savedAnswer);
    textareaRef.current?.focus();
  }, [question?.id, savedAnswer]);

  const charCount = answer.length;
  const charPercent = (charCount / MAX_CHARS) * 100;

  return (
    <motion.div
      key={question?.id || index}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Question header */}
      <div className="flex items-center gap-3 text-sm">
        <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full">
          Question {index + 1} of {total}
        </span>
        {question?.category && (
          <span className="bg-surface text-muted px-3 py-1 rounded-full border border-border text-xs">
            {question.category}
          </span>
        )}
      </div>

      {/* Question bubble */}
      <div className="bg-card border border-border rounded-card p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <p className="font-heading text-lg font-semibold text-primary-text leading-relaxed pt-1">
            {question?.question}
          </p>
        </div>
      </div>

      {/* Answer area */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-secondary-text">
          Your Answer
        </label>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS)
                setAnswer(e.target.value);
            }}
            placeholder="Type your answer here... Be detailed and specific."
            rows={8}
            className="input-base w-full resize-none text-sm leading-relaxed"
          />

          {/* Character counter */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/30"
                title="Voice recording (coming soon)"
                disabled
              >
                <Mic className="w-3.5 h-3.5" />
                Record
              </button>
            </div>
            <span
              className={`text-xs font-medium ${
                charPercent > 90
                  ? "text-danger"
                  : charPercent > 70
                  ? "text-warning"
                  : "text-muted"
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="flex items-center gap-2 text-sm font-medium text-secondary-text hover:text-primary-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2.5 rounded-button hover:bg-surface"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {isLast ? (
          <motion.button
            onClick={() => onSubmit(answer)}
            disabled={!answer.trim()}
            whileHover={{ scale: answer.trim() ? 1.03 : 1 }}
            whileTap={{ scale: answer.trim() ? 0.97 : 1 }}
            className="flex items-center gap-2 bg-primary hover:bg-accent text-white font-bold px-6 py-3 rounded-button transition-all duration-200 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Submit Interview
          </motion.button>
        ) : (
          <motion.button
            onClick={() => onNext(answer)}
            disabled={!answer.trim()}
            whileHover={{ scale: answer.trim() ? 1.03 : 1 }}
            whileTap={{ scale: answer.trim() ? 0.97 : 1 }}
            className="flex items-center gap-2 bg-primary hover:bg-accent text-white font-bold px-6 py-3 rounded-button transition-all duration-200 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Question
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
