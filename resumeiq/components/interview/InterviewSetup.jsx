import { useState } from "react";
import { Search, Briefcase, Code, Building, GraduationCap, Target, Layers, Hash, Lightbulb, User } from "lucide-react";
import { motion } from "framer-motion";

export default function InterviewSetup({ value, onChange, onSubmit, isTechnical = false, isVoice = false }) {
  const [isFocused, setIsFocused] = useState(false);

  const commonRoles = [
    "Software Engineer", "Frontend Developer", "Backend Developer",
    "Data Scientist", "Product Manager", "UX Designer",
    "Marketing Manager", "Sales Representative", "HR Manager",
    "Financial Analyst", "Operations Manager", "Customer Success"
  ];

  const domains = [
    "Frontend (React, Vue, Angular)",
    "Backend (Node.js, Java, Python, .NET)",
    "Full Stack",
    "Database (SQL, MongoDB, PostgreSQL)",
    "Cloud (AWS, Azure, GCP)",
    "DevOps (Docker, Kubernetes, CI/CD)",
    "AI / Machine Learning",
    "Data Structures & Algorithms",
    "System Design",
    "Cyber Security",
    "Mobile (iOS, Android, React Native)"
  ];

  const experienceLevels = [
    "Fresher / Entry Level",
    "Junior (1-3 years)",
    "Mid-Level (3-5 years)",
    "Senior (5+ years)",
    "Lead / Manager"
  ];

  const companies = [
    "Any Company", "Google", "Amazon", "Microsoft", "Meta", "Apple",
    "Netflix", "TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Zoho"
  ];

  const difficulties = ["Easy", "Medium", "Hard", "Expert"];
  const questionCounts = [3, 5, 7, 10];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-5 bg-surface border border-border p-6 rounded-card shadow-sm">
        
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-primary-text mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" /> Target Job Title
          </label>
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isFocused ? 'text-primary' : 'text-muted'}`} />
            <input
              type="text"
              placeholder="e.g. Senior Frontend Developer"
              value={value.role || ""}
              onChange={(e) => onChange({ ...value, role: e.target.value })}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              className="w-full bg-background border border-border rounded-button py-3 pl-12 pr-4 text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {commonRoles.slice(0, 5).map((roleName) => (
              <button
                key={roleName}
                onClick={() => onChange({ ...value, role: roleName })}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:border-primary/50 text-secondary-text hover:text-primary transition-colors"
              >
                {roleName}
              </button>
            ))}
          </div>
        </div>

        {/* Technical Domain (Only if Technical Interview) */}
        {isTechnical && (
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-500" /> Focus Domain
            </label>
            <input
              type="text"
              list="domain-options"
              placeholder="e.g. Frontend, Data Engineering, iOS..."
              value={value.domain || ""}
              onChange={(e) => onChange({ ...value, domain: e.target.value })}
              className="w-full bg-background border border-border rounded-button py-3 px-4 text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <datalist id="domain-options">
              {domains.map(d => <option key={d} value={d} />)}
            </datalist>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-green-500" /> Experience
            </label>
            <select
              value={value.experienceLevel || ""}
              onChange={(e) => onChange({ ...value, experienceLevel: e.target.value })}
              className="w-full bg-background border border-border rounded-button py-3 px-4 text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
            >
              <option value="">Select Level...</option>
              {experienceLevels.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Target Company */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-orange-500" /> Target Company (Optional)
            </label>
            <input
              type="text"
              list="company-options"
              placeholder="e.g. Google, Stripe, or leave blank"
              value={value.targetCompany || ""}
              onChange={(e) => onChange({ ...value, targetCompany: e.target.value })}
              className="w-full bg-background border border-border rounded-button py-3 px-4 text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <datalist id="company-options">
              {companies.filter(c => c !== "Any Company").map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" /> Difficulty
            </label>
            <select
              value={value.difficulty || "Medium"}
              onChange={(e) => onChange({ ...value, difficulty: e.target.value })}
              className="w-full bg-background border border-border rounded-button py-3 px-4 text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
            >
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-medium text-primary-text mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4 text-pink-500" /> Total Questions
            </label>
            <select
              value={value.questionCount || 5}
              onChange={(e) => onChange({ ...value, questionCount: parseInt(e.target.value) })}
              className="w-full bg-background border border-border rounded-button py-3 px-4 text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
            >
              {questionCounts.map(q => <option key={q} value={q}>{q} Questions</option>)}
            </select>
          </div>
        </div>

        {/* Concepts to Focus On (Only for Voice Mode) */}
        {isVoice && (
          <>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" /> Concepts to Focus On
              </label>
              <input
                type="text"
                placeholder="e.g. React Hooks, Node.js Event Loop, System Design..."
                value={value.concepts || ""}
                onChange={(e) => onChange({ ...value, concepts: e.target.value })}
                className="w-full bg-background border border-border rounded-button py-3 px-4 text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <p className="text-xs text-secondary-text mt-2">
                Specify exact topics you want the AI to grill you on in this voice mock interview.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-text mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500" /> Interviewer Persona
              </label>
              <select
                value={value.interviewerPersona || "Male"}
                onChange={(e) => onChange({ ...value, interviewerPersona: e.target.value })}
                className="w-full bg-background border border-border rounded-button py-3 px-4 text-primary-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
              >
                <option value="Male">Male Voice (e.g., David)</option>
                <option value="Female">Female Voice (e.g., Sarah)</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onSubmit}
          disabled={!value.role || (isTechnical && !value.domain)}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-button font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm"
        >
          <Target className="w-5 h-5" />
          Start Interview
        </button>
      </div>
    </div>
  );
}
