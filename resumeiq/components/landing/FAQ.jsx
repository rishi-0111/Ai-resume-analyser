"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { mockFAQ } from "@/lib/mock-data";

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`border rounded-xl overflow-hidden transition-all duration-300 ${
        open ? "border-primary/30 bg-card" : "border-border bg-card/50"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left group"
        aria-expanded={open}
      >
        <span
          className={`font-semibold text-sm md:text-base transition-colors duration-200 ${
            open ? "text-primary-text" : "text-secondary-text group-hover:text-primary-text"
          }`}
        >
          {item.q}
        </span>
        <div
          className={`flex-shrink-0 ml-4 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
            open ? "bg-primary" : "bg-surface border border-border"
          }`}
        >
          {open ? (
            <Minus className="w-3.5 h-3.5 text-white" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-secondary-text" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-secondary-text text-sm leading-relaxed">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="py-24 bg-surface/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            Frequently asked{" "}
            <span className="gradient-text">questions</span>
          </h2>
          <p className="text-secondary-text text-lg">
            Everything you need to know about ResumeIQ AI
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {mockFAQ.map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-secondary-text text-sm">
            Still have questions?{" "}
            <a
              href="mailto:hello@resumeiq.ai"
              className="text-primary hover:text-accent transition-colors font-medium"
            >
              Contact our team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
