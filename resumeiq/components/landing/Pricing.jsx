"use client";

import { motion } from "framer-motion";
import { Check, X, Zap, ArrowRight } from "lucide-react";
import { mockPricingPlans } from "@/lib/mock-data";

function PricingCard({ plan, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative rounded-card p-8 flex flex-col transition-all duration-300 ${
        plan.highlighted
          ? "bg-gradient-to-b from-primary/10 to-card border-2 border-primary shadow-glow scale-105"
          : "bg-card border border-border hover:border-primary/30"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-glow-sm">
            <Zap className="w-3 h-3" />
            {plan.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-heading font-bold text-xl mb-2">{plan.name}</h3>
        <p className="text-secondary-text text-sm mb-6">{plan.description}</p>

        <div className="flex items-end gap-1">
          <span className="text-4xl font-heading font-bold">
            {plan.price === 0 ? "Free" : `$${plan.price}`}
          </span>
          {plan.price > 0 && (
            <span className="text-secondary-text text-sm mb-1.5">
              /{plan.period}
            </span>
          )}
        </div>
      </div>

      <a
        href="/signup"
        className={`flex items-center justify-center gap-2 py-3 px-6 rounded-button font-semibold text-sm mb-8 transition-all duration-200 group ${
          plan.highlighted
            ? "bg-primary hover:bg-accent text-white hover:shadow-glow-sm"
            : "border border-border hover:border-primary text-secondary-text hover:text-primary-text"
        }`}
      >
        {plan.cta}
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </a>

      <div className="space-y-3 flex-1">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <span className="text-sm text-secondary-text">{feature}</span>
          </div>
        ))}
        {plan.notIncluded.map((feature) => (
          <div key={feature} className="flex items-start gap-3 opacity-40">
            <X className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" />
            <span className="text-sm text-muted">{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full border border-primary/20">
            <span className="text-xs font-medium text-secondary-text">
              Simple, transparent pricing
            </span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            Choose your <span className="gradient-text">plan</span>
          </h2>
          <p className="text-secondary-text text-lg max-w-xl mx-auto">
            Start free, upgrade when you need more. Cancel anytime.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {mockPricingPlans.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted text-sm mt-12"
        >
          All plans include a 14-day money-back guarantee. No questions asked.
        </motion.p>
      </div>
    </section>
  );
}
