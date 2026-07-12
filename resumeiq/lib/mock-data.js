// ============================================
// RESUMEIQ AI - Complete Mock Data
// ============================================

// ---- User Profile ----
export const mockUser = {
  id: "user-001",
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  avatar: null,
  role: "Software Engineer",
  location: "San Francisco, CA",
  joinedAt: "2024-01-15",
  plan: "Pro",
  stats: {
    resumesAnalyzed: 12,
    avgScore: 78,
    jobsApplied: 34,
    interviewsLanded: 8,
  },
};

// ---- Resume Analysis Results ----
export const mockAnalysis = {
  id: "analysis-001",
  fileName: "Alex_Johnson_Resume_v3.pdf",
  uploadedAt: "2026-07-10T10:30:00Z",
  jobTitle: "Senior Frontend Engineer",
  company: "Stripe",
  overallScore: 82,
  atsScore: 74,
  jobMatch: 88,
  resumeHealth: 79,

  sectionScores: [
    { section: "Summary", score: 85, max: 100 },
    { section: "Experience", score: 88, max: 100 },
    { section: "Projects", score: 80, max: 100 },
    { section: "Education", score: 95, max: 100 },
    { section: "Skills", score: 72, max: 100 },
    { section: "Formatting", score: 70, max: 100 },
  ],

  radarData: [
    { subject: "Content", A: 82, fullMark: 100 },
    { subject: "Keywords", A: 74, fullMark: 100 },
    { subject: "Format", A: 70, fullMark: 100 },
    { subject: "Impact", A: 88, fullMark: 100 },
    { subject: "Skills", A: 72, fullMark: 100 },
    { subject: "Clarity", A: 85, fullMark: 100 },
  ],

  barData: [
    { name: "Summary", score: 85, prev: 70 },
    { name: "Experience", score: 88, prev: 65 },
    { name: "Projects", score: 80, prev: 55 },
    { name: "Education", score: 95, prev: 90 },
    { name: "Skills", score: 72, prev: 60 },
    { name: "Format", score: 70, prev: 50 },
  ],

  strengths: [
    "Strong quantified achievements in Experience section",
    "Clear project descriptions with measurable outcomes",
    "Excellent educational background with relevant coursework",
    "Good use of action verbs throughout resume",
    "Clean, professional formatting and layout",
  ],

  weaknesses: [
    "Missing several high-value ATS keywords for this role",
    "Summary section could be more targeted to this position",
    "Skills section lacks proficiency levels",
    "No GitHub or portfolio link included",
    "Work experience bullets could use stronger metrics",
  ],

  missingSkills: [
    { skill: "TypeScript", priority: "high" },
    { skill: "GraphQL", priority: "high" },
    { skill: "AWS", priority: "medium" },
    { skill: "Docker", priority: "medium" },
    { skill: "Testing (Jest/Cypress)", priority: "high" },
    { skill: "System Design", priority: "low" },
    { skill: "WebSockets", priority: "low" },
    { skill: "Redis", priority: "medium" },
    { skill: "CI/CD Pipelines", priority: "medium" },
    { skill: "Storybook", priority: "low" },
  ],

  suggestedProjects: [
    {
      title: "Real-time Dashboard with WebSockets",
      description:
        "Build a live analytics dashboard using React and WebSockets to demonstrate real-time data handling skills.",
      tags: ["React", "WebSockets", "Node.js"],
      impact: "High",
    },
    {
      title: "E-commerce Platform with TypeScript",
      description:
        "Full-stack TypeScript project with Next.js, GraphQL, and Stripe integration.",
      tags: ["TypeScript", "GraphQL", "Next.js"],
      impact: "High",
    },
    {
      title: "CI/CD Pipeline Setup",
      description:
        "Showcase DevOps skills by setting up a complete CI/CD pipeline with GitHub Actions and Docker.",
      tags: ["Docker", "GitHub Actions", "AWS"],
      impact: "Medium",
    },
  ],

  aiSuggestions: [
    {
      section: "Summary",
      original:
        "Experienced frontend developer with 5 years of experience building web applications.",
      improved:
        "Results-driven Senior Frontend Engineer with 5+ years building scalable React applications. Passionate about performance optimization, developer experience, and shipping pixel-perfect UIs. Looking to bring deep TypeScript and system design expertise to a high-growth fintech team.",
      reason:
        "More specific to the role, includes keywords, and communicates clear value proposition.",
    },
    {
      section: "Experience",
      original:
        "Worked on improving the checkout flow at Acme Corp.",
      improved:
        "Led end-to-end redesign of checkout flow reducing cart abandonment by 34% and increasing conversion rate by 18% — generating $2.1M in additional annual revenue.",
      reason:
        "Quantified impact makes this bullet far more compelling to hiring managers.",
    },
    {
      section: "Skills",
      original: "React, JavaScript, CSS, HTML, Git",
      improved:
        "React, Next.js, TypeScript, JavaScript (ES2024+), Tailwind CSS, GraphQL, REST APIs, Git, Jest, AWS, Docker, Figma",
      reason:
        "Added role-relevant keywords missing from the original that ATS systems scan for.",
    },
  ],

  interviewQuestions: [
    {
      category: "Technical",
      question:
        "Walk me through how you'd architect a real-time collaborative editor using React.",
      tip: "Mention WebSockets, conflict resolution (CRDT or OT), state management, and performance optimizations.",
    },
    {
      category: "Technical",
      question:
        "How do you approach performance optimization in a large React application?",
      tip: "Discuss code splitting, lazy loading, memoization, virtualization, and profiling tools.",
    },
    {
      category: "Behavioral",
      question:
        "Tell me about a time you disagreed with a technical decision and how you handled it.",
      tip: "Use STAR framework. Focus on data-driven reasoning and collaborative resolution.",
    },
    {
      category: "System Design",
      question: "Design a URL shortener with analytics. Walk me through your approach.",
      tip: "Discuss hashing, database design, caching layer, analytics pipeline, and scale considerations.",
    },
    {
      category: "Culture Fit",
      question: "What excites you most about working at Stripe specifically?",
      tip: "Research Stripe's products, mission, and engineering blog before your interview.",
    },
    {
      category: "Technical",
      question: "Explain the difference between TypeScript generics and any type. When would you use each?",
      tip: "Show deep TypeScript knowledge. Generics preserve type safety while 'any' bypasses it.",
    },
  ],
};

// ---- Analysis History ----
export const mockHistory = [
  {
    id: "analysis-001",
    fileName: "Alex_Johnson_Resume_v3.pdf",
    jobTitle: "Senior Frontend Engineer",
    company: "Stripe",
    uploadedAt: "2026-07-10T10:30:00Z",
    overallScore: 82,
    atsScore: 74,
    jobMatch: 88,
    status: "completed",
  },
  {
    id: "analysis-002",
    fileName: "Alex_Johnson_Resume_v2.pdf",
    jobTitle: "Full Stack Developer",
    company: "Vercel",
    uploadedAt: "2026-07-05T14:20:00Z",
    overallScore: 71,
    atsScore: 68,
    jobMatch: 75,
    status: "completed",
  },
  {
    id: "analysis-003",
    fileName: "Alex_Johnson_Resume_v2.pdf",
    jobTitle: "React Developer",
    company: "Linear",
    uploadedAt: "2026-06-28T09:15:00Z",
    overallScore: 65,
    atsScore: 60,
    jobMatch: 70,
    status: "completed",
  },
  {
    id: "analysis-004",
    fileName: "Alex_Johnson_Resume_v1.pdf",
    jobTitle: "Frontend Developer",
    company: "GitHub",
    uploadedAt: "2026-06-20T16:45:00Z",
    overallScore: 58,
    atsScore: 52,
    jobMatch: 62,
    status: "completed",
  },
  {
    id: "analysis-005",
    fileName: "Alex_Johnson_Resume_v1.pdf",
    jobTitle: "UI Engineer",
    company: "Figma",
    uploadedAt: "2026-06-15T11:00:00Z",
    overallScore: 54,
    atsScore: 49,
    jobMatch: 58,
    status: "completed",
  },
  {
    id: "analysis-006",
    fileName: "Alex_Johnson_Resume_draft.pdf",
    jobTitle: "Software Engineer II",
    company: "Notion",
    uploadedAt: "2026-06-08T08:30:00Z",
    overallScore: 47,
    atsScore: 43,
    jobMatch: 51,
    status: "completed",
  },
];

// ---- Dashboard Stats ----
export const mockDashboardStats = [
  {
    label: "Resume Score",
    value: 82,
    unit: "/100",
    change: "+14",
    trend: "up",
    color: "primary",
    icon: "FileText",
  },
  {
    label: "ATS Score",
    value: 74,
    unit: "/100",
    change: "+22",
    trend: "up",
    color: "accent",
    icon: "Target",
  },
  {
    label: "Job Match",
    value: 88,
    unit: "%",
    change: "+26",
    trend: "up",
    color: "success",
    icon: "Briefcase",
  },
  {
    label: "Analyses Done",
    value: 12,
    unit: "",
    change: "+3",
    trend: "up",
    color: "warning",
    icon: "BarChart",
  },
];

// ---- Activity Timeline ----
export const mockActivity = [
  {
    id: 1,
    action: "Resume analyzed for Stripe",
    detail: "Score: 82/100 — Strong match!",
    time: "2026-07-10T10:30:00Z",
    type: "analysis",
    score: 82,
  },
  {
    id: 2,
    action: "Resume uploaded",
    detail: "Alex_Johnson_Resume_v3.pdf",
    time: "2026-07-10T10:25:00Z",
    type: "upload",
  },
  {
    id: 3,
    action: "Resume analyzed for Vercel",
    detail: "Score: 71/100 — Good match",
    time: "2026-07-05T14:20:00Z",
    type: "analysis",
    score: 71,
  },
  {
    id: 4,
    action: "Profile updated",
    detail: "Added LinkedIn and GitHub links",
    time: "2026-07-02T09:00:00Z",
    type: "profile",
  },
  {
    id: 5,
    action: "Resume analyzed for Linear",
    detail: "Score: 65/100 — Fair match",
    time: "2026-06-28T09:15:00Z",
    type: "analysis",
    score: 65,
  },
];

// ---- Testimonials ----
export const mockTestimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    avatar: null,
    initials: "SC",
    rating: 5,
    text: "ResumeIQ helped me go from 0 callbacks to 5 interview invites in a single week. The ATS score feature is a game-changer. I landed my dream job at Google!",
    tags: ["ATS Score", "Interview Prep"],
  },
  {
    id: 2,
    name: "Marcus Williams",
    role: "Product Manager",
    company: "Airbnb",
    avatar: null,
    initials: "MW",
    rating: 5,
    text: "I was skeptical at first, but after following the AI suggestions my resume went from a 52 to an 89 score. The skill gap analysis alone is worth the subscription.",
    tags: ["Skill Gap", "AI Suggestions"],
  },
  {
    id: 3,
    name: "Priya Patel",
    role: "Data Scientist",
    company: "Meta",
    avatar: null,
    initials: "PP",
    rating: 5,
    text: "The job match feature told me exactly what keywords I was missing for each role. After optimizing, my response rate jumped from 5% to 40%. Incredible tool.",
    tags: ["Job Match", "Keywords"],
  },
  {
    id: 4,
    name: "James Rodriguez",
    role: "UX Designer",
    company: "Figma",
    avatar: null,
    initials: "JR",
    rating: 5,
    text: "As a designer, I thought my resume was already great. ResumeIQ showed me I was missing critical ATS keywords. Three weeks later, I'm a full-time Figma employee.",
    tags: ["ATS", "Keywords"],
  },
  {
    id: 5,
    name: "Emma Thompson",
    role: "Marketing Lead",
    company: "Shopify",
    avatar: null,
    initials: "ET",
    rating: 5,
    text: "The interview questions section is brilliant. It generated role-specific questions I could actually practice. I felt so prepared walking into every interview.",
    tags: ["Interview Questions", "Preparation"],
  },
  {
    id: 6,
    name: "David Kim",
    role: "Backend Engineer",
    company: "Stripe",
    avatar: null,
    initials: "DK",
    rating: 5,
    text: "ResumeIQ is the best investment I've made in my career. From upload to offer letter in under a month. The AI rewrites are genuinely impressive.",
    tags: ["AI Rewrite", "Resume Score"],
  },
];

// ---- Pricing Plans ----
export const mockPricingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    period: "forever",
    description: "Get started with basic resume analysis",
    badge: null,
    features: [
      "3 resume analyses per month",
      "Basic ATS score",
      "Keyword extraction",
      "PDF & DOCX support",
      "Email support",
    ],
    notIncluded: [
      "Job description matching",
      "AI suggestions",
      "Interview questions",
      "History & tracking",
      "Priority support",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    period: "month",
    description: "Everything you need for a successful job search",
    badge: "Most Popular",
    features: [
      "Unlimited resume analyses",
      "Advanced ATS scoring",
      "Job description matching",
      "AI-powered suggestions",
      "Interview Q&A generation",
      "Skill gap analysis",
      "Resume history tracking",
      "AI resume rewriting",
      "Priority support",
    ],
    notIncluded: [],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 49,
    period: "month",
    description: "Advanced features for power users and teams",
    badge: null,
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom branding",
      "API access",
      "Bulk analysis",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    highlighted: false,
  },
];

// ---- FAQ ----
export const mockFAQ = [
  {
    q: "How does ResumeIQ's ATS scoring work?",
    a: "Our AI analyzes your resume against industry-standard ATS algorithms, checking for keyword density, formatting compatibility, section headers, and content structure. We simulate how top ATS systems like Greenhouse, Lever, and Workday parse your resume.",
  },
  {
    q: "What file formats do you support?",
    a: "We support PDF and DOCX formats. For best results, we recommend uploading a clean, text-based PDF. Image-based PDFs or scanned documents may have reduced accuracy.",
  },
  {
    q: "How accurate is the job match percentage?",
    a: "Our job match algorithm compares your resume's skills, experience, and keywords against the job description using semantic analysis. It typically achieves 85%+ accuracy compared to human recruiter assessments.",
  },
  {
    q: "Is my resume data private and secure?",
    a: "Absolutely. Your resume data is encrypted in transit and at rest. We never share, sell, or train on your personal data without explicit consent. You can delete your data at any time from the Settings page.",
  },
  {
    q: "Can I analyze my resume for multiple job descriptions?",
    a: "Yes! Pro and Enterprise plans include unlimited analyses. You can upload the same resume multiple times with different job descriptions to get tailored scores and suggestions for each role.",
  },
  {
    q: "How does the AI suggestion feature work?",
    a: "Our AI reads your existing resume content and generates improved versions of each section optimized for your target role. Suggestions focus on quantifying impact, adding relevant keywords, and improving clarity.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel at any time with no questions asked. Your access continues until the end of your current billing period, and you won't be charged again.",
  },
  {
    q: "Do you offer student or nonprofit discounts?",
    a: "Yes! We offer 50% discounts for verified students and nonprofit employees. Contact our support team with verification and we'll set you up with the discount.",
  },
];

// ---- Companies (Trusted By) ----
export const trustedCompanies = [
  "Google",
  "Meta",
  "Stripe",
  "Vercel",
  "Airbnb",
  "Figma",
  "GitHub",
  "Notion",
  "Linear",
  "Shopify",
  "Atlassian",
  "Salesforce",
  "Netflix",
  "Spotify",
  "Dropbox",
];

// ---- Features ----
export const features = [
  {
    id: 1,
    icon: "Target",
    title: "ATS Score Analysis",
    description:
      "Get a precise ATS compatibility score with detailed breakdown of how applicant tracking systems read your resume.",
    color: "primary",
    gradient: "from-blue-500/20 to-blue-600/5",
  },
  {
    id: 2,
    icon: "Sparkles",
    title: "AI-Powered Suggestions",
    description:
      "Receive intelligent, context-aware suggestions that transform weak bullet points into compelling achievements.",
    color: "accent",
    gradient: "from-indigo-500/20 to-indigo-600/5",
  },
  {
    id: 3,
    icon: "GitCompare",
    title: "Skill Gap Analysis",
    description:
      "Identify exactly which skills you're missing for your target role and get a personalized learning roadmap.",
    color: "success",
    gradient: "from-green-500/20 to-green-600/5",
  },
  {
    id: 4,
    icon: "Briefcase",
    title: "Job Description Match",
    description:
      "Upload any job posting and instantly see how well your resume matches — keyword by keyword.",
    color: "warning",
    gradient: "from-amber-500/20 to-amber-600/5",
  },
  {
    id: 5,
    icon: "MessageSquare",
    title: "Interview Questions",
    description:
      "Get personalized interview questions based on your resume and target role. Practice before the real thing.",
    color: "purple",
    gradient: "from-purple-500/20 to-purple-600/5",
  },
  {
    id: 6,
    icon: "RefreshCw",
    title: "AI Resume Rewrite",
    description:
      "Let our AI rewrite your entire resume optimized for your target role, ATS systems, and human readers.",
    color: "cyan",
    gradient: "from-cyan-500/20 to-cyan-600/5",
  },
];

// ---- How It Works Steps ----
export const howItWorksSteps = [
  {
    step: "01",
    title: "Upload Your Resume",
    description:
      "Drag and drop your resume in PDF or DOCX format. Optionally paste a job description for targeted analysis.",
    icon: "Upload",
  },
  {
    step: "02",
    title: "AI Analyzes Everything",
    description:
      "Our AI engine reads your resume, checks ATS compatibility, extracts skills, and matches against job requirements in seconds.",
    icon: "Brain",
  },
  {
    step: "03",
    title: "Get Actionable Insights",
    description:
      "Receive a detailed report with scores, suggestions, missing skills, and interview prep — ready to act on immediately.",
    icon: "TrendingUp",
  },
];

// ---- Statistics ----
export const stats = [
  { value: 250000, label: "Resumes Analyzed", suffix: "+" },
  { value: 94, label: "Interview Rate Improvement", suffix: "%" },
  { value: 12000, label: "Jobs Landed", suffix: "+" },
  { value: 4.9, label: "Average Rating", suffix: "/5" },
];

// ---- Achievements ----
export const achievements = [
  { id: 1, name: "First Upload", description: "Uploaded your first resume", icon: "Upload", earned: true },
  { id: 2, name: "Score Climber", description: "Improved score by 20+ points", icon: "TrendingUp", earned: true },
  { id: 3, name: "ATS Master", description: "Achieved 80+ ATS score", icon: "Target", earned: false },
  { id: 4, name: "Job Matcher", description: "Matched 10 job descriptions", icon: "Briefcase", earned: true },
  { id: 5, name: "Skill Builder", description: "Added 10 missing skills", icon: "Zap", earned: false },
  { id: 6, name: "Pro Analyst", description: "Completed 10 analyses", icon: "BarChart", earned: true },
];

// ---- Quick Actions ----
export const quickActions = [
  { icon: "Upload", label: "New Analysis", href: "/dashboard/upload", color: "primary" },
  { icon: "History", label: "View History", href: "/dashboard/history", color: "accent" },
  { icon: "User", label: "Edit Profile", href: "/dashboard/profile", color: "success" },
  { icon: "Settings", label: "Settings", href: "/dashboard/settings", color: "muted" },
];
