# ResumeIQ AI

ResumeIQ AI is a commercial-grade, premium AI-powered resume analysis SaaS platform designed to help students and professionals optimize their resumes using artificial intelligence. The application features a state-of-the-art dark theme, premium visual design, micro-interactions, and responsive layouts inspired by world-class tools like Linear, Stripe, Vercel, and GitHub.

---

## 🚀 Key Features

- **🏠 Premium Landing Page**: Fully structured and optimized, including a high-impact Hero section, animated feature showcases, trusted company marquee, step-by-step pipeline workflow, pricing tiers, and interactive accordion FAQs.
- **📊 Interactive Dashboard**: Displays essential metrics (Resume Score, ATS Score, Job Match) alongside a visual timeline of recent user activities, quick action shortcuts, and a multi-file analysis progression tracker.
- **📤 Upload & Targeted Analysis**: Features an interactive drag-and-drop zone with full file validation, alongside a dedicated field to paste specific job descriptions for target-oriented matching.
- **⏳ Visual Pipeline Loader**: Multi-step AI processing simulation with detailed progression updates and a smooth GSAP-powered status loader.
- **📈 Comprehensive Report Details**: Visualizes resume quality using Radar and Bar chart analytics, highlights strengths, flags weaknesses, lists missing target skills, and generates customized project roadmaps and interview preparation guides.
- **🗂️ Analysis History & Search**: Unified center to search, filter, sort, review, or delete past resume evaluations.
- **👤 User Profile & Gamification**: Displays user performance analytics, recent logs, and unlocked milestone achievement badges.
- **⚙️ Settings Panel**: Unified settings for appearance (theme & accent colors), notification toggles, language preferences, data privacy configurations, and a safety-modal-equipped Account deletion area.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, JavaScript)
- **Styling**: Tailwind CSS v4 (Sleek Dark Mode, Modern Utility Classes)
- **Database/Auth Integration**: Supabase (via `@supabase/supabase-js` & `@supabase/ssr`)
- **Animation Suite**: GSAP (ScrollTrigger, text stagger, orb drifts) + Framer Motion (page transitions, collapsible sidebar, interactive rings, accordions)
- **Data Visualizations**: Recharts
- **Iconography**: Lucide React
- **Fonts**: Poppins (Headings) & Inter (Body) via Google Fonts

---

## 📁 Repository Structure

```
d:\ai resume analyzser\
├── resumeiq/                   # Next.js Application Root
│   ├── app/                    # App Router Layouts and Pages
│   │   ├── layout.jsx          # Root Layout & Font definitions
│   │   ├── page.jsx            # Landing Page
│   │   ├── login/              # Login Page
│   │   ├── signup/             # Signup Page
│   │   └── dashboard/          # Dashboard Panel & nested interfaces
│   │       ├── layout.jsx      # Sidebar & Top Navigation Shell
│   │       ├── page.jsx        # Dashboard Main View
│   │       ├── upload/         # Resume Upload Portal
│   │       ├── loading-analysis/ # Analysis Loading view
│   │       ├── analysis/[id]/  # Full Analysis Report
│   │       ├── history/        # Analysis History Hub
│   │       ├── profile/        # User Profile & Achievements
│   │       └── settings/       # Settings Hub
│   ├── components/             # Reusable UI Components
│   │   ├── landing/            # Landing Page Specific Elements
│   │   └── dashboard/          # Sidebar, Navbar, and Dashboard Widgets
│   ├── lib/                    # Configuration and Utilities
│   │   ├── utils.js            # Standard Formatting and Color Helpers
│   │   ├── mock-data.js        # Realistic Preloaded Metrics & History
│   │   └── supabase/           # Client and Admin Supabase Clients
│   ├── public/                 # Static Assets
│   ├── globals.css             # Tailwind v4 Variables & Custom Core Styles
│   ├── next.config.mjs         # Package Optimization Config
│   ├── tailwind.config.js      # Animation Keyframes Config
│   ├── .env.local              # Local Credentials (git-ignored)
│   └── .env.example            # Empty Configuration Credentials Template
└── LICENSE                     # Open-source License
```

---

## ⚡ Getting Started

### 1. Clone & Install Dependencies
Navigate to the project subdirectory and install the required npm packages:
```bash
cd resumeiq
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
cp .env.example .env.local
```

Open `.env.local` and configure:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_REF=your-project-ref

# AI Provider Credentials (NVIDIA NIM)
NVIDIA_API_KEY=your-nvidia-api-key
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
```

### 3. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 🔒 Security & Best Practices

- **Supabase Keys**: Public access uses the client-side `supabase` client with the `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Administrative operations are handled via `supabaseAdmin` using the service role key and are executed strictly on server-side functions.
- **Git Safety**: `.env.local` is added to `.gitignore` to prevent secret credentials leakage.

---

## 🤖 AI Architecture (NVIDIA NIM)

ResumeIQ utilizes a clean provider abstraction for its AI features, ensuring high maintainability and easy swapping of underlying models (NVIDIA, OpenAI, Gemini). Currently, the system uses the NVIDIA NIM API for fast, high-quality inference.

### Folder Structure
All AI logic is centralized in the `/lib/ai/` directory:
- `provider.js`: The core abstraction handling API calls, retries, timeouts, rate-limit awareness, JSON parsing safeguards, and logging.
- `nvidia.js`: The NVIDIA OpenAI-compatible client configuration.
- `prompts.js`: Centralized prompt templates for various generation and evaluation features. No prompts are hardcoded inside React components.
- `voice.js`: Stubs and placeholders for upcoming voice-based AI interview capabilities.

### How to Switch AI Providers
Because the `provider.js` uses the standard `openai` Node.js SDK pointed at the NVIDIA base URL, switching back to standard OpenAI (or another compatible provider) is trivial:
1. Update `NVIDIA_API_KEY` to `OPENAI_API_KEY` (or the respective provider key).
2. Remove or change the `NVIDIA_BASE_URL` in `nvidia.js`.
3. Change the default `model` string in `provider.js` to the desired model (e.g., `gpt-4o`).

### How to Add New Prompt Templates
To introduce a new AI feature:
1. Define a new template string in `/lib/ai/prompts.js` and export it.
2. Create a new API route in `/app/api/interview/` (e.g., `/app/api/interview/coding/route.js`).
3. Import the `generateAIResponse` from `/lib/ai/provider.js` and your new prompt template.
4. Pass the prompt and user data to `generateAIResponse`, which safely returns the generated JSON.
