"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Briefcase, MapPin, Loader2, FileText, ChevronRight } from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";

export default function MarketIntelligenceInputPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    async function fetchResumes() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("resumes")
        .select("id, file_name, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (data) {
        setResumes(data);
        if (data.length > 0) setSelectedResumeId(data[0].id);
      }
      setLoadingResumes(false);
    }
    fetchResumes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !jobTitle) {
      addToast({ title: "Error", message: "Please select a resume and enter a job title.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    addToast({ title: "Processing", message: "Analyzing market data. This may take a minute...", type: "info" });

    try {
      const res = await fetch("/api/market-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedResumeId, jobTitle, location })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to generate market report");
      
      addToast({ title: "Success", message: "Market analysis complete!", type: "success" });
      router.push(`/dashboard/market/${data.data.id}`);
      
    } catch (error) {
      addToast({ title: "Error", message: error.message, type: "error" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-bold text-primary-text flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-primary" />
          AI Job Market Intelligence
        </h1>
        <p className="text-secondary-text text-lg">
          Compare your resume against real-time job market data to calculate your readiness score and generate a custom learning roadmap.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Resume Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-primary-text flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted" /> Select Resume
            </label>
            {loadingResumes ? (
              <div className="h-12 bg-card animate-pulse rounded-xl border border-border"></div>
            ) : resumes.length === 0 ? (
              <div className="p-4 bg-card border border-border rounded-xl text-secondary-text text-sm">
                You haven't uploaded any resumes yet. <a href="/dashboard/upload" className="text-primary hover:underline">Upload one here</a>.
              </div>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.file_name} (Last updated: {new Date(r.updated_at).toLocaleDateString()})</option>
                ))}
              </select>
            )}
          </div>

          {/* Job Title & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-primary-text flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted" /> Target Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. React Developer, Data Engineer"
                required
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-primary-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-primary-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted" /> Location (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, Remote, London"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-primary-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || resumes.length === 0}
              className="px-8 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Market...
                </>
              ) : (
                <>
                  Generate Intelligence Report
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
