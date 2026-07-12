"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stats } from "@/lib/mock-data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function StatCard({ stat, index }) {
  const numRef = useRef(null);
  const hasDecimal = stat.value % 1 !== 0;

  useEffect(() => {
    if (!numRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        numRef.current,
        { textContent: 0 },
        {
          textContent: stat.value,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: numRef.current,
            start: "top 80%",
            once: true,
          },
          snap: { textContent: hasDecimal ? 0.1 : 1 },
          onUpdate() {
            if (numRef.current) {
              const val = parseFloat(numRef.current.textContent);
              numRef.current.textContent = hasDecimal
                ? val.toFixed(1)
                : Math.round(val).toLocaleString();
            }
          },
        }
      );
    });

    return () => ctx.revert();
  }, [stat.value, hasDecimal]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="text-center p-8 bg-card border border-border rounded-card hover:border-primary/30 transition-all duration-300 group"
    >
      <div className="flex items-end justify-center gap-1 mb-3">
        <span
          ref={numRef}
          className="font-heading text-5xl font-bold gradient-text"
        >
          0
        </span>
        <span className="font-heading text-2xl font-bold text-primary mb-1">
          {stat.suffix}
        </span>
      </div>
      <p className="text-secondary-text font-medium">{stat.label}</p>
    </motion.div>
  );
}

export default function Statistics() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            Numbers that speak{" "}
            <span className="gradient-text">for themselves</span>
          </h2>
          <p className="text-secondary-text text-lg">
            Join a growing community of successful professionals
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
