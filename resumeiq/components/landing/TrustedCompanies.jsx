"use client";

import { trustedCompanies } from "@/lib/mock-data";

export default function TrustedCompanies() {
  const doubled = [...trustedCompanies, ...trustedCompanies];

  return (
    <section className="py-16 border-y border-border/50 overflow-hidden bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <p className="text-sm font-medium text-muted uppercase tracking-widest">
          Trusted by engineers at
        </p>
      </div>

      <div className="relative">
        {/* Left Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        {/* Right Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {doubled.map((company, i) => (
            <div
              key={`${company}-${i}`}
              className="inline-flex items-center gap-2 text-muted hover:text-secondary-text transition-colors duration-300 flex-shrink-0"
            >
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <span className="text-base font-semibold tracking-wide">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
