"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Lightbulb, TrendingUp } from "lucide-react";

/**
 * FeedbackCard — Displays detailed feedback categories.
 */
export default function FeedbackCard({ feedback }) {
  if (!feedback) return null;

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        {feedback.communication && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border p-5 rounded-card shadow-sm"
          >
            <h4 className="font-semibold text-sm text-primary-text mb-2 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              Communication
            </h4>
            <p className="text-sm text-secondary-text leading-relaxed">
              {feedback.communication}
            </p>
          </motion.div>
        )}
        
        {feedback.confidence && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border p-5 rounded-card shadow-sm"
          >
            <h4 className="font-semibold text-sm text-primary-text mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Confidence
            </h4>
            <p className="text-sm text-secondary-text leading-relaxed">
              {feedback.confidence}
            </p>
          </motion.div>
        )}

        {feedback.technicalKnowledge && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border p-5 rounded-card shadow-sm"
          >
            <h4 className="font-semibold text-sm text-primary-text mb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-500" />
              Technical / Role Knowledge
            </h4>
            <p className="text-sm text-secondary-text leading-relaxed">
              {feedback.technicalKnowledge}
            </p>
          </motion.div>
        )}

        {feedback.problemSolving && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border p-5 rounded-card shadow-sm"
          >
            <h4 className="font-semibold text-sm text-primary-text mb-2 flex items-center gap-2">
              <Puzzle className="w-4 h-4 text-green-500" />
              Problem Solving
            </h4>
            <p className="text-sm text-secondary-text leading-relaxed">
              {feedback.problemSolving}
            </p>
          </motion.div>
        )}
      </div>

      {/* Actionable Lists */}
      <div className="grid md:grid-cols-2 gap-6 pt-4">
        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border p-6 rounded-card shadow-sm"
          >
            <h4 className="font-semibold text-sm text-primary-text mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Suggestions for Improvement
            </h4>
            <ul className="space-y-3">
              {feedback.suggestions.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-secondary-text">
                  <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {feedback.nextLearningTopics && feedback.nextLearningTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card border border-border p-6 rounded-card shadow-sm"
          >
            <h4 className="font-semibold text-sm text-primary-text mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Next Learning Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {feedback.nextLearningTopics.map((topic, i) => (
                <span
                  key={i}
                  className="bg-surface border border-border px-3 py-1.5 rounded-full text-xs font-medium text-primary-text"
                >
                  {topic}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Missing icon imports added here for simplicity
import { MessageCircle, Sparkles, Code, Puzzle } from "lucide-react";
