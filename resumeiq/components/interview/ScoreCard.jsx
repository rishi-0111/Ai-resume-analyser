"use client";

import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { getScoreColor } from "@/lib/utils";

/**
 * ScoreCard — Displays the overall score with a circular progress bar.
 */
export default function ScoreCard({ score, title = "Overall Score", subtitle = "Interview Performance" }) {
  const colorClass = getScoreColor(score);
  
  // Map our text color classes to hex for the circular progress bar
  let pathColor = "#DC2626"; // Default danger
  if (score >= 80) pathColor = "#16A34A"; // Success
  else if (score >= 60) pathColor = "#D97706"; // Warning

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-card p-6 shadow-card flex flex-col items-center text-center h-full justify-center"
    >
      <h3 className="font-heading font-semibold text-lg text-primary-text mb-1">{title}</h3>
      <p className="text-sm text-secondary-text mb-6">{subtitle}</p>
      
      <div className="w-48 h-48 relative">
        <CircularProgressbar
          value={score}
          text={`${score}%`}
          strokeWidth={8}
          styles={buildStyles({
            pathColor: pathColor,
            textColor: "var(--color-primary-text)",
            trailColor: "var(--color-border)",
            pathTransitionDuration: 1.5,
            textSize: "1.5rem",
          })}
        />
      </div>
      
      <div className="mt-6">
        <p className={`font-semibold ${colorClass}`}>
          {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Improvement"}
        </p>
      </div>
    </motion.div>
  );
}
