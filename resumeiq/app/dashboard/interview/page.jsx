"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Code, HelpCircle, History, ChevronRight, Mic } from "lucide-react";

export default function InterviewHub() {
  const interviewTypes = [
    {
      id: "hr",
      title: "HR Interview",
      description: "Practice behavioral and culture-fit questions with our AI HR Manager.",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/dashboard/interview/hr",
    },
    {
      id: "technical",
      title: "Technical Interview",
      description: "Deep dive into system design, coding concepts, and architecture.",
      icon: Code,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      href: "/dashboard/interview/technical",
    },
    {
      id: "mcq",
      title: "MCQ Assessment",
      description: "Test your knowledge with multiple choice questions on various skills.",
      icon: HelpCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
      href: "/dashboard/interview/mcq",
    },
    {
      id: "voice",
      title: "Speak with AI",
      description: "Live, hands-free voice conversation mock interview focusing on your chosen concepts.",
      icon: Mic,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      href: "/dashboard/interview/voice",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary-text mb-2">
            Interview <span className="gradient-text">Preparation</span>
          </h1>
          <p className="text-secondary-text">
            Choose an interview mode to practice your skills and get personalized AI feedback.
          </p>
        </div>
        <Link
          href="/dashboard/interview/history"
          className="flex items-center gap-2 bg-surface hover:bg-card text-primary-text font-medium px-5 py-2.5 rounded-button border border-border hover:border-primary/30 transition-all shadow-sm group"
        >
          <History className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
          View History
        </Link>
      </div>

      {/* Options Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {interviewTypes.map((type, i) => {
          const Icon = type.icon;
          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={type.href}
                className="block h-full bg-card border border-border hover:border-primary/50 hover:shadow-glow-sm rounded-card p-6 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${type.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${type.color}`} />
                </div>
                
                <h3 className="font-heading text-xl font-bold text-primary-text mb-3 flex items-center justify-between">
                  {type.title}
                  <ChevronRight className="w-5 h-5 text-muted group-hover:text-primary transition-colors group-hover:translate-x-1" />
                </h3>
                
                <p className="text-sm text-secondary-text leading-relaxed">
                  {type.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
