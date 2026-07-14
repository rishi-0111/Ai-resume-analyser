"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, Briefcase, Play, Loader2, Search, ArrowRight, History } from "lucide-react";
import { getResumes } from "@/lib/services/resumeService";
import { interviewService } from "@/lib/services/interviewService";
import { supabase } from "@/lib/supabase/client";

export default function InterviewHub() {
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const [resumesData, fetchedSessions] = await Promise.all([
          getResumes(user.id),
          interviewService.getSessions()
        ]);
        const fetchedResumes = resumesData.resumes || [];
        setResumes(fetchedResumes);
        setSessions(fetchedSessions);
        if (fetchedResumes.length > 0) setSelectedResumeId(fetchedResumes[0].id);
      } catch (err) {
        console.error("Failed to load interview hub data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !jobTitle) return;
    setIsGenerating(true);

    try {
      const selectedResume = resumes.find(r => r.id === selectedResumeId);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          resumeText: selectedResume?.content || "Resume Content Missing",
          jobTitle,
          jobDescription
        })
      });

      if (!response.ok) throw new Error("Failed to generate interview");
      
      const newSession = await response.json();
      router.push(`/dashboard/interview/${newSession.id}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while generating the interview.");
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-primary-text mb-2">
          AI Interview <span className="gradient-text">Preparation</span>
        </h1>
        <p className="text-secondary-text">Generate personalized mock interviews based on your resume and target role.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* New Session Form */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" /> Start New Session
            </h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Select Resume</label>
                <select 
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="" disabled>Choose a resume...</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.title || "Untitled Resume"}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Target Job Title</label>
                <input 
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-text mb-1">Job Description (Optional)</label>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description for highly targeted questions..."
                  className="w-full h-32 bg-background border border-border rounded-xl px-4 py-2.5 text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isGenerating || !selectedResumeId || !jobTitle}
                className="w-full btn-primary py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                {isGenerating ? "Generating Questions..." : "Generate Interview"}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-secondary-text" /> Recent Sessions
          </h2>
          
          {sessions.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center border border-dashed border-border">
              <MessageSquare className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-primary-text mb-2">No Interviews Yet</h3>
              <p className="text-secondary-text max-w-sm mx-auto">
                Generate your first mock interview to practice your skills and get personalized AI feedback.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map(session => (
                <div key={session.id} className="glass-panel p-5 rounded-2xl flex flex-col h-full hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      session.status === 'completed' 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {session.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-primary-text mb-1 line-clamp-1" title={session.job_title}>
                    {session.job_title}
                  </h3>
                  <p className="text-sm text-secondary-text mb-4">
                    {new Date(session.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="mt-auto">
                    {session.status === 'completed' && session.scores && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 bg-surface rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${session.scores.overall}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-primary-text">{session.scores.overall}/100</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => router.push(`/dashboard/interview/${session.id}`)}
                      className="w-full text-sm font-medium text-primary hover:text-primary-text transition-colors flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 py-2 rounded-lg"
                    >
                      {session.status === 'completed' ? 'View Results' : 'Resume Interview'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
